from datetime import date
from pathlib import Path
from django.utils import timezone
from rest_framework import serializers
from .models import (
    Achievement,
    AlumniConsent,
    AlumniProfile,
    AlumniRecognition,
    AlumniSource,
    CareerTimelineItem,
    EducationExperience,
    FeaturedAlumni,
    GraduationYearChangeRequest,
    RecognitionTitle,
    WorkExperience,
)
from apps.editorial.serializers import AdviceSerializer
from apps.universities.models import Faculty

class RecognitionTitleSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecognitionTitle
        fields = ("id", "name", "slug", "icon", "description", "order")

class AchievementSerializer(serializers.ModelSerializer):
    class Meta: model = Achievement; fields = ("id", "title", "description", "year", "category", "order")

class CareerTimelineSerializer(serializers.ModelSerializer):
    class Meta: model = CareerTimelineItem; fields = ("id", "year", "title", "organization", "description", "type", "order")

class EducationExperienceSerializer(serializers.ModelSerializer):
    degree_level_display = serializers.CharField(source="get_degree_level_display", read_only=True)

    class Meta:
        model = EducationExperience
        fields = (
            "id",
            "degree_level",
            "degree_level_display",
            "institution",
            "faculty",
            "specialty",
            "start_year",
            "graduation_year",
            "order",
        )

class WorkExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkExperience
        fields = ("id", "region", "company", "position", "industry", "start_year", "end_year", "is_current", "order")

class GraduationYearChangeRequestSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = GraduationYearChangeRequest
        fields = ("id", "old_year", "requested_year", "reason", "status", "status_display", "admin_note", "created_at", "reviewed_at")
        read_only_fields = ("id", "old_year", "status", "status_display", "admin_note", "created_at", "reviewed_at")

    def validate_requested_year(self, value):
        current_year = date.today().year
        if value < 1956 or value > current_year + 1:
            raise serializers.ValidationError(f"Bitirgan yil 1956 va {current_year + 1} oralig‘ida bo‘lishi kerak.")
        return value

    def validate_reason(self, value):
        if not value or len(value.strip()) < 5:
            raise serializers.ValidationError("Iltimos, bitirgan yilni o‘zgartirish sababini batafsilroq yozing (kamida 5 ta belgi).")
        return value.strip()

class AlumniSourceSerializer(serializers.ModelSerializer):
    class Meta: model = AlumniSource; fields = ("id", "title", "url", "source_type", "publisher", "published_date", "is_verified")

class PublicAlumniSerializer(serializers.ModelSerializer):
    faculty = serializers.CharField(source="faculty.name", default=None)
    specialty = serializers.CharField(source="specialty.name", default=None)
    verified = serializers.SerializerMethodField()
    approved_by_name = serializers.SerializerMethodField()
    recognitions = serializers.SerializerMethodField()

    class Meta:
        model = AlumniProfile
        fields = (
            "id", "slug", "avatar", "image_url", "image_alt", "image_credit", "image_source_url",
            "full_name", "faculty", "specialty", "graduation_year", "degree",
            "academic_degree", "academic_title",
            "current_company", "position", "current_activity", "industry", "city", "country",
            "skills", "bio", "biography_uz", "biography_en",
            "is_featured", "is_honorary", "seo_title", "seo_description", "verified",
            "approval_status", "approved_at", "approved_by_name", "recognitions"
        )
    def get_verified(self, obj): return obj.verification_status == AlumniProfile.Verification.VERIFIED
    def get_approved_by_name(self, obj):
        if not obj.approved_by:
            return None
        from apps.alumni.notifications import get_approver_display_name
        return get_approver_display_name(obj.approved_by)

    def get_recognitions(self, obj):
        return [
            {
                "id": r.title.id,
                "name": r.title.name,
                "slug": r.title.slug,
                "icon": r.title.icon,
                "description": r.title.description,
                "year": r.year,
            }
            for r in obj.recognitions.all()
            if r.is_active and r.title.is_active
        ]


class PublicAlumniListSerializer(serializers.ModelSerializer):
    faculty = serializers.CharField(source="faculty.name", default=None)
    specialty = serializers.CharField(source="specialty.name", default=None)
    recognitions = serializers.SerializerMethodField()

    class Meta:
        model = AlumniProfile
        fields = (
            "id", "slug", "avatar", "image_url", "image_alt", "full_name",
            "position", "current_company", "current_activity",
            "faculty", "specialty", "graduation_year",
            "is_featured", "is_honorary", "recognitions"
        )

    def get_recognitions(self, obj):
        return [
            {
                "id": r.title.id,
                "name": r.title.name,
                "slug": r.title.slug,
                "icon": r.title.icon,
                "description": r.title.description,
                "year": r.year,
            }
            for r in obj.recognitions.all()
            if r.is_active and r.title.is_active
        ]

class OwnAlumniSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    verification_status = serializers.CharField(read_only=True)
    is_graduation_year_locked = serializers.SerializerMethodField()
    faculty_name = serializers.CharField(source="faculty.name", read_only=True, default=None)
    educations = EducationExperienceSerializer(many=True, required=False)
    work_experiences = WorkExperienceSerializer(many=True, required=False)
    pending_graduation_request = serializers.SerializerMethodField()

    class Meta:
        model = AlumniProfile
        fields = (
            "id", "email", "avatar", "full_name", "faculty", "faculty_name", "specialty",
            "graduation_year", "is_graduation_year_locked", "degree",
            "academic_degree", "academic_title", "current_company", "position",
            "current_activity", "industry", "city", "country", "skills", "bio",
            "linkedin_url", "github_url", "website_url", "phone", "visibility",
            "verification_status", "educations", "work_experiences", "pending_graduation_request",
        )
        extra_kwargs = {
            "faculty": {"read_only": True},
        }

    def get_is_graduation_year_locked(self, obj) -> bool:
        return obj.graduation_year is not None

    def get_pending_graduation_request(self, obj):
        req = obj.graduation_year_requests.filter(status=GraduationYearChangeRequest.Status.PENDING).first()
        if req:
            return GraduationYearChangeRequestSerializer(req).data
        return None

    def validate_graduation_year(self, value):
        if self.instance and self.instance.graduation_year is not None:
            if value != self.instance.graduation_year:
                raise serializers.ValidationError(
                    "Bitirgan yil allaqachon tanlangan. Uni faqat bir marotaba tanlash mumkin va qayta o‘zgartirib bo‘lmaydi."
                )
            return value

        if value is not None:
            current_year = date.today().year
            if value < 1956 or value > current_year + 1:
                raise serializers.ValidationError(f"Bitirgan yil 1956 va {current_year + 1} oralig‘ida bo‘lishi kerak.")
        return value

    def validate_avatar(self, value):
        if not value:
            return value
        if value.size > 3 * 1024 * 1024:
            raise serializers.ValidationError("Rasm hajmi 3 MB dan oshmasligi kerak.")
        allowed_extensions = {".jpg", ".jpeg", ".png", ".webp"}
        ext = Path(value.name).suffix.lower()
        if ext not in allowed_extensions:
            raise serializers.ValidationError("Faqat JPG, JPEG, PNG yoki WebP formatdagi rasmlar qabul qilinadi.")
        return value

    def validate_educations(self, value):
        if value and len(value) > 10:
            raise serializers.ValidationError("Ta'lim bo‘yicha ko‘pi bilan 10 ta yozuv qo‘shish mumkin.")
        return value

    def validate_work_experiences(self, value):
        if value and len(value) > 7:
            raise serializers.ValidationError("Mehnat faoliyati bo‘yicha ko‘pi bilan 7 ta ish joyi qo‘shish mumkin.")
        return value

    def update(self, instance, validated_data):
        educations_data = validated_data.pop("educations", None)
        work_experiences_data = validated_data.pop("work_experiences", None)
        validated_data.pop("faculty", None)
        faculty_name = self.initial_data.get("faculty_name") or self.initial_data.get("faculty")
        
        if faculty_name is not None and isinstance(faculty_name, str):
            clean_name = faculty_name.strip()
            if clean_name:
                fac, _ = Faculty.objects.get_or_create(name=clean_name)
                instance.faculty = fac
            else:
                instance.faculty = None

        profile = super().update(instance, validated_data)

        if educations_data is not None:
            instance.educations.all().delete()
            created_edu = []
            for idx, edu_data in enumerate(educations_data[:10]):
                created_edu.append(
                    EducationExperience(
                        alumnus=instance,
                        degree_level=edu_data.get("degree_level", "master"),
                        institution=edu_data.get("institution", "Qarshi davlat universiteti").strip() or "Qarshi davlat universiteti",
                        faculty=edu_data.get("faculty", "").strip(),
                        specialty=edu_data.get("specialty", "").strip(),
                        start_year=edu_data.get("start_year"),
                        graduation_year=edu_data.get("graduation_year") or date.today().year,
                        order=idx,
                    )
                )
            if created_edu:
                EducationExperience.objects.bulk_create(created_edu)

        if work_experiences_data is not None:
            # Recreate or update work experiences
            instance.work_experiences.all().delete()
            created_items = []
            for idx, exp_data in enumerate(work_experiences_data[:7]):
                created_items.append(
                    WorkExperience(
                        alumnus=instance,
                        region=exp_data.get("region", "").strip(),
                        company=exp_data.get("company", "").strip(),
                        position=exp_data.get("position", "").strip(),
                        industry=exp_data.get("industry", "").strip(),
                        start_year=exp_data.get("start_year"),
                        end_year=exp_data.get("end_year"),
                        is_current=exp_data.get("is_current", False) or exp_data.get("end_year") is None,
                        order=idx,
                    )
                )
            if created_items:
                WorkExperience.objects.bulk_create(created_items)

        return profile

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
    educations = EducationExperienceSerializer(many=True, read_only=True)
    work_experiences = WorkExperienceSerializer(many=True, read_only=True)
    sources = AlumniSourceSerializer(many=True, read_only=True)
    advice = serializers.SerializerMethodField()
    class Meta(PublicAlumniSerializer.Meta):
        fields = PublicAlumniSerializer.Meta.fields + ("career_story_uz", "career_story_en", "published_at", "achievements", "timeline", "educations", "work_experiences", "sources", "advice")
    def get_advice(self, obj):
        qs = obj.advice.filter(is_published=True)
        return AdviceSerializer(qs, many=True).data

class AlumniSubmissionSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(max_length=160, min_length=3, trim_whitespace=True)
    graduation_year = serializers.IntegerField(
        min_value=1956,
        max_value=date.today().year + 1,
        required=False,
        allow_null=True,
    )
    contact_email = serializers.EmailField(max_length=254)
    academic_degree = serializers.ChoiceField(
        choices=AlumniProfile.AcademicDegree.choices,
        required=False,
        allow_blank=True,
        default="",
    )
    academic_title = serializers.ChoiceField(
        choices=AlumniProfile.AcademicTitle.choices,
        required=False,
        allow_blank=True,
        default="",
    )
    current_activity = serializers.CharField(max_length=255, required=False, allow_blank=True, trim_whitespace=True)
    bio = serializers.CharField(max_length=2000, required=False, allow_blank=True, trim_whitespace=True)
    avatar = serializers.ImageField(required=False, allow_null=True)
    consent_accepted = serializers.BooleanField(write_only=True)
    verification_code = serializers.CharField(max_length=6, min_length=6, required=False, allow_blank=True, write_only=True)

    class Meta:
        model = AlumniProfile
        fields = (
            "id", "full_name", "graduation_year", "contact_email",
            "academic_degree", "academic_title",
            "current_activity", "bio", "avatar", "consent_accepted",
            "verification_code"
        )
        read_only_fields = ("id",)

    def to_internal_value(self, data):
        if hasattr(data, "copy"):
            data = data.copy()
        if "graduation_year" in data and data["graduation_year"] in ("", "null", None):
            data.pop("graduation_year", None)
        return super().to_internal_value(data)

    def validate_consent_accepted(self, value):
        if not value:
            raise serializers.ValidationError("Shaxsiy ma’lumotlarni qayta ishlash shartlariga rozilik bildirish majburiy.")
        return value

    def validate_graduation_year(self, value):
        if value in (None, "", "null"):
            return None
        current_year = date.today().year
        if value < 1956 or value > current_year + 1:
            raise serializers.ValidationError(f"Bitirgan yil 1956 va {current_year + 1} oralig‘ida bo‘lishi kerak.")
        return value

    def validate(self, data):
        request = self.context.get("request")
        email = data.get("contact_email", "").strip().lower()
        proof = request.session.get("verified_join", {}) if request else {}
        if proof.get("email") != email or proof.get("expires", 0) < timezone.now().timestamp():
            raise serializers.ValidationError({"verification_code": "Avval emailingizga yuborilgan kodni tasdiqlang."})
        from apps.accounts.models import User
        user = User.objects.filter(email__iexact=email).first()
        if user and (not user.is_active or AlumniProfile.objects.filter(user=user).exists()):
            raise serializers.ValidationError({"contact_email": "Bu email uchun hisob mavjud. Kirish tugmasidan foydalaning."})
        return data

    def validate_avatar(self, value):
        if not value:
            return value
        if value.size > 3 * 1024 * 1024:
            raise serializers.ValidationError("Rasm hajmi 3 MB dan oshmasligi kerak.")
        allowed_extensions = {".jpg", ".jpeg", ".png", ".webp"}
        ext = Path(value.name).suffix.lower()
        if ext not in allowed_extensions:
            raise serializers.ValidationError("Faqat JPG, JPEG, PNG yoki WebP formatdagi rasmlar qabul qilinadi.")
        if hasattr(value, "content_type") and value.content_type:
            allowed_mimes = {"image/jpeg", "image/png", "image/webp"}
            if value.content_type.lower() not in allowed_mimes:
                raise serializers.ValidationError("Noto‘g‘ri rasm formati.")
        return value

    def create(self, validated_data):
        validated_data.pop("consent_accepted", None)
        validated_data.pop("verification_code", None)
        request = self.context.get("request")
        ip = None
        user_agent = ""
        if request:
            ip = request.META.get("HTTP_X_FORWARDED_FOR", request.META.get("REMOTE_ADDR", ""))
            if ip:
                ip = ip.split(",")[0].strip()[:45]
            user_agent = request.META.get("HTTP_USER_AGENT", "")[:500]

        from apps.accounts.models import User
        email = validated_data["contact_email"].strip().lower()
        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            user = User.objects.create_user(email=email)

        profile = AlumniProfile.objects.create(
            user=user,
            full_name=validated_data["full_name"],
            graduation_year=validated_data.get("graduation_year"),
            contact_email=validated_data.get("contact_email", "").strip().lower(),
            academic_degree=validated_data.get("academic_degree", "").strip(),
            academic_title=validated_data.get("academic_title", "").strip(),
            current_activity=validated_data.get("current_activity", "").strip(),
            bio=validated_data.get("bio", "").strip(),
            avatar=validated_data.get("avatar"),
            approval_status=AlumniProfile.ApprovalStatus.APPROVED,
            is_published=True,
            approved_at=timezone.now(),
            is_featured=False,
            is_honorary=False,
        )

        AlumniConsent.objects.create(
            alumni=profile,
            policy_version="1.0",
            accepted=True,
            ip_address=ip,
            user_agent=user_agent,
        )

        return profile

class GraduationGroupItemSerializer(serializers.Serializer):
    year = serializers.IntegerField()
    members_count = serializers.IntegerField()
    title = serializers.CharField()
    subtitle = serializers.CharField()
    description = serializers.CharField()

