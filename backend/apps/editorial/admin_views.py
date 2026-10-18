from django.db.models import Q
from django.utils.text import slugify
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdminOrStaffUser
from common.cache_utils import invalidate_cache_prefix
from apps.alumni.models import AlumniProfile
from apps.editorial.models import News
from apps.editorial.serializers import AdminNewsSerializer


class AdminStandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


from .management_views import (
    AdminSuccessStoryListView, AdminSuccessStoryDetailView,
    AdminInterviewListView, AdminInterviewDetailView,
    AdminAdviceListView, AdminAdviceDetailView,
)


# --- News ---
class AdminNewsListView(APIView):
    permission_classes = [IsAdminOrStaffUser]
    pagination_class = AdminStandardPagination

    def get(self, request):
        qs = News.objects.all().order_by("-created_at", "-id")
        search = request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(title_uz__icontains=search)
                | Q(title_ru__icontains=search)
                | Q(title_en__icontains=search)
                | Q(summary_uz__icontains=search)
            )
        category = request.query_params.get("category")
        if category:
            qs = qs.filter(category=category)
        is_published = request.query_params.get("is_published")
        if is_published is not None and is_published != "":
            qs = qs.filter(is_published=is_published.lower() in ("true", "1"))

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(qs, request)
        serializer = AdminNewsSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        data = request.data
        title_uz = data.get("title_uz", "")
        title_uz = title_uz.strip() if isinstance(title_uz, str) else ""
        if not title_uz:
            return Response({"error": "Sarlavha (UZ) majburiy"}, status=status.HTTP_400_BAD_REQUEST)

        supplied_slug = data.get("slug", "")
        supplied_slug = supplied_slug.strip() if isinstance(supplied_slug, str) else ""
        slug = (supplied_slug or slugify(title_uz) or "yangilik")[:180]
        orig_slug = slug
        counter = 1
        while News.objects.filter(slug=slug).exists():
            slug = f"{orig_slug}-{counter}"
            counter += 1

        payload = data.copy()
        payload["slug"] = slug
        serializer = AdminNewsSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        invalidate_cache_prefix("api:news_list")
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AdminNewsDetailView(APIView):
    permission_classes = [IsAdminOrStaffUser]

    def get_object(self, pk):
        return News.objects.filter(pk=pk).first()

    def get(self, request, pk):
        news = self.get_object(pk)
        if not news:
            return Response({"message": "Yangilik topilmadi"}, status=status.HTTP_404_NOT_FOUND)
        return Response(AdminNewsSerializer(news).data)

    def put(self, request, pk):
        news = self.get_object(pk)
        if not news:
            return Response({"message": "Yangilik topilmadi"}, status=status.HTTP_404_NOT_FOUND)

        serializer = AdminNewsSerializer(news, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        invalidate_cache_prefix("api:news_list")
        return Response(serializer.data)

    def delete(self, request, pk):
        news = self.get_object(pk)
        if not news:
            return Response({"message": "Yangilik topilmadi"}, status=status.HTTP_404_NOT_FOUND)
        news.delete()
        invalidate_cache_prefix("api:news_list")
        return Response({"success": True, "message": "Yangilik o‘chirildi"}, status=status.HTTP_204_NO_CONTENT)


