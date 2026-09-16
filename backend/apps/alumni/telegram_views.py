import logging
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.alumni.telegram_bot import handle_telegram_update

logger = logging.getLogger(__name__)

class TelegramWebhookView(APIView):
    """
    Telegram Bot Webhook endpointi.
    Telegram serverlaridan kelgan /start, /tasdiqlanganlar va boshqa buyruqlarni qabul qiladi.
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        data = request.data
        if not isinstance(data, dict):
            return Response({"ok": False, "error": "Invalid payload"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            handle_telegram_update(data)
        except Exception as exc:
            logger.error("Telegram webhookni qayta ishlashda xatolik: %s", exc, exc_info=True)

        # Telegram webhook har doim 200 OK kutadi
        return Response({"ok": True}, status=status.HTTP_200_OK)

    def get(self, request, *args, **kwargs):
        """Webhook holatini tekshirish uchun."""
        return Response({"ok": True, "service": "QarshiDU Alumni Telegram Bot Webhook"})
