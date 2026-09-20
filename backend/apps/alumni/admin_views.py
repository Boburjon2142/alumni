import base64
import uuid
from datetime import date
from django.core.files.base import ContentFile
from django.db import transaction
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

def apply_avatar(profile, avatar_data, files=None):
    if files and "avatar" in files:
        profile.avatar = files["avatar"]
        return
    if not avatar_data:
        return
    if hasattr(avatar_data, "read"):
        profile.avatar = avatar_data
    elif isinstance(avatar_data, str) and avatar_data.startswith("data:image"):
        try:
            format_str, imgstr = avatar_data.split(";base64,")
            ext = format_str.split("/")[-1].lower()
            if ext == "jpeg":
                ext = "jpg"
            if ext not in ["jpg", "jpeg", "png", "webp"]:
                ext = "jpg"
            profile.avatar = ContentFile(base64.b64decode(imgstr), name=f"{profile.slug or 'avatar'}_{uuid.uuid4().hex[:6]}.{ext}")
        except Exception:
            pass

from apps.accounts.models import User
from apps.accounts.permissions import IsAdminOrStaffUser
from apps.alumni.models import (
    Achievement,
    AlumniProfile,
    AlumniRecognition,
    AlumniSource,
    CareerTimelineItem,
    EducationExperience,
    GraduationYearChangeRequest,
    RecognitionTitle,
    WorkExperience,
)
from apps.alumni.serializers import (
    AchievementSerializer,
    CareerTimelineSerializer,
    EducationExperienceSerializer,
    GraduationYearChangeRequestSerializer,
    PublicAlumniDetailSerializer,
    PublicAlumniSerializer,
    RecognitionTitleSerializer,
    WorkExperienceSerializer,
)
from apps.editorial.models import AlumniInterview, SuccessStory
from apps.feedback.models import Feedback
from apps.impact.models import Contribution
from apps.universities.models import Faculty, Specialty


class AdminStandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class AdminDashboardStatsView(APIView):
    permission_classes = [IsAdminOrStaffUser]

    def get(self, request):
        total_alumni = AlumniProfile.objects.count()
        pending_alumni = AlumniProfile.objects.filter(approval_status=AlumniProfile.ApprovalStatus.PENDING).count()
        approved_alumni = AlumniProfile.objects.filter(approval_status=AlumniProfile.ApprovalStatus.APPROVED).count()
        honorary_alumni = AlumniProfile.objects.filter(is_honorary=True).count()

        pending_year_requests = GraduationYearChangeRequest.objects.filter(
            status=GraduationYearChangeRequest.Status.PENDING
        ).count()
        new_feedbacks = Feedback.objects.filter(status=Feedback.Status.NEW).count()
        pending_contributions = Contribution.objects.filter(status=Contribution.Status.PENDING).count()

        published_stories = SuccessStory.objects.filter(is_published=True).count()
        published_interviews = AlumniInterview.objects.filter(is_published=True).count()
        total_recognitions = RecognitionTitle.objects.count()

        # Recent activities (latest 10 combined items)
        recent_profiles = list(
            AlumniProfile.objects.order_by("-created_at")[:5].values(
                "id", "full_name", "slug", "created_at", "approval_status", "is_honorary"
            )
        )
        recent_feedbacks = list(
            Feedback.objects.order_by("-created_at")[:5].values(
                "id", "name", "type", "message", "status", "created_at"
            )
        )
        recent_requests = list(
            GraduationYearChangeRequest.objects.select_related("alumnus")
            .order_by("-created_at")[:5]
            .values("id", "alumnus__full_name", "old_year", "requested_year", "status", "created_at")
        )

        return Response({
            "counts": {
                "total_alumni": total_alumni,
                "pending_alumni": pending_alumni,
                "approved_alumni": approved_alumni,
                "honorary_alumni": honorary_alumni,
                "pending_year_requests": pending_year_requests,
                "new_feedbacks": new_feedbacks,
                "pending_contributions": pending_contributions,
                "published_stories": published_stories,
                "published_interviews": published_interviews,
                "total_recognitions": total_recognitions,
            },
            "recent_profiles": recent_profiles,
            "recent_feedbacks": recent_feedbacks,
            "recent_requests": recent_requests,
        })


class AdminAlumniListView(APIView):
    permission_classes = [IsAdminOrStaffUser]
    pagination_class = AdminStandardPagination

    def get(self, request):
        qs = AlumniProfile.objects.select_related("faculty", "specialty", "user").prefetch_related(
            "recognitions__title", "achievements", "timeline"
        ).all()

        search = request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(full_name__icontains=search)
                | Q(current_company__icontains=search)
                | Q(position__icontains=search)
                | Q(current_activity__icontains=search)
                | Q(user__email__icontains=search)
            )

        status_filter = request.query_params.get("status", "").strip()
        if status_filter:
            qs = qs.filter(approval_status=status_filter)

        is_honorary = request.query_params.get("is_honorary")
        if is_honorary is not None:
            if is_honorary.lower() in ("true", "1"):
                qs = qs.filter(is_honorary=True)
            elif is_honorary.lower() in ("false", "0"):
                qs = qs.filter(is_honorary=False)

        is_published = request.query_params.get("is_published")
        if is_published is not None:
            if is_published.lower() in ("true", "1"):
                qs = qs.filter(is_published=True)
            elif is_published.lower() in ("false", "0"):
                qs = qs.filter(is_published=False)

        faculty = request.query_params.get("faculty")
        if faculty:
            qs = qs.filter(faculty__name__icontains=faculty)

        year = request.query_params.get("year")
        if year and year.isdigit():
            qs = qs.filter(graduation_year=int(year))

        ordering = request.query_params.get("ordering", "-created_at")
        allowed_orderings = {
            "created_at", "-created_at",
            "full_name", "-full_name",
            "graduation_year", "-graduation_year",
            "approval_status", "-approval_status",
        }
        if ordering in allowed_orderings:
            qs = qs.order_by(ordering)
        else:
            qs = qs.order_by("-created_at")

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(qs, request)
        serializer = PublicAlumniSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    @transaction.atomic
    def post(self, request):
        data = request.data
        full_name = data.get("full_name", "").strip()
        if not full_name:
            return Response({"message": "F.I.SH. majburiy"}, status=status.HTTP_400_BAD_REQUEST)

        faculty_name = data.get("faculty_name") or data.get("faculty")
        faculty_obj = None
        if faculty_name:
            faculty_obj, _ = Faculty.objects.get_or_create(name=faculty_name.strip())

        specialty_name = data.get("specialty_name") or data.get("specialty")
        specialty_obj = None
        if specialty_name:
            specialty_obj, _ = Specialty.objects.get_or_create(name=specialty_name.strip(), defaults={"faculty": faculty_obj})

        graduation_year = data.get("graduation_year")
        if graduation_year in ("", "null", None):
            graduation_year = None
        else:
            graduation_year = int(graduation_year)

        profile = AlumniProfile.objects.create(
            full_name=full_name,
            faculty=faculty_obj,
            specialty=specialty_obj,
            graduation_year=graduation_year,
            degree=data.get("degree", "").strip(),
            academic_degree=data.get("academic_degree", "").strip(),
            academic_title=data.get("academic_title", "").strip(),
            current_company=data.get("current_company", "").strip(),
            position=data.get("position", "").strip(),
            current_activity=data.get("current_activity", "").strip(),
            industry=data.get("industry", "").strip(),
            city=data.get("city", "").strip(),
            country=data.get("country", "O‘zbekiston").strip() or "O‘zbekiston",
            skills=data.get("skills", []),
            bio=data.get("bio", "").strip(),
            biography_uz=data.get("biography_uz", "").strip(),
            biography_en=data.get("biography_en", "").strip(),
            career_story_uz=data.get("career_story_uz", "").strip(),
            career_story_en=data.get("career_story_en", "").strip(),
            linkedin_url=data.get("linkedin_url", "").strip(),
            github_url=data.get("github_url", "").strip(),
            website_url=data.get("website_url", "").strip(),
            phone=data.get("phone", "").strip(),
            contact_email=data.get("contact_email", "").strip().lower(),
            image_url=data.get("image_url", "").strip(),
            image_alt=data.get("image_alt", "").strip(),
            image_credit=data.get("image_credit", "").strip(),
            image_source_url=data.get("image_source_url", "").strip(),
            is_honorary=bool(data.get("is_honorary", False)),
            is_featured=bool(data.get("is_featured", False)),
            is_published=bool(data.get("is_published", True)),
            approval_status=data.get("approval_status", AlumniProfile.ApprovalStatus.APPROVED),
            approved_at=timezone.now(),
            approved_by=request.user,
        )

        apply_avatar(profile, data.get("avatar"), request.FILES)
        if profile.avatar:
            profile.save(update_fields=["avatar"])

        # Process nested recognitions
        recognition_ids = data.get("recognition_ids", [])
        for title_id in recognition_ids:
            try:
                title = RecognitionTitle.objects.get(id=title_id)
                AlumniRecognition.objects.create(alumnus=profile, title=title)
            except RecognitionTitle.DoesNotExist:
                pass

        # Process nested achievements
        achievements_data = data.get("achievements", [])
        for idx, ach in enumerate(achievements_data):
            if ach.get("title"):
                Achievement.objects.create(
                    alumnus=profile,
                    title=ach.get("title").strip(),
                    description=ach.get("description", "").strip(),
                    year=ach.get("year"),
                    category=ach.get("category", Achievement.Category.PROFESSIONAL),
                    order=idx,
                )

        # Process nested timeline
        timeline_data = data.get("timeline", [])
        for idx, item in enumerate(timeline_data):
            if item.get("title") and item.get("year"):
                CareerTimelineItem.objects.create(
                    alumnus=profile,
                    year=int(item.get("year")),
                    title=item.get("title").strip(),
                    organization=item.get("organization", "").strip(),
                    description=item.get("description", "").strip(),
                    type=item.get("type", CareerTimelineItem.Type.CAREER),
                    order=idx,
                )

        return Response(PublicAlumniDetailSerializer(profile).data, status=status.HTTP_201_CREATED)


class AdminAlumniDetailView(APIView):
    permission_classes = [IsAdminOrStaffUser]

    def get_object(self, identifier):
        if identifier.isdigit():
            return AlumniProfile.objects.select_related("faculty", "specialty", "user").prefetch_related(
                "recognitions__title", "achievements", "timeline", "educations", "work_experiences", "sources"
            ).filter(id=int(identifier)).first()
        return AlumniProfile.objects.select_related("faculty", "specialty", "user").prefetch_related(
            "recognitions__title", "achievements", "timeline", "educations", "work_experiences", "sources"
        ).filter(slug=identifier).first()

    def get(self, request, identifier):
        profile = self.get_object(identifier)
        if not profile:
            return Response({"message": "Bitiruvchi profili topilmadi"}, status=status.HTTP_404_NOT_FOUND)
        return Response(PublicAlumniDetailSerializer(profile).data)

    @transaction.atomic
    def put(self, request, identifier):
        profile = self.get_object(identifier)
        if not profile:
            return Response({"message": "Bitiruvchi profili topilmadi"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        if "full_name" in data and data["full_name"].strip():
            profile.full_name = data["full_name"].strip()

        if "faculty_name" in data or "faculty" in data:
            fac_name = data.get("faculty_name") or data.get("faculty")
            if fac_name and isinstance(fac_name, str) and fac_name.strip():
                fac_obj, _ = Faculty.objects.get_or_create(name=fac_name.strip())
                profile.faculty = fac_obj
            elif fac_name is None or fac_name == "":
                profile.faculty = None

        if "graduation_year" in data:
            val = data["graduation_year"]
            profile.graduation_year = int(val) if val not in (None, "", "null") else None

        for field in [
            "degree", "academic_degree", "academic_title", "current_company", "position",
            "current_activity", "industry", "city", "country", "bio",
            "biography_uz", "biography_en", "career_story_uz", "career_story_en",
            "linkedin_url", "github_url", "website_url", "phone", "contact_email",
            "image_url", "image_alt", "image_credit", "image_source_url",
            "seo_title", "seo_description",
        ]:
            if field in data:
                setattr(profile, field, data[field].strip() if isinstance(data[field], str) else data[field])

        if "skills" in data and isinstance(data["skills"], list):
            profile.skills = data["skills"]

        if "is_honorary" in data:
            profile.is_honorary = bool(data["is_honorary"])
        if "is_featured" in data:
            profile.is_featured = bool(data["is_featured"])
        if "is_published" in data:
            profile.is_published = bool(data["is_published"])
        if "approval_status" in data:
            profile.approval_status = data["approval_status"]

        if "avatar" in data or (request.FILES and "avatar" in request.FILES):
            apply_avatar(profile, data.get("avatar"), request.FILES)
        elif "remove_avatar" in data and data["remove_avatar"]:
            profile.avatar = None

        profile.save()

        # Update recognitions
        if "recognition_ids" in data:
            profile.recognitions.all().delete()
            for r_id in data["recognition_ids"]:
                try:
                    r_title = RecognitionTitle.objects.get(id=r_id)
                    AlumniRecognition.objects.create(alumnus=profile, title=r_title)
                except RecognitionTitle.DoesNotExist:
                    pass

        # Update achievements
        if "achievements" in data and isinstance(data["achievements"], list):
            profile.achievements.all().delete()
            for idx, ach in enumerate(data["achievements"]):
                if ach.get("title"):
                    Achievement.objects.create(
                        alumnus=profile,
                        title=ach.get("title").strip(),
                        description=ach.get("description", "").strip(),
                        year=ach.get("year"),
                        category=ach.get("category", Achievement.Category.PROFESSIONAL),
                        order=idx,
                    )

        # Update timeline
        if "timeline" in data and isinstance(data["timeline"], list):
            profile.timeline.all().delete()
            for idx, item in enumerate(data["timeline"]):
                if item.get("title") and item.get("year"):
                    CareerTimelineItem.objects.create(
                        alumnus=profile,
                        year=int(item.get("year")),
                        title=item.get("title").strip(),
                        organization=item.get("organization", "").strip(),
                        description=item.get("description", "").strip(),
                        type=item.get("type", CareerTimelineItem.Type.CAREER),
                        order=idx,
                    )

        # Refresh
        profile = self.get_object(str(profile.id))
        return Response(PublicAlumniDetailSerializer(profile).data)

    def delete(self, request, identifier):
        profile = self.get_object(identifier)
        if not profile:
            return Response({"message": "Bitiruvchi profili topilmadi"}, status=status.HTTP_404_NOT_FOUND)
        profile.delete()
        return Response({"success": True, "message": "Profil muvaffaqiyatli o‘chirildi"}, status=status.HTTP_204_NO_CONTENT)


class AdminAlumniModerationActionView(APIView):
    permission_classes = [IsAdminOrStaffUser]

    def post(self, request, pk):
        profile = AlumniProfile.objects.filter(pk=pk).first()
        if not profile:
            return Response({"message": "Bitiruvchi topilmadi"}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get("action")
        if action == "approve":
            profile.approval_status = AlumniProfile.ApprovalStatus.APPROVED
            profile.is_published = True
            profile.approved_at = timezone.now()
            profile.approved_by = request.user
            profile.save()
            return Response({"success": True, "message": "Profil tasdiqlandi va nashr qilindi"})

        elif action == "reject":
            profile.approval_status = AlumniProfile.ApprovalStatus.REJECTED
            profile.is_published = False
            profile.save()
            return Response({"success": True, "message": "Profil rad etildi"})

        elif action == "toggle_publish":
            profile.is_published = not profile.is_published
            profile.save()
            return Response({
                "success": True,
                "is_published": profile.is_published,
                "message": f"Profil {'nashr qilindi' if profile.is_published else 'qoralamaga o‘tkazildi'}"
            })

        elif action == "toggle_featured":
            profile.is_featured = not profile.is_featured
            profile.save()
            return Response({
                "success": True,
                "is_featured": profile.is_featured,
                "message": f"Profil {'tavsiya etilganlarga qo‘shildi' if profile.is_featured else 'tavsiya etilganlardan olindi'}"
            })

        elif action == "set_honorary":
            is_hon = bool(request.data.get("is_honorary", True))
            profile.is_honorary = is_hon
            profile.save()
            return Response({
                "success": True,
                "is_honorary": profile.is_honorary,
                "message": f"Faxriy maqomi: {'Berildi' if is_hon else 'Bekor qilindi'}"
            })

        return Response({"message": f"Noma'lum amal: {action}"}, status=status.HTTP_400_BAD_REQUEST)


class AdminRecognitionTitleListView(APIView):
    permission_classes = [IsAdminOrStaffUser]

    def get(self, request):
        titles = RecognitionTitle.objects.annotate(alumni_count=Count("alumni_recognitions")).order_by("order", "name")
        data = [
            {
                "id": t.id,
                "name": t.name,
                "slug": t.slug,
                "icon": t.icon,
                "description": t.description,
                "is_active": t.is_active,
                "order": t.order,
                "alumni_count": t.alumni_count,
            }
            for t in titles
        ]
        return Response({"results": data})

    def post(self, request):
        serializer = RecognitionTitleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        title = serializer.save()
        return Response(RecognitionTitleSerializer(title).data, status=status.HTTP_201_CREATED)


class AdminRecognitionTitleDetailView(APIView):
    permission_classes = [IsAdminOrStaffUser]

    def get_object(self, pk):
        return RecognitionTitle.objects.filter(pk=pk).first()

    def get(self, request, pk):
        title = self.get_object(pk)
        if not title:
            return Response({"message": "Faxriy unvon topilmadi"}, status=status.HTTP_404_NOT_FOUND)
        return Response(RecognitionTitleSerializer(title).data)

    def put(self, request, pk):
        title = self.get_object(pk)
        if not title:
            return Response({"message": "Faxriy unvon topilmadi"}, status=status.HTTP_404_NOT_FOUND)
        serializer = RecognitionTitleSerializer(title, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        title = self.get_object(pk)
        if not title:
            return Response({"message": "Faxriy unvon topilmadi"}, status=status.HTTP_404_NOT_FOUND)
        title.delete()
        return Response({"success": True, "message": "Faxriy unvon o‘chirildi"}, status=status.HTTP_204_NO_CONTENT)


class AdminGraduationYearRequestListView(APIView):
    permission_classes = [IsAdminOrStaffUser]
    pagination_class = AdminStandardPagination

    def get(self, request):
        qs = GraduationYearChangeRequest.objects.select_related("alumnus").order_by("-created_at")
        status_filter = request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(qs, request)
        data = [
            {
                "id": r.id,
                "alumni_id": r.alumnus.id,
                "alumni_name": r.alumnus.full_name,
                "alumni_slug": r.alumnus.slug,
                "old_year": r.old_year,
                "requested_year": r.requested_year,
                "reason": r.reason,
                "status": r.status,
                "status_display": r.get_status_display(),
                "admin_note": r.admin_note,
                "created_at": r.created_at,
                "reviewed_at": r.reviewed_at,
            }
            for r in page
        ]
        return paginator.get_paginated_response(data)


class AdminGraduationYearRequestActionView(APIView):
    permission_classes = [IsAdminOrStaffUser]

    @transaction.atomic
    def post(self, request, pk):
        req_obj = GraduationYearChangeRequest.objects.select_related("alumnus").filter(pk=pk).first()
        if not req_obj:
            return Response({"message": "So‘rov topilmadi"}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get("action")
        admin_note = request.data.get("admin_note", "").strip()

        if action == "approve":
            req_obj.status = GraduationYearChangeRequest.Status.APPROVED
            req_obj.admin_note = admin_note
            req_obj.reviewed_at = timezone.now()
            req_obj.reviewed_by = request.user
            req_obj.save()

            # Update alumnus graduation year
            alumnus = req_obj.alumnus
            alumnus.graduation_year = req_obj.requested_year
            alumnus.save(update_fields=["graduation_year"])

            return Response({"success": True, "message": "Bitiruv yili o‘zgartirish so‘rovi tasdiqlandi"})

        elif action == "reject":
            req_obj.status = GraduationYearChangeRequest.Status.REJECTED
            req_obj.admin_note = admin_note
            req_obj.reviewed_at = timezone.now()
            req_obj.reviewed_by = request.user
            req_obj.save()

            return Response({"success": True, "message": "Bitiruv yili o‘zgartirish so‘rovi rad etildi"})

        return Response({"message": f"Noto‘g‘ri amal: {action}"}, status=status.HTTP_400_BAD_REQUEST)

