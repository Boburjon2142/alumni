import pytest
from django.core.exceptions import ValidationError
from django.utils import timezone
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.alumni.models import AlumniProfile
from apps.impact.models import Achievement, AlumniAchievement, Contribution, ScoreTransaction
from apps.impact.services.scoring import (
    calculate_points,
    reject_contribution,
    revoke_contribution,
    verify_contribution,
)
from apps.universities.models import Faculty


@pytest.mark.django_db
class TestScoringService:
    @pytest.fixture(autouse=True)
    def setup_data(self):
        self.user = User.objects.create_user(email="alumni@test.com", password="password123", role=User.Role.ALUMNI)
        self.staff_user = User.objects.create_user(email="staff@test.com", password="password123", role=User.Role.STAFF, is_staff=True)
        self.alumni = AlumniProfile.objects.create(
            user=self.user,
            full_name="Azizbek Rahmonov",
            slug="azizbek-rahmonov",
            is_published=True,
        )
        self.achievement = Achievement.objects.create(
            code="career-builder",
            name_uz="Karyera homiysi",
            category=Contribution.Category.CAREER,
            threshold=1,
            icon_key="briefcase",
        )

    def test_calculate_points_rules(self):
        assert calculate_points(Contribution.ActionType.ALUMNI_HIRED) == 150
        assert calculate_points(Contribution.ActionType.STUDENT_INTERNSHIP) == 80
        assert calculate_points(Contribution.ActionType.MENTORSHIP_COMPLETED) == 60
        assert calculate_points(Contribution.ActionType.EVENT_SPEAKER) == 40
        # Tiered financial scoring tests
        assert calculate_points(Contribution.ActionType.FINANCIAL_SUPPORT, {"amount": 25000000}) == 180
        assert calculate_points(Contribution.ActionType.FINANCIAL_SUPPORT, {"amount": 600000000}) == 500
        assert calculate_points(Contribution.ActionType.FINANCIAL_SUPPORT, {"amount": 2000000}) == 50

    def test_verify_contribution_awards_score_and_achievement(self):
        contrib = Contribution.objects.create(
            alumni=self.alumni,
            category=Contribution.Category.CAREER,
            action_type=Contribution.ActionType.ALUMNI_HIRED,
            title="Ishga qabul qilindi",
            status=Contribution.Status.PENDING,
        )

        verified = verify_contribution(contrib.id, self.staff_user, "Tasdiqlandi")
        assert verified.status == Contribution.Status.VERIFIED
        assert verified.verified_by == self.staff_user

        tx = ScoreTransaction.objects.filter(contribution=contrib).first()
        assert tx is not None
        assert tx.points == 150
        assert tx.transaction_type == ScoreTransaction.TransactionType.AWARD

        # Check achievement awarded
        assert AlumniAchievement.objects.filter(alumni=self.alumni, achievement=self.achievement).exists()

    def test_idempotent_double_verification(self):
        contrib = Contribution.objects.create(
            alumni=self.alumni,
            category=Contribution.Category.CAREER,
            action_type=Contribution.ActionType.ALUMNI_HIRED,
            title="Ishga qabul qilindi",
            status=Contribution.Status.PENDING,
        )

        verify_contribution(contrib.id, self.staff_user)
        verify_contribution(contrib.id, self.staff_user)

        # Ensure only 1 score transaction created
        assert ScoreTransaction.objects.filter(contribution=contrib).count() == 1

    def test_reject_contribution(self):
        contrib = Contribution.objects.create(
            alumni=self.alumni,
            category=Contribution.Category.COMMUNITY,
            action_type=Contribution.ActionType.EVENT_SPEAKER,
            title="Spikerlik",
            status=Contribution.Status.PENDING,
        )

        rejected = reject_contribution(contrib.id, self.staff_user, "Ma'lumotlar yetarli emas")
        assert rejected.status == Contribution.Status.REJECTED
        assert rejected.rejection_reason == "Ma'lumotlar yetarli emas"
        assert ScoreTransaction.objects.filter(contribution=contrib).count() == 0

    def test_revoke_contribution_creates_reversal(self):
        contrib = Contribution.objects.create(
            alumni=self.alumni,
            category=Contribution.Category.CAREER,
            action_type=Contribution.ActionType.ALUMNI_HIRED,
            title="Ishga qabul qilindi",
            status=Contribution.Status.PENDING,
        )

        verify_contribution(contrib.id, self.staff_user)
        revoked = revoke_contribution(contrib.id, self.staff_user, "Xato tasdiqlangan")

        assert revoked.status == Contribution.Status.REVOKED
        reversal = ScoreTransaction.objects.filter(
            contribution=contrib, transaction_type=ScoreTransaction.TransactionType.REVERSAL
        ).first()
        assert reversal is not None
        assert reversal.points == -150


@pytest.mark.django_db
class TestImpactAPI:
    @pytest.fixture(autouse=True)
    def setup_api(self):
        self.client = APIClient()
        self.faculty = Faculty.objects.create(name="Axborot texnologiyalari")
        self.user = User.objects.create_user(email="alumni1@test.com", password="password123", role=User.Role.ALUMNI)
        self.staff_user = User.objects.create_user(email="staff1@test.com", password="password123", role=User.Role.STAFF, is_staff=True)
        self.alumni = AlumniProfile.objects.create(
            user=self.user,
            full_name="Dilshod Rahimov",
            slug="dilshod-rahimov",
            faculty=self.faculty,
            graduation_year=2018,
            is_published=True,
        )

    def test_rankings_endpoint(self):
        contrib = Contribution.objects.create(
            alumni=self.alumni,
            category=Contribution.Category.CAREER,
            action_type=Contribution.ActionType.ALUMNI_HIRED,
            title="Yollash",
            status=Contribution.Status.PENDING,
        )
        verify_contribution(contrib.id, self.staff_user)

        res = self.client.get("/api/v1/impact/rankings/?period=year")
        assert res.status_code == 200
        data = res.json()["data"]
        assert len(data) >= 1
        assert data[0]["total_score"] == 150
        assert data[0]["alumni"]["full_name"] == "Dilshod Rahimov"

    def test_alumni_cannot_approve_own_contribution(self):
        contrib = Contribution.objects.create(
            alumni=self.alumni,
            category=Contribution.Category.COMMUNITY,
            action_type=Contribution.ActionType.EVENT_SPEAKER,
            title="Spikerlik",
            status=Contribution.Status.PENDING,
        )

        self.client.force_authenticate(user=self.user)
        res = self.client.post(f"/api/v1/impact/contributions/{contrib.id}/approve/")
        assert res.status_code == 403

    def test_staff_can_approve_contribution(self):
        contrib = Contribution.objects.create(
            alumni=self.alumni,
            category=Contribution.Category.COMMUNITY,
            action_type=Contribution.ActionType.EVENT_SPEAKER,
            title="Spikerlik",
            status=Contribution.Status.PENDING,
        )

        self.client.force_authenticate(user=self.staff_user)
        res = self.client.post(
            f"/api/v1/impact/contributions/{contrib.id}/approve/",
            {"verification_note": "Approved by staff"},
            format="json",
        )
        assert res.status_code == 200
        contrib.refresh_from_db()
        assert contrib.status == Contribution.Status.VERIFIED

    def test_my_impact_endpoint(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.get("/api/v1/impact/me/")
        assert res.status_code == 200
        data = res.json()
        assert data["full_name"] == "Dilshod Rahimov"
        assert "breakdown" in data
