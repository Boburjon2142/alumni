from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Feedback
from .serializers import FeedbackSerializer
from .telegram import send_telegram_notification

class FeedbackCreateView(generics.CreateAPIView):
    permission_classes = (AllowAny,)
    serializer_class = FeedbackSerializer

    def perform_create(self, serializer):
        ip = self.request.META.get("HTTP_X_FORWARDED_FOR", self.request.META.get("REMOTE_ADDR", ""))
        feedback = serializer.save(ip_address=ip[:45] if ip else None)
        send_telegram_notification(feedback)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({
            "success": True,
            "message": "Murojaatingiz qabul qilindi. Taklif va fikringiz uchun rahmat!",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)
