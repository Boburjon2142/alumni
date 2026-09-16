from django.db.models import Case, Count, F, IntegerField, Q, Sum, Value, When
from django.db.models.functions import Coalesce
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.alumni.models import AlumniProfile
from common.pagination import StandardPagination
from .models import Achievement, AlumniAchievement, Contribution, ScoreTransaction
from .permissions import IsStaffOrAdmin
from .serializers import (
    AchievementSerializer,
    ContributionDetailSerializer,
    ContributionPublicSerializer,
    ContributionSubmitSerializer,
    RankingEntrySerializer,
    ScoreTransactionSerializer,
)
from .services.scoring import (
    reject_contribution,
    revoke_contribution,
    verify_contribution,
)


class ImpactRankingView(APIView):
    """
    Public API to retrieve calculated impact rankings with period, category,
    faculty, and graduation year segmentation.
    Uses efficient single-query database aggregation.
    """
    permission_classes = (permissions.AllowAny,)
    pagination_class = StandardPagination

    def get(self, request):
        period = request.query_params.get("period", "year")
        category_filter = request.query_params.get("category", "all")
        faculty_id = request.query_params.get("faculty")
        graduation_year = request.query_params.get("graduation_year")
        search = request.query_params.get("search", "").strip()

        now = timezone.now()
        current_year = now.year

        # Base filter for score transactions
        tx_filter = Q()
        if period == "year":
            tx_filter &= Q(score_transactions__created_at__year=current_year)

        # Base alumni queryset
        alumni_qs = AlumniProfile.objects.filter(is_published=True).select_related("faculty", "specialty")

        if faculty_id and faculty_id.isdigit():
            alumni_qs = alumni_qs.filter(faculty_id=int(faculty_id))

        if graduation_year and graduation_year.isdigit():
            alumni_qs = alumni_qs.filter(graduation_year=int(graduation_year))

        if search:
            alumni_qs = alumni_qs.filter(
                Q(full_name__icontains=search)
                | Q(position__icontains=search)
                | Q(current_company__icontains=search)
            )

        # Aggregation of category scores and total score
        alumni_qs = alumni_qs.annotate(
            total_score=Coalesce(
                Sum("score_transactions__points", filter=tx_filter),
                0,
                output_field=IntegerField(),
            ),
            career_score=Coalesce(
                Sum(
                    "score_transactions__points",
                    filter=tx_filter & Q(score_transactions__category=Contribution.Category.CAREER),
                ),
                0,
                output_field=IntegerField(),
            ),
            mentorship_score=Coalesce(
                Sum(
                    "score_transactions__points",
                    filter=tx_filter & Q(score_transactions__category=Contribution.Category.MENTORSHIP),
                ),
                0,
                output_field=IntegerField(),
            ),
            university_score=Coalesce(
                Sum(
                    "score_transactions__points",
                    filter=tx_filter & Q(score_transactions__category=Contribution.Category.UNIVERSITY),
                ),
                0,
                output_field=IntegerField(),
            ),
            community_score=Coalesce(
                Sum(
                    "score_transactions__points",
                    filter=tx_filter & Q(score_transactions__category=Contribution.Category.COMMUNITY),
                ),
                0,
                output_field=IntegerField(),
            ),
            verified_contributions_count=Coalesce(
                Count(
                    "contributions",
                    filter=Q(contributions__status=Contribution.Status.VERIFIED)
                    & (Q(contributions__occurred_at__year=current_year) if period == "year" else Q()),
                    distinct=True,
                ),
                0,
                output_field=IntegerField(),
            ),
        )

        # Category specific ordering or total ordering
        if category_filter == Contribution.Category.CAREER:
            alumni_qs = alumni_qs.filter(career_score__gt=0).order_by("-career_score", "-total_score", "full_name")
        elif category_filter == Contribution.Category.MENTORSHIP:
            alumni_qs = alumni_qs.filter(mentorship_score__gt=0).order_by("-mentorship_score", "-total_score", "full_name")
        elif category_filter == Contribution.Category.UNIVERSITY:
            alumni_qs = alumni_qs.filter(university_score__gt=0).order_by("-university_score", "-total_score", "full_name")
        elif category_filter == Contribution.Category.COMMUNITY:
            alumni_qs = alumni_qs.filter(community_score__gt=0).order_by("-community_score", "-total_score", "full_name")
        else:
            # Overall ranking: show profiles with score > 0 first
            alumni_qs = alumni_qs.filter(total_score__gt=0).order_by("-total_score", "-verified_contributions_count", "full_name")

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(alumni_qs, request)

        page_number = paginator.page.number if page is not None else 1
        page_size = paginator.page_size or 12
        start_rank = (page_number - 1) * page_size + 1

        entries = []
        for index, item in enumerate(page if page is not None else alumni_qs):
            # Calculate top impact area
            category_points = [
                (Contribution.Category.CAREER, item.career_score, "Karyera"),
                (Contribution.Category.MENTORSHIP, item.mentorship_score, "Ustozlik"),
                (Contribution.Category.UNIVERSITY, item.university_score, "Universitet"),
                (Contribution.Category.COMMUNITY, item.community_score, "Hamjamiyat"),
            ]
            top_cat = max(category_points, key=lambda x: x[1])
            top_cat_key = top_cat[0] if top_cat[1] > 0 else "general"
            top_cat_display = top_cat[2] if top_cat[1] > 0 else "Umumiy"

            entries.append({
                "rank": start_rank + index,
                "alumni": item,
                "total_score": item.total_score,
                "career_score": item.career_score,
                "mentorship_score": item.mentorship_score,
                "university_score": item.university_score,
                "community_score": item.community_score,
                "verified_contributions_count": item.verified_contributions_count,
                "top_category": top_cat_key,
                "top_category_display": top_cat_display,
            })

        serializer = RankingEntrySerializer(entries, many=True)
        return paginator.get_paginated_response(serializer.data)


class MyImpactView(APIView):
    """
    Returns the authenticated user's own impact overview:
    annual score, lifetime score, annual rank, category breakdown,
    recent score transactions, and verified contributions.
    """
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        user = request.user
        alumni = getattr(user, "alumni_profile", None)
        if not alumni:
            return Response(
                {"detail": "Foydalanuvchiga tegishli bitiruvchi profili topilmadi."},
                status=status.HTTP_404_NOT_FOUND,
            )

        now = timezone.now()
        current_year = now.year

        # Calculate lifetime score & annual score
        lifetime_score = (
            ScoreTransaction.objects.filter(alumni=alumni).aggregate(total=Sum("points"))["total"]
            or 0
        )
        annual_score = (
            ScoreTransaction.objects.filter(
                alumni=alumni, created_at__year=current_year
            ).aggregate(total=Sum("points"))["total"]
            or 0
        )

        # Calculate breakdown
        breakdown = {
            "career": ScoreTransaction.objects.filter(
                alumni=alumni, category=Contribution.Category.CAREER
            ).aggregate(total=Sum("points"))["total"] or 0,
            "mentorship": ScoreTransaction.objects.filter(
                alumni=alumni, category=Contribution.Category.MENTORSHIP
            ).aggregate(total=Sum("points"))["total"] or 0,
            "university": ScoreTransaction.objects.filter(
                alumni=alumni, category=Contribution.Category.UNIVERSITY
            ).aggregate(total=Sum("points"))["total"] or 0,
            "community": ScoreTransaction.objects.filter(
                alumni=alumni, category=Contribution.Category.COMMUNITY
            ).aggregate(total=Sum("points"))["total"] or 0,
        }

        # Calculate rank this year
        higher_annual_count = (
            AlumniProfile.objects.filter(is_published=True)
            .annotate(
                year_score=Coalesce(
                    Sum("score_transactions__points", filter=Q(score_transactions__created_at__year=current_year)),
                    0,
                    output_field=IntegerField(),
                )
            )
            .filter(year_score__gt=annual_score)
            .count()
        )
        annual_rank = higher_annual_count + 1 if annual_score > 0 else None

        # Recent transactions
        recent_transactions = ScoreTransaction.objects.filter(alumni=alumni).order_by("-created_at")[:10]
        recent_contributions = Contribution.objects.filter(alumni=alumni).order_by("-created_at")[:10]

        # Achievements
        achievements = [aa.achievement for aa in alumni.achievements_earned.select_related("achievement")]

        return Response({
            "alumni_id": alumni.id,
            "full_name": alumni.full_name,
            "annual_score": annual_score,
            "annual_rank": annual_rank,
            "lifetime_score": lifetime_score,
            "breakdown": breakdown,
            "recent_transactions": ScoreTransactionSerializer(recent_transactions, many=True).data,
            "recent_contributions": ContributionDetailSerializer(recent_contributions, many=True).data,
            "achievements": AchievementSerializer(achievements, many=True).data,
        })


class AlumniImpactDetailView(APIView):
    """
    Public safe overview of an alumnus's impact profile:
    overall score, category breakdown, verified public contributions,
    and awarded achievements.
    """
    permission_classes = (permissions.AllowAny,)

    def get(self, request, id_or_slug):
        if id_or_slug.isdigit():
            alumni = get_object_or_404(AlumniProfile, pk=int(id_or_slug), is_published=True)
        else:
            alumni = get_object_or_404(AlumniProfile, slug=id_or_slug, is_published=True)

        now = timezone.now()
        current_year = now.year

        lifetime_score = (
            ScoreTransaction.objects.filter(alumni=alumni).aggregate(total=Sum("points"))["total"]
            or 0
        )
        annual_score = (
            ScoreTransaction.objects.filter(
                alumni=alumni, created_at__year=current_year
            ).aggregate(total=Sum("points"))["total"]
            or 0
        )

        breakdown = {
            "career": ScoreTransaction.objects.filter(
                alumni=alumni, category=Contribution.Category.CAREER
            ).aggregate(total=Sum("points"))["total"] or 0,
            "mentorship": ScoreTransaction.objects.filter(
                alumni=alumni, category=Contribution.Category.MENTORSHIP
            ).aggregate(total=Sum("points"))["total"] or 0,
            "university": ScoreTransaction.objects.filter(
                alumni=alumni, category=Contribution.Category.UNIVERSITY
            ).aggregate(total=Sum("points"))["total"] or 0,
            "community": ScoreTransaction.objects.filter(
                alumni=alumni, category=Contribution.Category.COMMUNITY
            ).aggregate(total=Sum("points"))["total"] or 0,
        }

        # Public verified contributions (safe serializer, no raw financial amounts)
        verified_contributions = Contribution.objects.filter(
            alumni=alumni,
            status=Contribution.Status.VERIFIED,
        ).order_by("-occurred_at")[:20]

        achievements = [aa.achievement for aa in alumni.achievements_earned.select_related("achievement")]

        return Response({
            "alumni_id": alumni.id,
            "slug": alumni.slug,
            "full_name": alumni.full_name,
            "annual_score": annual_score,
            "lifetime_score": lifetime_score,
            "breakdown": breakdown,
            "verified_contributions": ContributionPublicSerializer(verified_contributions, many=True).data,
            "achievements": AchievementSerializer(achievements, many=True).data,
        })


class ContributionListCreateView(generics.ListCreateAPIView):
    """
    List contributions (staff sees all, alumni sees own) and submit new contributions.
    """
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = StandardPagination

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ContributionSubmitSerializer
        return ContributionDetailSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Contribution.objects.select_related("alumni", "verified_by")

        if user.is_staff or getattr(user, "role", "") in ["staff", "admin"]:
            # Staff can filter by status and category
            status_param = self.request.query_params.get("status")
            category_param = self.request.query_params.get("category")
            if status_param:
                qs = qs.filter(status=status_param)
            if category_param:
                qs = qs.filter(category=category_param)
            return qs

        # Regular alumni can only see their own contributions
        alumni = getattr(user, "alumni_profile", None)
        if not alumni:
            return Contribution.objects.none()
        return qs.filter(alumni=alumni)

    def perform_create(self, serializer):
        alumni = getattr(self.request.user, "alumni_profile", None)
        if not alumni:
            raise serializers.ValidationError("Anketa topshirish uchun avval bitiruvchi profili mavjud bo‘lishi kerak.")

        serializer.save(
            alumni=alumni,
            source_type=Contribution.SourceType.SELF_REPORTED,
            status=Contribution.Status.PENDING,
        )


class ContributionApproveView(APIView):
    """
    Staff/Admin only: Approves a pending contribution, awards points atomically,
    and updates achievements.
    """
    permission_classes = (IsStaffOrAdmin,)

    def post(self, request, pk):
        verification_note = request.data.get("verification_note", "").strip()
        try:
            contribution = verify_contribution(
                contribution_id=pk,
                verified_by_user=request.user,
                verification_note=verification_note,
            )
            return Response(ContributionDetailSerializer(contribution).data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ContributionRejectView(APIView):
    """
    Staff/Admin only: Rejects a pending contribution with a reason.
    """
    permission_classes = (IsStaffOrAdmin,)

    def post(self, request, pk):
        reason = request.data.get("reason", "").strip()
        if not reason:
            return Response(
                {"error": "Rad etish sababini kiritish majburiy."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            contribution = reject_contribution(
                contribution_id=pk,
                reviewed_by_user=request.user,
                reason=reason,
            )
            return Response(ContributionDetailSerializer(contribution).data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ContributionRevokeView(APIView):
    """
    Staff/Admin only: Revokes an already verified contribution and records a reversal transaction.
    """
    permission_classes = (IsStaffOrAdmin,)

    def post(self, request, pk):
        reason = request.data.get("reason", "").strip()
        if not reason:
            return Response(
                {"error": "Bekor qilish sababini kiritish majburiy."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            contribution = revoke_contribution(
                contribution_id=pk,
                revoked_by_user=request.user,
                reason=reason,
            )
            return Response(ContributionDetailSerializer(contribution).data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
