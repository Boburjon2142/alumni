from rest_framework import serializers
from .models import Achievement, AlumniProfile, AlumniSource, CareerTimelineItem, FeaturedAlumni
from apps.editorial.serializers import AdviceSerializer

class AchievementSerializer(serializers.ModelSerializer):
    class Meta: model = Achievement; fields = ("id", "title", "description", "year", "category", "order")

class CareerTimelineSerializer(serializers.ModelSerializer):
    class Meta: model = CareerTimelineItem; fields = ("id", "year", "title", "organization", "description", "type", "order")

class AlumniSourceSerializer(serializers.ModelSerializer):
    class Meta: model = AlumniSource; fields = ("id", "title", "url", "source_type", "publisher", "published_date", "is_verified")

class PublicAlumniSerializer(serializers.ModelSerializer):
    faculty = serializers.CharField(source="faculty.name", default=None)
    specialty = serializers.CharField(source="specialty.name", default=None)
    verified = serializers.SerializerMethodField()
    class Meta:
        model = AlumniProfile
        fields = ("id", "slug", "avatar", "image_url", "image_alt", "image_credit", "image_source_url", "full_name", "faculty", "specialty", "graduation_year", "degree", "current_company", "position", "industry", "city", "country", "skills", "bio", "biography_uz", "biography_en", "is_featured", "seo_title", "seo_description", "verified")
    def get_verified(self, obj): return obj.verification_status == AlumniProfile.Verification.VERIFIED

class PublicAlumniListSerializer(serializers.ModelSerializer):
    faculty = serializers.CharField(source="faculty.name", default=None)
    specialty = serializers.CharField(source="specialty.name", default=None)
    class Meta:
        model = AlumniProfile
        fields = ("id", "slug", "avatar", "image_url", "image_alt", "full_name", "position", "current_company", "faculty", "specialty", "graduation_year", "is_featured")

class OwnAlumniSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    verification_status = serializers.CharField(read_only=True)
    class Meta:
        model = AlumniProfile
        fields = ("id", "email", "avatar", "full_name", "faculty", "specialty", "graduation_year", "degree", "current_company", "position", "industry", "city", "country", "skills", "bio", "linkedin_url", "github_url", "website_url", "phone", "visibility", "verification_status")
    def validate_skills(self, value):
        if not isinstance(value, list) or len(value) > 12 or any(not isinstance(x, str) or len(x) > 40 for x in value):
            raise serializers.ValidationError("Ko‘nikmalar ro‘yxati noto‘g‘ri.")
        return value

class FeaturedSerializer(serializers.ModelSerializer):
    alumni = PublicAlumniSerializer(read_only=True)
    class Meta: model = FeaturedAlumni; fields = ("id", "title", "short_description", "display_order", "alumni")

class PublicAlumniDetailSerializer(PublicAlumniSerializer):
    achievements = AchievementSerializer(many=True, read_only=True)
    timeline = CareerTimelineSerializer(many=True, read_only=True)
    sources = AlumniSourceSerializer(many=True, read_only=True)
    advice = serializers.SerializerMethodField()
    class Meta(PublicAlumniSerializer.Meta):
        fields = PublicAlumniSerializer.Meta.fields + ("career_story_uz", "career_story_en", "published_at", "achievements", "timeline", "sources", "advice")
    def get_advice(self, obj):
        qs = obj.advice.filter(is_published=True)
        return AdviceSerializer(qs, many=True).data
