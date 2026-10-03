import base64
import uuid
from datetime import date
from django.core.files.base import ContentFile
from django.db import transaction
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import ValidationError
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

from django.core.exceptions import ValidationError as DjangoValidationError
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
    AdminAlumniSerializer,
    AdminAlumniDetailSerializer,
    AchievementSerializer,
    AlumniRecognitionSerializer,
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
        serializer = AdminAlumniSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        return Response(
            {
                "success": False,
                "message": "Admin tomonidan bitiruvchi profili qo‘shish taqiqlangan. Bitiruvchilar faqat rasmiy anketa (/anketa) yoki ro‘yxatdan o‘tish orqali qo‘shiladi."
            },
            status=status.HTTP_403_FORBIDDEN
        )


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
        return Response(AdminAlumniDetailSerializer(profile).data)

    @transaction.atomic
    def put(self, request, identifier):
        profile = self.get_object(identifier)
        if not profile:
            return Response({"message": "Bitiruvchi profili topilmadi"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data

        if "approval_status" in data and data["approval_status"] not in AlumniProfile.ApprovalStatus.values:
            raise ValidationError({"approval_status": "Moderatsiya holati noto‘g‘ri."})
        for field in ("is_honorary", "is_featured", "is_published"):
            if field in data and not isinstance(data[field], bool):
                raise ValidationError({field: "Qiymat true yoki false bo‘lishi kerak."})

        # Xavfsizlik va ma'lumotlar daxlsizligi:
        # Bitiruvchining shaxsiy ma'lumotlarini (F.I.SH., tarjimai hol, ish joyi, telefon, bio, email)
        # faqat bitiruvchining o'zi tahrirlashi mumkin.
        # Admin faqat moderatsiya holati, nashr, tavsiya va unvonlarni boshqarishi mumkin.

        if "is_honorary" in data:
            profile.is_honorary = bool(data["is_honorary"])
        if "is_featured" in data:
            profile.is_featured = bool(data["is_featured"])
        if "is_published" in data:
            profile.is_published = bool(data["is_published"])
        if "approval_status" in data:
            profile.approval_status = data["approval_status"]
            if profile.approval_status == AlumniProfile.ApprovalStatus.APPROVED:
                profile.approved_at = timezone.now()
                profile.approved_by = request.user
                profile.verification_status = AlumniProfile.Verification.VERIFIED

        profile.save()

        # Update recognitions (admin-assigned honorary awards)
        if "recognition_ids" in data and "recognitions" not in data:
            selected_ids = data["recognition_ids"]
            if not isinstance(selected_ids, list) or any(type(item) is not int for item in selected_ids):
                raise ValidationError({"recognition_ids": "Unvonlar ID ro‘yxati bo‘lishi kerak."})
            selected_ids = set(selected_ids)
            titles = {title.pk: title for title in RecognitionTitle.objects.filter(pk__in=selected_ids)}
            if selected_ids != set(titles):
                raise ValidationError({"recognition_ids": "Tanlangan unvon topilmadi."})
            current = profile.recognitions.filter(status=AlumniRecognition.Status.APPROVED, is_active=True)
            current_ids = set(current.values_list("title_id", flat=True))
            for recognition in current.exclude(title_id__in=selected_ids):
                recognition.status = AlumniRecognition.Status.REVOKED
                recognition.revoked_by = request.user
                recognition.revocation_reason = "Admin profil boshqaruvida bekor qilindi."
                recognition.save()
            for title_id in selected_ids - current_ids:
                try:
                    recognition = AlumniRecognition(
                        alumnus=profile, title=titles[title_id], approved_by=request.user,
                        approved_at=timezone.now(),
                    )
                    recognition.full_clean()
                    recognition.save()
                except DjangoValidationError as err:
                    raise ValidationError({"recognition_ids": err.messages}) from err
        elif "recognitions" in data:
            rec_inputs = data.get("recognitions") or data.get("recognition_ids", [])
            profile.recognitions.all().delete()
            for item in rec_inputs:
                if isinstance(item, int):
                    title_id = item
                    rec_kwargs = {}
                elif isinstance(item, dict):
                    title_id = item.get("title_id") or item.get("id") or item.get("title")
                    rec_kwargs = {
                        "level": item.get("level"),
                        "year": item.get("year"),
                        "justification": item.get("justification", "").strip(),
                        "valid_from": item.get("valid_from"),
                        "valid_until": item.get("valid_until"),
                        "status": item.get("status", AlumniRecognition.Status.APPROVED),
                    }
                else:
                    continue

                if title_id:
                    try:
                        r_title = RecognitionTitle.objects.get(id=int(title_id))
                        rec_obj = AlumniRecognition(
                            alumnus=profile,
                            title=r_title,
                            approved_by=request.user,
                            approved_at=timezone.now(),
                            **rec_kwargs
                        )
                        rec_obj.full_clean()
                        rec_obj.save()
                    except (RecognitionTitle.DoesNotExist, DjangoValidationError, ValueError) as err:
                        raise ValidationError({"recognitions": err.messages if isinstance(err, DjangoValidationError) else "Tanlangan unvon topilmadi."}) from err

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
        return Response(AdminAlumniDetailSerializer(profile).data)

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
        titles = RecognitionTitle.objects.annotate(
            alumni_count=Count("alumni_recognitions", filter=Q(alumni_recognitions__status=AlumniRecognition.Status.APPROVED))
        ).order_by("order", "name")
        serialized = RecognitionTitleSerializer(titles, many=True).data
        # Attach alumni_count
        count_map = {t.id: t.alumni_count for t in titles}
        for item in serialized:
            item["alumni_count"] = count_map.get(item["id"], 0)
        return Response({"results": serialized})

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


class AdminAlumniRecognitionCreateView(APIView):
    permission_classes = [IsAdminOrStaffUser]

    def post(self, request, identifier):
        profile = AlumniProfile.objects.filter(id=int(identifier) if identifier.isdigit() else 0).first() or AlumniProfile.objects.filter(slug=identifier).first()
        if not profile:
            return Response({"message": "Bitiruvchi topilmadi"}, status=status.HTTP_404_NOT_FOUND)

        title_id = request.data.get("title_id") or request.data.get("title")
        if not title_id:
            return Response({"message": "Mukofot / Unvon tanlanishi shart (title_id)"}, status=status.HTTP_400_BAD_REQUEST)

        title = RecognitionTitle.objects.filter(id=title_id).first()
        if not title:
            return Response({"message": "Bunday e’tirof / mukofot topilmadi"}, status=status.HTTP_404_NOT_FOUND)

        rec = AlumniRecognition(
            alumnus=profile,
            title=title,
            level=request.data.get("level") or None,
            year=request.data.get("year") or None,
            valid_from=request.data.get("valid_from") or None,
            valid_until=request.data.get("valid_until") or None,
            justification=request.data.get("justification", "").strip(),
            status=request.data.get("status", AlumniRecognition.Status.APPROVED),
            approved_by=request.user,
            approved_at=timezone.now(),
        )
        try:
            rec.full_clean()
            rec.save()
        except DjangoValidationError as err:
            msg = err.messages[0] if hasattr(err, "messages") else str(err)
            return Response({"message": msg}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {
                "success": True,
                "message": f"{profile.full_name} ga {title.name} muvaffaqiyatli biriktirildi.",
                "data": AlumniRecognitionSerializer(rec).data,
            },
            status=status.HTTP_201_CREATED
        )


class AdminAlumniRecognitionRevokeView(APIView):
    permission_classes = [IsAdminOrStaffUser]

    def post(self, request, pk):
        rec = AlumniRecognition.objects.filter(pk=pk).first()
        if not rec:
            return Response({"message": "Mukofot birikmasi topilmadi"}, status=status.HTTP_404_NOT_FOUND)

        reason = request.data.get("revocation_reason", "").strip() or "Admin qarori asosida bekor qilindi."
        rec.status = AlumniRecognition.Status.REVOKED
        rec.is_active = False
        rec.revoked_by = request.user
        rec.revoked_at = timezone.now()
        rec.revocation_reason = reason
        rec.save()

        return Response({
            "success": True,
            "message": f"{rec.title.name} e’tirofi bekor qilindi (Revoked).",
            "data": AlumniRecognitionSerializer(rec).data
        })



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

