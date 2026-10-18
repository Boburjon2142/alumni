from rest_framework import generics
from django.db.models.deletion import ProtectedError
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from apps.accounts.permissions import IsAdminOrStaffUser
from .models import AlumniAdvice, AlumniInterview, SuccessStory
from .management_serializers import AdviceManagementSerializer, InterviewManagementSerializer, StoryManagementSerializer


class ManagementPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class EditorialListView(generics.ListCreateAPIView):
    permission_classes = [IsAdminOrStaffUser]
    pagination_class = ManagementPagination
    search_fields = ("title_uz", "title_en", "alumnus__full_name")

    def get_queryset(self):
        qs = super().get_queryset().order_by("-created_at", "-id")
        published = self.request.query_params.get("is_published")
        if published is not None:
            qs = qs.filter(is_published=published.lower() in ("true", "1"))
        category = self.request.query_params.get("category")
        if category and self.serializer_class is AdviceManagementSerializer:
            qs = qs.filter(category=category)
        return qs


class EditorialDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminOrStaffUser]

    def update(self, request, *args, **kwargs):
        # Existing editors send partial PUT payloads; preserve omitted fields.
        kwargs["partial"] = True
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response({"message": "Bu yozuv boshqa ma’lumotlarga bog‘langan. Avval bog‘lanishlarni tahrirlang."}, status=409)


class AdminSuccessStoryListView(EditorialListView):
    queryset = SuccessStory.objects.select_related("alumnus", "alumnus__faculty").prefetch_related("sections")
    serializer_class = StoryManagementSerializer


class AdminSuccessStoryDetailView(EditorialDetailView):
    queryset = AdminSuccessStoryListView.queryset
    serializer_class = StoryManagementSerializer


class AdminInterviewListView(EditorialListView):
    queryset = AlumniInterview.objects.select_related("alumnus", "alumnus__faculty").prefetch_related("items")
    serializer_class = InterviewManagementSerializer


class AdminInterviewDetailView(EditorialDetailView):
    queryset = AdminInterviewListView.queryset
    serializer_class = InterviewManagementSerializer


class AdminAdviceListView(EditorialListView):
    queryset = AlumniAdvice.objects.select_related("alumnus", "alumnus__faculty", "source_interview_item")
    serializer_class = AdviceManagementSerializer
    search_fields = ("title_uz", "title_en", "content_uz", "alumnus__full_name")


class AdminAdviceDetailView(EditorialDetailView):
    queryset = AdminAdviceListView.queryset
    serializer_class = AdviceManagementSerializer
