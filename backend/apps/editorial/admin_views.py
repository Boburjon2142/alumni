from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from django.utils.text import slugify
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdminOrStaffUser
from apps.alumni.models import AlumniProfile
from apps.editorial.models import (
    AlumniAdvice,
    AlumniInterview,
    Event,
    EventSpeaker,
    InterviewItem,
    StorySection,
    SuccessStory,
)
from apps.editorial.serializers import (
    AdviceSerializer,
    EventDetailSerializer,
    EventListSerializer,
    InterviewDetailSerializer,
    InterviewItemSerializer,
    InterviewListSerializer,
    StorySectionSerializer,
    SuccessStoryDetailSerializer,
    SuccessStoryListSerializer,
)


class AdminStandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


# --- Success Stories ---
class AdminSuccessStoryListView(APIView):
    permission_classes = [IsAdminOrStaffUser]
    pagination_class = AdminStandardPagination

    def get(self, request):
        qs = SuccessStory.objects.select_related("alumnus", "alumnus__faculty").order_by("-created_at")
        search = request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(title_uz__icontains=search)
                | Q(title_en__icontains=search)
                | Q(alumnus__full_name__icontains=search)
            )
        is_published = request.query_params.get("is_published")
        if is_published is not None:
            qs = qs.filter(is_published=is_published.lower() in ("true", "1"))

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(qs, request)
        serializer = SuccessStoryDetailSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    @transaction.atomic
    def post(self, request):
        data = request.data
        alumnus_id = data.get("alumni_id") or data.get("alumnus")
        alumnus = AlumniProfile.objects.filter(id=alumnus_id).first()
        if not alumnus:
            return Response({"message": "Bitiruvchi topilmadi"}, status=status.HTTP_400_BAD_REQUEST)

        title_uz = data.get("title_uz", "").strip()
        if not title_uz:
            return Response({"message": "Sarlavha (UZ) majburiy"}, status=status.HTTP_400_BAD_REQUEST)

        slug = data.get("slug", "").strip() or slugify(title_uz)
        # Ensure unique slug
        base_slug = slug
        counter = 2
        while SuccessStory.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        story = SuccessStory.objects.create(
            alumnus=alumnus,
            slug=slug,
            title_uz=title_uz,
            title_en=data.get("title_en", "").strip(),
            summary_uz=data.get("summary_uz", "").strip(),
            summary_en=data.get("summary_en", "").strip(),
            hero_image_url=data.get("hero_image_url", "").strip(),
            hero_image_alt=data.get("hero_image_alt", "").strip(),
            hero_image_credit=data.get("hero_image_credit", "").strip(),
            hero_image_source_url=data.get("hero_image_source_url", "").strip(),
            student_takeaway_uz=data.get("student_takeaway_uz", "").strip(),
            student_takeaway_en=data.get("student_takeaway_en", "").strip(),
            is_featured=bool(data.get("is_featured", False)),
            is_published=bool(data.get("is_published", False)),
        )

        sections_data = data.get("sections", [])
        for idx, sec in enumerate(sections_data):
            StorySection.objects.create(
                story=story,
                kind=sec.get("kind", StorySection.Kind.INTRODUCTION),
                heading_uz=sec.get("heading_uz", "").strip(),
                heading_en=sec.get("heading_en", "").strip(),
                content_uz=sec.get("content_uz", "").strip(),
                content_en=sec.get("content_en", "").strip(),
                order=idx,
            )

        return Response(SuccessStoryDetailSerializer(story).data, status=status.HTTP_201_CREATED)


class AdminSuccessStoryDetailView(APIView):
    permission_classes = [IsAdminOrStaffUser]

    def get_object(self, pk):
        return SuccessStory.objects.select_related("alumnus", "alumnus__faculty").prefetch_related("sections").filter(pk=pk).first()

    def get(self, request, pk):
        story = self.get_object(pk)
        if not story:
            return Response({"message": "Hikoya topilmadi"}, status=status.HTTP_404_NOT_FOUND)
        return Response(SuccessStoryDetailSerializer(story).data)

    @transaction.atomic
    def put(self, request, pk):
        story = self.get_object(pk)
        if not story:
            return Response({"message": "Hikoya topilmadi"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        if "alumni_id" in data:
            alumnus = AlumniProfile.objects.filter(id=data["alumni_id"]).first()
            if alumnus:
                story.alumnus = alumnus

        for field in [
            "title_uz", "title_en", "summary_uz", "summary_en",
            "hero_image_url", "hero_image_alt", "hero_image_credit", "hero_image_source_url",
            "student_takeaway_uz", "student_takeaway_en",
        ]:
            if field in data:
                setattr(story, field, data[field].strip() if isinstance(data[field], str) else data[field])

        if "is_featured" in data:
            story.is_featured = bool(data["is_featured"])
        if "is_published" in data:
            story.is_published = bool(data["is_published"])

        story.save()

        if "sections" in data and isinstance(data["sections"], list):
            story.sections.all().delete()
            for idx, sec in enumerate(data["sections"]):
                StorySection.objects.create(
                    story=story,
                    kind=sec.get("kind", StorySection.Kind.INTRODUCTION),
                    heading_uz=sec.get("heading_uz", "").strip(),
                    heading_en=sec.get("heading_en", "").strip(),
                    content_uz=sec.get("content_uz", "").strip(),
                    content_en=sec.get("content_en", "").strip(),
                    order=idx,
                )

        story = self.get_object(pk)
        return Response(SuccessStoryDetailSerializer(story).data)

    def delete(self, request, pk):
        story = self.get_object(pk)
        if not story:
            return Response({"message": "Hikoya topilmadi"}, status=status.HTTP_404_NOT_FOUND)
        story.delete()
        return Response({"success": True, "message": "Hikoya o‘chirildi"}, status=status.HTTP_204_NO_CONTENT)


# --- Interviews ---
class AdminInterviewListView(APIView):
    permission_classes = [IsAdminOrStaffUser]
    pagination_class = AdminStandardPagination

    def get(self, request):
        qs = AlumniInterview.objects.select_related("alumnus", "alumnus__faculty").prefetch_related("items").order_by("-created_at")
        search = request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(title_uz__icontains=search)
                | Q(title_en__icontains=search)
                | Q(alumnus__full_name__icontains=search)
            )
        is_published = request.query_params.get("is_published")
        if is_published is not None:
            qs = qs.filter(is_published=is_published.lower() in ("true", "1"))

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(qs, request)
        serializer = InterviewDetailSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    @transaction.atomic
    def post(self, request):
        data = request.data
        alumnus_id = data.get("alumni_id") or data.get("alumnus")
        alumnus = AlumniProfile.objects.filter(id=alumnus_id).first()
        if not alumnus:
            return Response({"message": "Bitiruvchi topilmadi"}, status=status.HTTP_400_BAD_REQUEST)

        title_uz = data.get("title_uz", "").strip()
        if not title_uz:
            return Response({"message": "Sarlavha (UZ) majburiy"}, status=status.HTTP_400_BAD_REQUEST)

        slug = data.get("slug", "").strip() or slugify(title_uz)
        base_slug = slug
        counter = 2
        while AlumniInterview.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        interview = AlumniInterview.objects.create(
            alumnus=alumnus,
            slug=slug,
            title_uz=title_uz,
            title_en=data.get("title_en", "").strip(),
            intro_uz=data.get("intro_uz", "").strip(),
            intro_en=data.get("intro_en", "").strip(),
            pull_quote_uz=data.get("pull_quote_uz", "").strip(),
            pull_quote_en=data.get("pull_quote_en", "").strip(),
            is_featured=bool(data.get("is_featured", False)),
            is_published=bool(data.get("is_published", False)),
        )

        items_data = data.get("items", [])
        for idx, item in enumerate(items_data):
            if item.get("question_uz"):
                InterviewItem.objects.create(
                    interview=interview,
                    question_uz=item.get("question_uz", "").strip(),
                    question_en=item.get("question_en", "").strip(),
                    answer_uz=item.get("answer_uz", "").strip(),
                    answer_en=item.get("answer_en", "").strip(),
                    order=idx,
                )

        return Response(InterviewDetailSerializer(interview).data, status=status.HTTP_201_CREATED)


class AdminInterviewDetailView(APIView):
    permission_classes = [IsAdminOrStaffUser]

    def get_object(self, pk):
        return AlumniInterview.objects.select_related("alumnus", "alumnus__faculty").prefetch_related("items").filter(pk=pk).first()

    def get(self, request, pk):
        interview = self.get_object(pk)
        if not interview:
            return Response({"message": "Intervyu topilmadi"}, status=status.HTTP_404_NOT_FOUND)
        return Response(InterviewDetailSerializer(interview).data)

    @transaction.atomic
    def put(self, request, pk):
        interview = self.get_object(pk)
        if not interview:
            return Response({"message": "Intervyu topilmadi"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        if "alumni_id" in data:
            alumnus = AlumniProfile.objects.filter(id=data["alumni_id"]).first()
            if alumnus:
                interview.alumnus = alumnus

        for field in ["title_uz", "title_en", "intro_uz", "intro_en", "pull_quote_uz", "pull_quote_en"]:
            if field in data:
                setattr(interview, field, data[field].strip() if isinstance(data[field], str) else data[field])

        if "is_featured" in data:
            interview.is_featured = bool(data["is_featured"])
        if "is_published" in data:
            interview.is_published = bool(data["is_published"])

        interview.save()

        if "items" in data and isinstance(data["items"], list):
            interview.items.all().delete()
            for idx, item in enumerate(data["items"]):
                if item.get("question_uz"):
                    InterviewItem.objects.create(
                        interview=interview,
                        question_uz=item.get("question_uz", "").strip(),
                        question_en=item.get("question_en", "").strip(),
                        answer_uz=item.get("answer_uz", "").strip(),
                        answer_en=item.get("answer_en", "").strip(),
                        order=idx,
                    )

        interview = self.get_object(pk)
        return Response(InterviewDetailSerializer(interview).data)

    def delete(self, request, pk):
        interview = self.get_object(pk)
        if not interview:
            return Response({"message": "Intervyu topilmadi"}, status=status.HTTP_404_NOT_FOUND)
        interview.delete()
        return Response({"success": True, "message": "Intervyu o‘chirildi"}, status=status.HTTP_204_NO_CONTENT)


# --- Advice ---
class AdminAdviceListView(APIView):
    permission_classes = [IsAdminOrStaffUser]
    pagination_class = AdminStandardPagination

    def get(self, request):
        qs = AlumniAdvice.objects.select_related("alumnus", "alumnus__faculty").order_by("-created_at")
        search = request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(title_uz__icontains=search)
                | Q(content_uz__icontains=search)
                | Q(alumnus__full_name__icontains=search)
            )
        category = request.query_params.get("category")
        if category:
            qs = qs.filter(category=category)

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(qs, request)
        serializer = AdviceSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        data = request.data
        alumnus_id = data.get("alumni_id") or data.get("alumnus")
        alumnus = AlumniProfile.objects.filter(id=alumnus_id).first()
        if not alumnus:
            return Response({"message": "Bitiruvchi topilmadi"}, status=status.HTTP_400_BAD_REQUEST)

        advice = AlumniAdvice.objects.create(
            alumnus=alumnus,
            category=data.get("category", AlumniAdvice.Category.CAREER),
            title_uz=data.get("title_uz", "").strip(),
            title_ru=data.get("title_ru", "").strip(),
            title_en=data.get("title_en", "").strip(),
            content_uz=data.get("content_uz", "").strip(),
            content_ru=data.get("content_ru", "").strip(),
            content_en=data.get("content_en", "").strip(),
            is_featured=bool(data.get("is_featured", False)),
            is_published=bool(data.get("is_published", True)),
        )
        return Response(AdviceSerializer(advice).data, status=status.HTTP_201_CREATED)


class AdminAdviceDetailView(APIView):
    permission_classes = [IsAdminOrStaffUser]

    def get_object(self, pk):
        return AlumniAdvice.objects.select_related("alumnus", "alumnus__faculty").filter(pk=pk).first()

    def get(self, request, pk):
        advice = self.get_object(pk)
        if not advice:
            return Response({"message": "Maslahat topilmadi"}, status=status.HTTP_404_NOT_FOUND)
        return Response(AdviceSerializer(advice).data)

    def put(self, request, pk):
        advice = self.get_object(pk)
        if not advice:
            return Response({"message": "Maslahat topilmadi"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        if "alumni_id" in data:
            alumnus = AlumniProfile.objects.filter(id=data["alumni_id"]).first()
            if alumnus:
                advice.alumnus = alumnus

        for field in ["category", "title_uz", "title_ru", "title_en", "content_uz", "content_ru", "content_en"]:
            if field in data:
                setattr(advice, field, data[field].strip() if isinstance(data[field], str) else data[field])

        if "is_featured" in data:
            advice.is_featured = bool(data["is_featured"])
        if "is_published" in data:
            advice.is_published = bool(data["is_published"])

        advice.save()
        return Response(AdviceSerializer(advice).data)

    def delete(self, request, pk):
        advice = self.get_object(pk)
        if not advice:
            return Response({"message": "Maslahat topilmadi"}, status=status.HTTP_404_NOT_FOUND)
        advice.delete()
        return Response({"success": True, "message": "Maslahat o‘chirildi"}, status=status.HTTP_204_NO_CONTENT)

