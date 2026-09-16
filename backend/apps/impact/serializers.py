from rest_framework import serializers

from apps.alumni.models import AlumniProfile
from .models import Achievement, AlumniAchievement, Contribution, ScoreTransaction


class AlumniImpactSummarySerializer(serializers.ModelSerializer):
    faculty_name = serializers.CharField(source="faculty.name", default=None, read_only=True)

    class Meta:
        model = AlumniProfile
        fields = (
            "id",
            "slug",
            "full_name",
            "avatar",
            "image_url",
            "position",
            "current_company",
            "faculty_name",
            "graduation_year",
        )
        read_only_fields = fields


class ContributionPublicSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source="get_category_display", read_only=True)
    action_type_display = serializers.CharField(source="get_action_type_display", read_only=True)

    class Meta:
        model = Contribution
        fields = (
            "id",
            "category",
            "category_display",
            "action_type",
            "action_type_display",
            "title",
            "description",
            "occurred_at",
        )
        read_only_fields = fields


class ContributionDetailSerializer(serializers.ModelSerializer):
    alumni = AlumniImpactSummarySerializer(read_only=True)
    category_display = serializers.CharField(source="get_category_display", read_only=True)
    action_type_display = serializers.CharField(source="get_action_type_display", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    verified_by_name = serializers.CharField(source="verified_by.get_full_name", default=None, read_only=True)

    class Meta:
        model = Contribution
        fields = (
            "id",
            "alumni",
            "category",
            "category_display",
            "action_type",
            "action_type_display",
            "source_type",
            "source_id",
            "title",
            "description",
            "status",
            "status_display",
            "occurred_at",
            "submitted_at",
            "verified_at",
            "verified_by_name",
            "rejection_reason",
            "metadata",
            "created_at",
        )
        read_only_fields = fields


class ContributionSubmitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contribution
        fields = (
            "category",
            "action_type",
            "title",
            "description",
            "occurred_at",
            "metadata",
        )

    def validate(self, attrs):
        category = attrs.get("category")
        action_type = attrs.get("action_type")

        career_actions = {
            Contribution.ActionType.ALUMNI_HIRED,
            Contribution.ActionType.STUDENT_INTERNSHIP,
            Contribution.ActionType.JOB_PLACEMENT_CONFIRMED,
        }
        mentorship_actions = {
            Contribution.ActionType.MENTORSHIP_COMPLETED,
            Contribution.ActionType.MENTEE_OUTCOME_VERIFIED,
        }
        university_actions = {
            Contribution.ActionType.UNIVERSITY_PROJECT_SUPPORT,
            Contribution.ActionType.FINANCIAL_SUPPORT,
            Contribution.ActionType.EQUIPMENT_SUPPORT,
            Contribution.ActionType.SCHOLARSHIP_SUPPORT,
        }
        community_actions = {
            Contribution.ActionType.EVENT_ORGANIZED,
            Contribution.ActionType.EVENT_SPEAKER,
            Contribution.ActionType.MASTERCLASS_DELIVERED,
            Contribution.ActionType.COMMUNITY_INITIATIVE,
        }

        valid_map = {
            Contribution.Category.CAREER: career_actions,
            Contribution.Category.MENTORSHIP: mentorship_actions,
            Contribution.Category.UNIVERSITY: university_actions,
            Contribution.Category.COMMUNITY: community_actions,
        }

        if category in valid_map and action_type not in valid_map[category]:
            raise serializers.ValidationError(
                {"action_type": f"Ushbu faoliyat turi '{category}' kategoriyasiga mos kelmaydi."}
            )

        return attrs


class ScoreTransactionSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source="get_category_display", read_only=True)
    transaction_type_display = serializers.CharField(source="get_transaction_type_display", read_only=True)

    class Meta:
        model = ScoreTransaction
        fields = (
            "id",
            "category",
            "category_display",
            "points",
            "transaction_type",
            "transaction_type_display",
            "reason",
            "created_at",
        )
        read_only_fields = fields


class AchievementSerializer(serializers.ModelSerializer):
    awarded_at = serializers.DateTimeField(default=None, read_only=True)

    class Meta:
        model = Achievement
        fields = (
            "id",
            "code",
            "name_uz",
            "name_en",
            "name_ru",
            "description_uz",
            "description_en",
            "description_ru",
            "category",
            "icon_key",
            "awarded_at",
        )
        read_only_fields = fields


class RankingEntrySerializer(serializers.Serializer):
    rank = serializers.IntegerField()
    alumni = AlumniImpactSummarySerializer()
    total_score = serializers.IntegerField()
    career_score = serializers.IntegerField()
    mentorship_score = serializers.IntegerField()
    university_score = serializers.IntegerField()
    community_score = serializers.IntegerField()
    verified_contributions_count = serializers.IntegerField()
    top_category = serializers.CharField()
    top_category_display = serializers.CharField()
    achievements = AchievementSerializer(many=True, required=False)
