from __future__ import annotations
from decimal import Decimal
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from apps.impact.models import Achievement, AlumniAchievement, Contribution, ScoreTransaction

SCORING_POLICY_VERSION = "IMPACT_SCORING_V1"

# Base score lookup table for fixed action types
BASE_POINTS = {
    # Career Impact
    Contribution.ActionType.ALUMNI_HIRED: 150,
    Contribution.ActionType.STUDENT_INTERNSHIP: 80,
    Contribution.ActionType.JOB_PLACEMENT_CONFIRMED: 100,
    # Mentorship Impact
    Contribution.ActionType.MENTORSHIP_COMPLETED: 60,
    Contribution.ActionType.MENTEE_OUTCOME_VERIFIED: 90,
    # University Contribution (Fixed non-financial types)
    Contribution.ActionType.UNIVERSITY_PROJECT_SUPPORT: 120,
    Contribution.ActionType.EQUIPMENT_SUPPORT: 150,
    Contribution.ActionType.SCHOLARSHIP_SUPPORT: 160,
    # Community Contribution
    Contribution.ActionType.EVENT_ORGANIZED: 100,
    Contribution.ActionType.MASTERCLASS_DELIVERED: 50,
    Contribution.ActionType.EVENT_SPEAKER: 40,
    Contribution.ActionType.COMMUNITY_INITIATIVE: 50,
}

# Tier-based scoring for financial / institutional aid (to avoid linear money-to-points bias)
FINANCIAL_TIERS = [
    (Decimal("500000000"), 500),  # 500 mln+ UZS
    (Decimal("100000000"), 350),  # 100m - 500m UZS
    (Decimal("50000000"), 250),   # 50m - 100m UZS
    (Decimal("20000000"), 180),   # 20m - 50m UZS
    (Decimal("5000000"), 100),    # 5m - 20m UZS
    (Decimal("1000000"), 50),     # 1m - 5m UZS
]


def calculate_points(action_type: str, metadata: dict | None = None) -> int:
    """
    Calculates impact points based on action type and metadata using versioned rules.
    Never accepts client-injected raw point scores.
    """
    metadata = metadata or {}

    # Check for tier-based financial support
    if action_type == Contribution.ActionType.FINANCIAL_SUPPORT:
        amount_raw = metadata.get("amount")
        if amount_raw is not None:
            try:
                amount = Decimal(str(amount_raw))
                for threshold, tier_points in FINANCIAL_TIERS:
                    if amount >= threshold:
                        return tier_points
                return 30  # Minimum baseline contribution
            except (ValueError, TypeError):
                return 30
        return 50

    return BASE_POINTS.get(action_type, 30)


@transaction.atomic
def verify_contribution(
    contribution_id: int,
    verified_by_user,
    verification_note: str = "",
) -> Contribution:
    """
    Verifies a contribution, generates immutable ledger score transactions,
    and updates achievement statuses atomically.
    Includes concurrency locking via select_for_update().
    """
    contribution = (
        Contribution.objects.select_for_update()
        .select_related("alumni")
        .filter(pk=contribution_id)
        .first()
    )

    if not contribution:
        raise ValidationError("Hissa arizasi topilmadi.")

    if contribution.status == Contribution.Status.VERIFIED:
        # Already verified (idempotency safeguard)
        return contribution

    if contribution.status == Contribution.Status.REVOKED:
        raise ValidationError("Bekor qilingan hissa qayta tasdiqlanmaydi.")

    # Calculate points according to rule
    points = calculate_points(contribution.action_type, contribution.metadata)

    # Check if a score transaction was already awarded for this contribution
    existing_award = ScoreTransaction.objects.filter(
        contribution=contribution,
        transaction_type=ScoreTransaction.TransactionType.AWARD,
    ).exists()

    if not existing_award:
        ScoreTransaction.objects.create(
            alumni=contribution.alumni,
            contribution=contribution,
            category=contribution.category,
            points=points,
            transaction_type=ScoreTransaction.TransactionType.AWARD,
            scoring_rule_version=SCORING_POLICY_VERSION,
            reason=f"Tasdiqlandi: {contribution.title}",
        )

    contribution.status = Contribution.Status.VERIFIED
    contribution.verified_at = timezone.now()
    contribution.verified_by = verified_by_user
    if verification_note:
        contribution.metadata["verification_note"] = verification_note
    contribution.save(update_fields=["status", "verified_at", "verified_by", "metadata", "updated_at"])

    # Check achievements
    check_and_award_achievements(contribution.alumni)

    return contribution


@transaction.atomic
def reject_contribution(
    contribution_id: int,
    reviewed_by_user,
    reason: str,
) -> Contribution:
    """
    Rejects a pending contribution with a clear reason.
    """
    contribution = (
        Contribution.objects.select_for_update()
        .filter(pk=contribution_id)
        .first()
    )

    if not contribution:
        raise ValidationError("Hissa arizasi topilmadi.")

    if contribution.status == Contribution.Status.VERIFIED:
        raise ValidationError("Tasdiqlangan hissa to‘g‘ridan-to‘g‘ri rad etilmaydi. Uni bekor qilish (revoke) kerak.")

    contribution.status = Contribution.Status.REJECTED
    contribution.rejection_reason = reason
    contribution.verified_by = reviewed_by_user
    contribution.verified_at = timezone.now()
    contribution.save(update_fields=["status", "rejection_reason", "verified_by", "verified_at", "updated_at"])

    return contribution


@transaction.atomic
def revoke_contribution(
    contribution_id: int,
    revoked_by_user,
    reason: str,
) -> Contribution:
    """
    Revokes an existing verified contribution by creating a reversal transaction.
    Original score transaction is NOT deleted to maintain full auditability.
    """
    contribution = (
        Contribution.objects.select_for_update()
        .select_related("alumni")
        .filter(pk=contribution_id)
        .first()
    )

    if not contribution:
        raise ValidationError("Hissa arizasi topilmadi.")

    if contribution.status != Contribution.Status.VERIFIED:
        raise ValidationError("Faqat tasdiqlangan hissa bekor qilinishi mumkin.")

    # Find the original awarded points
    award_tx = ScoreTransaction.objects.filter(
        contribution=contribution,
        transaction_type=ScoreTransaction.TransactionType.AWARD,
    ).first()

    points_to_revert = award_tx.points if award_tx else calculate_points(contribution.action_type, contribution.metadata)

    # Check if already reversed
    already_reversed = ScoreTransaction.objects.filter(
        contribution=contribution,
        transaction_type=ScoreTransaction.TransactionType.REVERSAL,
    ).exists()

    if not already_reversed and points_to_revert > 0:
        ScoreTransaction.objects.create(
            alumni=contribution.alumni,
            contribution=contribution,
            category=contribution.category,
            points=-points_to_revert,
            transaction_type=ScoreTransaction.TransactionType.REVERSAL,
            scoring_rule_version=SCORING_POLICY_VERSION,
            reason=f"Bekor qilindi: {reason}",
        )

    contribution.status = Contribution.Status.REVOKED
    contribution.rejection_reason = reason
    contribution.verified_by = revoked_by_user
    contribution.verified_at = timezone.now()
    contribution.save(update_fields=["status", "rejection_reason", "verified_by", "verified_at", "updated_at"])

    return contribution


def check_and_award_achievements(alumni) -> list[Achievement]:
    """
    Checks if an alumnus qualifies for active achievements and awards them.
    """
    from django.db.models import Count, Sum

    awarded = []
    active_achievements = Achievement.objects.filter(is_active=True)

    # Total verified counts per category
    category_counts = dict(
        Contribution.objects.filter(
            alumni=alumni,
            status=Contribution.Status.VERIFIED,
        )
        .values("category")
        .annotate(total=Count("id"))
        .values_list("category", "total")
    )

    for ach in active_achievements:
        count = category_counts.get(ach.category, 0)
        if count >= ach.threshold:
            _, created = AlumniAchievement.objects.get_or_create(
                alumni=alumni,
                achievement=ach,
            )
            if created:
                awarded.append(ach)

    return awarded
