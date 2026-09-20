from django.db.models import Q
from django.utils import timezone
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdminOrStaffUser
from apps.feedback.models import Feedback


class AdminStandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class AdminFeedbackListView(APIView):
    permission_classes = [IsAdminOrStaffUser]
    pagination_class = AdminStandardPagination

    def get(self, request):
        qs = Feedback.objects.select_related("alumni", "story").order_by("-created_at")

        search = request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(name__icontains=search)
                | Q(contact__icontains=search)
                | Q(message__icontains=search)
                | Q(alumni__full_name__icontains=search)
            )

        status_filter = request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)

        type_filter = request.query_params.get("type")
        if type_filter:
            qs = qs.filter(type=type_filter)

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(qs, request)
        data = [
            {
                "id": f.id,
                "type": f.type,
                "type_display": f.get_type_display(),
                "name": f.name,
                "contact": f.contact,
                "message": f.message,
                "page_type": f.page_type,
                "page_url": f.page_url,
                "alumni_id": f.alumni_id,
                "alumni_name": f.alumni.full_name if f.alumni else None,
                "story_id": f.story_id,
                "story_title": f.story.title_uz if f.story else None,
                "status": f.status,
                "status_display": f.get_status_display(),
                "created_at": f.created_at,
                "reviewed_at": f.reviewed_at,
                "reviewed_by": f.reviewed_by,
            }
            for f in page
        ]
        return paginator.get_paginated_response(data)


class AdminFeedbackDetailView(APIView):
    permission_classes = [IsAdminOrStaffUser]

    def get_object(self, pk):
        return Feedback.objects.select_related("alumni", "story").filter(pk=pk).first()

    def get(self, request, pk):
        f = self.get_object(pk)
        if not f:
            return Response({"message": "Murojaat topilmadi"}, status=status.HTTP_404_NOT_FOUND)
        return Response({
            "id": f.id,
            "type": f.type,
            "type_display": f.get_type_display(),
            "name": f.name,
            "contact": f.contact,
            "message": f.message,
            "page_type": f.page_type,
            "page_url": f.page_url,
            "alumni_id": f.alumni_id,
            "alumni_name": f.alumni.full_name if f.alumni else None,
            "story_id": f.story_id,
            "story_title": f.story.title_uz if f.story else None,
            "status": f.status,
            "status_display": f.get_status_display(),
            "telegram_delivery_status": f.telegram_delivery_status,
            "created_at": f.created_at,
            "reviewed_at": f.reviewed_at,
            "reviewed_by": f.reviewed_by,
        })

    def patch(self, request, pk):
        f = self.get_object(pk)
        if not f:
            return Response({"message": "Murojaat topilmadi"}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get("status")
        if new_status and new_status in Feedback.Status.values:
            f.status = new_status
            f.reviewed_at = timezone.now()
            f.reviewed_by = request.user.email if hasattr(request.user, "email") else str(request.user)
            f.save()

        return Response({
            "success": True,
            "status": f.status,
            "status_display": f.get_status_display(),
            "reviewed_at": f.reviewed_at,
            "reviewed_by": f.reviewed_by,
            "message": "Holat yangilandi"
        })

    def delete(self, request, pk):
        f = self.get_object(pk)
        if not f:
            return Response({"message": "Murojaat topilmadi"}, status=status.HTTP_404_NOT_FOUND)
        f.delete()
        return Response({"success": True, "message": "Murojaat o‘chirildi"}, status=status.HTTP_204_NO_CONTENT)

