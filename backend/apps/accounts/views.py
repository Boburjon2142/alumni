import html
import logging
import secrets
from datetime import timedelta
from django.conf import settings
from django.contrib.auth import login, logout
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from google.oauth2 import id_token
from google.auth.transport.requests import Request as GoogleRequest
from google.auth.exceptions import GoogleAuthError
from django.db import transaction
from django.core.mail import send_mail
from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import EmailVerificationCode, User
from .serializers import (
    GoogleAuthSerializer,
    LoginSerializer,
    RegisterSerializer,
    SendCodeSerializer,
    UserSerializer,
    VerifyCodeSerializer,
)

logger = logging.getLogger(__name__)

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        s = RegisterSerializer(data=request.data); s.is_valid(raise_exception=True); user = s.save(); login(request, user)
        return Response({"success": True, "data": UserSerializer(user).data}, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        s = LoginSerializer(data=request.data, context={"request": request}); s.is_valid(raise_exception=True); login(request, s.validated_data["user"])
        return Response({"success": True, "data": UserSerializer(s.validated_data["user"]).data})

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request): logout(request); return Response(status=status.HTTP_204_NO_CONTENT)

class SendVerificationCodeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SendCodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].strip().lower()
        purpose = serializer.validated_data["purpose"]

        # Rate limiting: 1 code per 60 seconds
        recent = EmailVerificationCode.objects.filter(
            email=email,
            purpose=purpose,
            created_at__gte=timezone.now() - timedelta(seconds=60),
        ).first()
        if recent:
            remaining = int(60 - (timezone.now() - recent.created_at).total_seconds())
            raise ValidationError(
                f"Tasdiqlash kodi allaqachon yuborilgan. Iltimos, {max(1, remaining)} soniyadan so‘ng qayta urinib ko‘ring."
            )

        # Generate 6-digit code
        code = f"{secrets.randbelow(1000000):06d}"
        expires_at = timezone.now() + timedelta(minutes=10)

        # Clean old unverified codes
        EmailVerificationCode.objects.filter(email=email, purpose=purpose, is_verified=False).delete()

        EmailVerificationCode.objects.create(
            email=email,
            code=code,
            purpose=purpose,
            expires_at=expires_at,
        )

        # 1. Telegram bot / admin guruhga tezkor bildirishnoma yuborish
        try:
            from apps.alumni.telegram_bot import send_telegram_raw
            admin_chat_id = getattr(settings, "TELEGRAM_ADMIN_CHAT_ID", None)
            if admin_chat_id:
                tg_text = (
                    f"🔐 <b>QarshiDU Alumni — Yangi tasdiqlash kodi</b>\n\n"
                    f"📧 Email: <code>{html.escape(email)}</code>\n"
                    f"🔑 Kod: <code>{code}</code>\n"
                    f"🎯 Maqsad: {purpose}\n"
                    f"⏰ Amal qilish muddati: 10 daqiqa"
                )
                send_telegram_raw(admin_chat_id, tg_text)
        except Exception as e:
            logger.warning("Telegram notification for verification code failed: %s", e)

        # 2. Send Email via Django send_mail
        subject = f"QarshiDU Alumni — Tasdiqlash kodi: {code}"
        message = (
            f"Assalomu alaykum!\n\n"
            f"QarshiDU bitiruvchilar portalida tasdiqlash kodingiz: {code}\n"
            f"Ushbu kod 10 daqiqa davomida amal qiladi.\n\n"
            f"Agar bu so‘rovni siz amalga oshirmagan bo‘lsangiz, ushbu xatga e’tibor bermang."
        )
        html_message = f"""
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #002B49; margin-top: 0; font-size: 20px;">QarshiDU Bitiruvchilar Portali</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.5;">Assalomu alaykum! Profilingizni tasdiqlash uchun quyidagi bir martalik koddan foydalaning:</p>
          <div style="background: #f1f5f9; padding: 18px; border-radius: 8px; text-align: center; margin: 24px 0; border: 1px dashed #cbd5e1;">
            <span style="font-size: 34px; font-weight: bold; letter-spacing: 8px; color: #002B49; font-family: monospace;">{code}</span>
          </div>
          <p style="color: #64748b; font-size: 13px; line-height: 1.4;">
            ⏰ Ushbu kod <strong>10 daqiqa</strong> davomida amal qiladi.<br>
            Xavfsizlik yuzasidan kodni boshqalarga bermang.
          </p>
        </div>
        """

        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                html_message=html_message,
                fail_silently=False,
            )
        except Exception as e:
            logger.error("Failed to send verification email to %s: %s", email, e)
            EmailVerificationCode.objects.filter(email=email, purpose=purpose, code=code, is_verified=False).delete()
            return Response({"message": "Tasdiqlash xatini yuborib bo'lmadi. Keyinroq qayta urinib ko'ring."}, status=503)

        return Response({
            "success": True,
            "message": "Tasdiqlash kodi emailingizga yuborildi.",
            "email": email,
            "expires_in": 600,
        })


@method_decorator(csrf_protect, name="dispatch")
class VerifyCodeView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        serializer = VerifyCodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].strip().lower()
        code = serializer.validated_data["code"].strip()
        purpose = serializer.validated_data["purpose"]

        record = EmailVerificationCode.objects.select_for_update().filter(
            email=email,
            purpose=purpose,
            is_verified=False,
        ).order_by("-created_at").first()

        if not record or not record.is_valid():
            raise ValidationError("Tasdiqlash kodi eskirgan yoki topilmadi. Yangi kod so‘rang.")

        if record.code != code:
            record.attempts += 1
            record.save(update_fields=["attempts"])
            remaining = max(0, 5 - record.attempts)
            return Response({"message": f"Kod xato. Qolgan urinishlar: {remaining}"}, status=400)

        record.is_verified = True
        record.save(update_fields=["is_verified"])

        # If logging in via OTP
        if purpose == "login":
            user = User.objects.filter(email__iexact=email).first()
            if user and not user.is_active:
                raise ValidationError({"email": "Bu hisobga kirish mumkin emas."})
            if not user:
                # Create user for verified email
                user = User.objects.create_user(email=email)
                from apps.alumni.models import AlumniProfile
                AlumniProfile.objects.get_or_create(user=user, defaults={"full_name": email.split("@")[0].capitalize()})
            login(request, user)
            return Response({
                "success": True,
                "verified": True,
                "authenticated": True,
                "user": UserSerializer(user).data,
                "message": "Email tasdiqlandi va tizimga muvaffaqiyatli kirildi.",
            })

        request.session["verified_join"] = {"email": email, "expires": (timezone.now() + timedelta(minutes=10)).timestamp()}
        return Response({
            "success": True,
            "verified": True,
            "email": email,
            "message": "Email muvaffaqiyatli tasdiqlandi.",
        })

@method_decorator(csrf_protect, name="dispatch")
class GoogleAuthView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        credential = serializer.validated_data["credential"]

        if not settings.GOOGLE_CLIENT_ID:
            return Response({"message": "Google orqali kirish hali sozlanmagan. Email orqali kiring."}, status=503)
        nonce = request.session.get("google_nonce")
        try:
            payload = id_token.verify_oauth2_token(credential, GoogleRequest(), settings.GOOGLE_CLIENT_ID)
        except (ValueError, GoogleAuthError):
            raise ValidationError({"credential": "Google tasdig'i yaroqsiz yoki muddati o'tgan. Qayta kiring."})
        if not nonce or not secrets.compare_digest(str(payload.get("nonce", "")), nonce):
            raise ValidationError({"credential": "Google kirish sessiyasi eskirgan. Oynani qayta oching."})
        if payload.get("email_verified") is not True or not payload.get("sub") or not payload.get("email"):
            raise ValidationError({"credential": "Google hisobining email manzili tasdiqlanmagan."})
        email = payload["email"].strip().lower()
        # Google is authoritative for Gmail and verified Workspace addresses only.
        if not (email.endswith("@gmail.com") or payload.get("hd")):
            raise ValidationError({"credential": "Ushbu email uchun email tasdiqlash kodi orqali kiring."})
        full_name = payload.get("name") or payload.get("given_name") or ""
        user = User.objects.filter(google_sub=payload["sub"]).first()
        if user is None:
            user = User.objects.filter(email__iexact=email).first()
        if user and (not user.is_active or (user.google_sub and user.google_sub != payload["sub"])):
            raise ValidationError({"credential": "Bu hisobga kirish mumkin emas."})
        if user is None:
            user = User.objects.create_user(email=email, google_sub=payload["sub"])
        elif not user.google_sub:
            user.google_sub = payload["sub"]
            user.save(update_fields=["google_sub"])
        request.session.pop("google_nonce", None)

        from apps.alumni.models import AlumniProfile
        profile, created_profile = AlumniProfile.objects.get_or_create(
            user=user,
            defaults={
                "full_name": full_name or email.split("@")[0].capitalize(),
                "contact_email": email,
                "approval_status": AlumniProfile.ApprovalStatus.APPROVED,
                "is_published": True,
                "approved_at": timezone.now(),
            },
        )

        login(request, user)

        return Response({
            "success": True,
            "authenticated": True,
            "user": UserSerializer(user).data,
            "profile": {
                "id": profile.id,
                "full_name": profile.full_name,
                "slug": profile.slug,
            },
            "message": "Google orqali muvaffaqiyatli kirdingiz.",
        })



class SessionView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        response = Response({
            "authenticated": request.user.is_authenticated,
            "user": UserSerializer(request.user).data if request.user.is_authenticated else None,
            "csrf_token": get_token(request),
        })
        response["Cache-Control"] = "no-store"
        return response

class GoogleConfigView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        request.session["google_nonce"] = secrets.token_urlsafe(32)
        response = Response({"client_id": settings.GOOGLE_CLIENT_ID, "nonce": request.session["google_nonce"], "csrf_token": get_token(request)})
        response["Cache-Control"] = "no-store"
        return response
