from django.contrib.auth import login
import logging
from django.db import transaction
from datetime import date
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from common.cache_utils import cache_api_response
from .models import AlumniProfile, AlumniRecognition, FeaturedAlumni, GraduationYearChangeRequest, RecognitionTitle
from .notifications import get_approver_display_name, notify_new_alumni_confirmed

logger = logging.getLogger(__name__)

from .serializers import (
    AlumniSubmissionSerializer,
    FeaturedSerializer,
    GraduationGroupItemSerializer,
    GraduationYearChangeRequestSerializer,
    OwnAlumniSerializer,
    PublicAlumniDetailSerializer,
    PublicAlumniListSerializer,
    RecognitionTitleSerializer,
)

def visible_profiles(request):
    return AlumniProfile.objects.filter(
        is_published=True,
        approval_status=AlumniProfile.ApprovalStatus.APPROVED
    ).select_related("faculty", "specialty").prefetch_related("recognitions__title").distinct()

class RecognitionTitleListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = RecognitionTitleSerializer
    pagination_class = None

    @cache_api_response("recognition_titles", timeout=1800)
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        return RecognitionTitle.objects.filter(is_active=True).order_by("order", "name")

class AlumniListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = PublicAlumniListSerializer
    filterset_fields = {"graduation_year": ["exact"]}
    search_fields = ["full_name", "current_company", "position", "current_activity", "city", "country", "specialty__name", "faculty__name"]

    @cache_api_response("alumni_list", timeout=300)
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


    def get_queryset(self):
        qs = visible_profiles(self.request)
        search = self.request.query_params.get("search", "").strip()
        if len(search) > 100:
            raise ValidationError({"search": "Qidiruv matni 100 belgidan oshmasligi kerak."})
        faculty = self.request.query_params.get("faculty")
        specialty = self.request.query_params.get("specialty")
        industry = self.request.query_params.get("industry")
        company = self.request.query_params.get("company")
        location = self.request.query_params.get("location")
        year = self.request.query_params.get("year") or self.request.query_params.get("graduation_year")
        recognition = self.request.query_params.get("recognition")

        if search:
            qs = qs.filter(
                Q(full_name__icontains=search) |
                Q(current_company__icontains=search) |
                Q(position__icontains=search) |
                Q(current_activity__icontains=search) |
                Q(city__icontains=search) |
                Q(country__icontains=search) |
                Q(specialty__name__icontains=search) |
                Q(faculty__name__icontains=search)
            )
        if faculty:
            qs = qs.filter(faculty__name__icontains=faculty)
        if specialty:
            qs = qs.filter(specialty__name__icontains=specialty)
        if industry:
            qs = qs.filter(industry__icontains=industry)
        if company:
            qs = qs.filter(current_company__icontains=company)
        if location:
            qs = qs.filter(Q(city__icontains=location) | Q(country__icontains=location))
        if year and str(year).isdigit():
            qs = qs.filter(graduation_year=int(year))
        if recognition:
            qs = qs.filter(
                recognitions__title__slug=recognition,
                recognitions__is_active=True,
                recognitions__title__is_active=True
            )
        if self.request.query_params.get("featured") == "true":
            qs = qs.filter(Q(is_honorary=True) | Q(is_featured=True))

        ordering = self.request.query_params.get("ordering", "featured")
        allowed = {
            "name": ("full_name",),
            "graduation_year": ("-graduation_year", "full_name"),
            "graduation_year_asc": ("graduation_year", "full_name"),
            "year_asc": ("graduation_year", "full_name"),
            "newest": ("-published_at", "full_name"),
            "featured": ("-is_honorary", "-is_featured", "featured_order", "full_name"),
        }
        return qs.order_by(*allowed.get(ordering, allowed["featured"])).distinct()

class AlumniDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = PublicAlumniDetailSerializer
    lookup_field = "slug"

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return (
                AlumniProfile.objects.select_related("faculty", "specialty", "approved_by")
                .prefetch_related("achievements", "timeline", "educations", "work_experiences", "sources", "advice")
            )
        return visible_profiles(self.request).select_related("approved_by").prefetch_related(
            "achievements", "timeline", "educations", "work_experiences", "sources", "advice"
        )

class AlumniSubmissionCreateView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = AlumniSubmissionSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        profile = serializer.save()
        request.session.pop("verified_join", None)
        login(request, profile.user)

        # Yangi bitiruvchi qo'shilganda bildirishnomalarni darhol jo'natish (ehtiyot chorasi asosida faollashtiriladi)
        try:
            from apps.alumni.notifications import notify_new_alumni_confirmed
            notify_new_alumni_confirmed(profile, approver_user=None)
        except Exception as exc:
            logger.warning("Submission bildirishnomasida xatolik: %s", exc)

        return Response(
            {
                "success": True,
                  "authenticated": True,
                "message": "Anketangiz muvaffaqiyatli qabul qilindi va profilingiz e’lon qilindi.",
                "data": {
                    "id": profile.id,
                    "full_name": profile.full_name,
                    "graduation_year": profile.graduation_year,
                    "approval_status": profile.approval_status,
                },
            },
            status=status.HTTP_201_CREATED,
        )

class GraduationGroupListView(APIView):
    permission_classes = [AllowAny]

    @cache_api_response("graduation_groups", timeout=600)
    def get(self, request):
        search = request.query_params.get("search", "").strip()
        region = request.query_params.get("region", "").strip() or request.query_params.get("city", "").strip()
        
        base_qs = visible_profiles(request).exclude(graduation_year__isnull=True)
        
        if region:
            if region.lower() in ["xorij", "chet el", "foreign", "abroad", "xorij / chet el"]:
                base_qs = base_qs.exclude(country__iexact="O‘zbekiston").exclude(country__iexact="O'zbekiston").exclude(country__iexact="Uzbekistan")
            else:
                base_qs = base_qs.filter(
                    Q(city__icontains=region)
                    | Q(country__icontains=region)
                    | Q(current_activity__icontains=region)
                    | Q(current_company__icontains=region)
                )

        if search:
            if search.isdigit():
                base_qs = base_qs.filter(graduation_year=int(search))
            else:
                base_qs = base_qs.filter(
                    Q(full_name__icontains=search)
                    | Q(city__icontains=search)
                    | Q(country__icontains=search)
                    | Q(current_company__icontains=search)
                    | Q(position__icontains=search)
                    | Q(current_activity__icontains=search)
                )

        qs = (
            base_qs.values("graduation_year")
            .annotate(members_count=Count("id"))
            .order_by("-graduation_year")
        )

        groups = [
            {
                "year": row["graduation_year"],
                "members_count": row["members_count"],
                "title": f"{row['graduation_year']}-yil bitiruvchilari",
                "subtitle": "Qarshi davlat universiteti",
                "description": f"{row['graduation_year']}-yilda Qarshi davlat universitetini tamomlagan bitiruvchilar.",
            }
            for row in qs
        ]
        return Response({"success": True, "data": groups})

class GraduationGroupDetailView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = PublicAlumniListSerializer

    def get_queryset(self):
        year = self.kwargs.get("year")
        current_year = date.today().year
        if year < 1956 or year > current_year + 1:
            raise ValidationError({"year": f"Bitiruv yili 1956 va {current_year + 1} oralig‘ida bo‘lishi kerak."})
        
        qs = visible_profiles(self.request).filter(graduation_year=year)
        region = self.request.query_params.get("region", "").strip() or self.request.query_params.get("city", "").strip()
        if region:
            if region.lower() in ["xorij", "chet el", "foreign", "abroad", "xorij / chet el"]:
                qs = qs.exclude(country__iexact="O‘zbekiston").exclude(country__iexact="O'zbekiston").exclude(country__iexact="Uzbekistan")
            else:
                qs = qs.filter(
                    Q(city__icontains=region)
                    | Q(country__icontains=region)
                    | Q(current_activity__icontains=region)
                    | Q(current_company__icontains=region)
                )
        return qs.order_by("-is_honorary", "-is_featured", "featured_order", "full_name")

    @cache_api_response("graduation_group_detail", timeout=600)
    def list(self, request, *args, **kwargs):
        year = self.kwargs.get("year")
        response = super().list(request, *args, **kwargs)
        total_count = self.get_queryset().count()
        group_meta = {
            "year": year,
            "title": f"{year}-yil bitiruvchilari",
            "subtitle": "Qarshi davlat universiteti",
            "description": f"{year}-yilda Qarshi davlat universitetini tamomlagan bitiruvchilar.",
            "total_members": total_count,
            "members_count": total_count,
        }
        if isinstance(response.data, dict):
            response.data["group"] = group_meta
        return response

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request):
        profile = (
            AlumniProfile.objects.select_related("faculty", "specialty", "user")
            .prefetch_related("educations", "work_experiences", "graduation_year_requests")
            .filter(user=request.user)
            .first()
        )
        if not profile:
            if request.user.email:
                profile = AlumniProfile.objects.filter(contact_email__iexact=request.user.email).first()
                if profile:
                    profile.user = request.user
                    profile.save(update_fields=["user"])
                    return profile

            full_name = f"{request.user.first_name} {request.user.last_name}".strip() or request.user.email.split("@")[0].capitalize()
            profile = AlumniProfile.objects.create(
                user=request.user,
                full_name=full_name,
                contact_email=request.user.email,
                approval_status=AlumniProfile.ApprovalStatus.PENDING,
                is_published=False,
            )
        return profile

    def get(self, request):
        return Response({"success": True, "data": OwnAlumniSerializer(self.get_object(request)).data})

    def patch(self, request):
        serializer = OwnAlumniSerializer(self.get_object(request), data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"success": True, "data": serializer.data})


class GraduationYearRequestCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            profile = request.user.alumni_profile
        except AlumniProfile.DoesNotExist:
            raise NotFound("Bitiruvchi profili topilmadi.")

        pending = profile.graduation_year_requests.filter(status=GraduationYearChangeRequest.Status.PENDING).first()
        if pending:
            raise ValidationError(
                {"detail": "Sizning bitiruv yilini o‘zgartirish bo‘yicha ko‘rib chiqilayotgan so‘rovingiz mavjud. Iltimos, admin tasdiqlashini kuting."}
            )

        serializer = GraduationYearChangeRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        req_obj = serializer.save(
            alumnus=profile,
            old_year=profile.graduation_year,
            status=GraduationYearChangeRequest.Status.PENDING,
        )

        return Response(
            {
                "success": True,
                "message": "Bitiruv yilini o‘zgartirish so‘rovingiz adminga muvaffaqiyatli yuborildi. Admin tasdiqlagach, yilingiz yangilanadi.",
                "data": GraduationYearChangeRequestSerializer(req_obj).data,
            },
            status=status.HTTP_201_CREATED,
        )

class FeaturedListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = FeaturedSerializer
    pagination_class = None

    @cache_api_response("featured_alumni", timeout=600)
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        return FeaturedAlumni.objects.filter(
            is_active=True,
            alumni__is_published=True,
            alumni__approval_status=AlumniProfile.ApprovalStatus.APPROVED,
        ).select_related("alumni", "alumni__faculty", "alumni__specialty").order_by("display_order", "id")[:12]



class AlumniConfirmView(APIView):
    """
    Bitiruvchini boshqa bitiruvchi (peer confirmation) yoki universitet xodimi tomonidan tasdiqlash endpointi.
    POST /api/v1/alumni/<slug>/confirm/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        user = request.user
        target_profile = get_object_or_404(AlumniProfile, slug=slug)

        # Huquqni tekshirish: Admin/xodim yoki tasdiqlangan bitiruvchi bo'lishi shart
        is_admin_or_staff = user.is_staff or user.is_superuser or getattr(user, "role", "") in ["admin", "staff"]
        has_approved_profile = (
            hasattr(user, "alumni_profile")
            and user.alumni_profile is not None
            and user.alumni_profile.approval_status == AlumniProfile.ApprovalStatus.APPROVED
        )

        if not (is_admin_or_staff or has_approved_profile):
            raise ValidationError(
                "Yangi bitiruvchini tasdiqlash uchun sizning profilingiz ham tasdiqlangan bitiruvchi bo‘lishi lozim."
            )

        # O'z profilini tasdiqlash taqiqlanadi
        if hasattr(user, "alumni_profile") and user.alumni_profile and user.alumni_profile.pk == target_profile.pk:
            raise ValidationError("O‘z profilingizni o‘zingiz tasdiqlay olmaysiz.")

        # Allaqachon tasdiqlangan bo'lsa
        if target_profile.approval_status == AlumniProfile.ApprovalStatus.APPROVED:
            return Response(
                {
                    "success": True,
                    "message": "Ushbu bitiruvchi allaqachon tasdiqlangan.",
                    "data": {
                        "id": target_profile.id,
                        "slug": target_profile.slug,
                        "full_name": target_profile.full_name,
                        "approval_status": target_profile.approval_status,
                        "approved_by": get_approver_display_name(target_profile.approved_by),
                        "approved_at": target_profile.approved_at,
                    },
                },
                status=status.HTTP_200_OK,
            )

        # Tasdiqlash va e'lon qilish
        target_profile.approval_status = AlumniProfile.ApprovalStatus.APPROVED
        target_profile.approved_by = user
        target_profile.approved_at = timezone.now()
        target_profile.is_published = True
        target_profile.verification_status = AlumniProfile.Verification.VERIFIED
        target_profile.save()

        # Bildirishnomalarni yuborish (mavjud bitiruvchilarga email va Telegram botga)
        notify_new_alumni_confirmed(target_profile, approver_user=user)

        return Response(
            {
                "success": True,
                "message": f"{target_profile.full_name} muvaffaqiyatli tasdiqlandi. Mavjud bitiruvchilarga va Telegram botga xabarnoma yuborildi.",
                "data": {
                    "id": target_profile.id,
                    "slug": target_profile.slug,
                    "full_name": target_profile.full_name,
                    "approval_status": target_profile.approval_status,
                    "approved_by": get_approver_display_name(user),
                    "approved_at": target_profile.approved_at,
                },
            },
            status=status.HTTP_200_OK,
        )


