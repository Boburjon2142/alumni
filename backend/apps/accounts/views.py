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

        if settings.EMAIL_BACKEND in {
            "django.core.mail.backends.console.EmailBackend",
            "django.core.mail.backends.dummy.EmailBackend",
            "django.core.mail.backends.filebased.EmailBackend",
        }:
            return Response({"message": "Email yuborish xizmati sozlanmagan. Google orqali kiring."}, status=503)

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

        # 2. Send Email via Django send_mail
        purpose_titles = {
            "join": "Bitiruvchilar safiga qo‘shilish",
            "login": "Shaxsiy kabinetga kirish",
            "edit": "Profil ma’lumotlarini yangilash",
        }
        purpose_descriptions = {
            "join": (
                "Siz <strong>Qarshi davlat universiteti bitiruvchilar platformasi</strong>da "
                "(<a href='https://alumni.qarshidu.uz' style='color: #002b49; font-weight: 700; text-decoration: none;'>alumni.qarshidu.uz</a>) "
                "yangi bitiruvchi sifatida ro‘yxatdan o‘tish va anketangizni tasdiqlash so‘rovini yubordingiz. "
                "A’zolikni faollashtirish uchun quyidagi bir martalik maxsus koddan foydalaning:"
            ),
            "login": (
                "Siz <strong>Qarshi davlat universiteti bitiruvchilar platformasi</strong>dagi "
                "(<a href='https://alumni.qarshidu.uz' style='color: #002b49; font-weight: 700; text-decoration: none;'>alumni.qarshidu.uz</a>) "
                "shaxsiy profilingizga kirish so‘rovini amalga oshirdingiz. "
                "Tizimga kirishni tasdiqlash uchun quyidagi bir martalik xavfsizlik kodidan foydalaning:"
            ),
            "edit": (
                "Siz <strong>Qarshi davlat universiteti bitiruvchilar platformasi</strong>dagi "
                "(<a href='https://alumni.qarshidu.uz' style='color: #002b49; font-weight: 700; text-decoration: none;'>alumni.qarshidu.uz</a>) "
                "profilingiz ma’lumotlarini tahrirlash so‘rovini yubordingiz. "
                "O‘zgarishlarni tasdiqlash uchun quyidagi koddan foydalaning:"
            ),
        }

        title_text = purpose_titles.get(purpose, "Email manzilini tasdiqlash")
        desc_text = purpose_descriptions.get(
            purpose,
            "Siz <strong>Qarshi davlat universiteti bitiruvchilar platformasi</strong>da "
            "(<a href='https://alumni.qarshidu.uz' style='color: #002b49; font-weight: 700; text-decoration: none;'>alumni.qarshidu.uz</a>) "
            "tasdiqlash so‘rovini amalga oshirdingiz. Jarayonni yakunlash uchun quyidagi xavfsizlik kodidan foydalaning:"
        )

        subject = f"QarshiDU Alumni — {title_text}: {code}"
        message = (
            f"Assalomu alaykum!\n\n"
            f"Qarshi davlat universiteti bitiruvchilar platformasida (alumni.qarshidu.uz) "
            f"{title_text.lower()} uchun tasdiqlash kodingiz: {code}\n"
            f"Ushbu kod 10 daqiqa davomida amal qiladi.\n\n"
            f"Agar bu so‘rovni siz amalga oshirmagan bo‘lsangiz, ushbu xatga e’tibor bermang."
        )
        html_message = f"""
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 28px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
          <!-- Header: Circular Emblem & University Name -->
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
            <div style="display: inline-block; width: 68px; height: 68px; border-radius: 50%; background: #ffffff; padding: 4px; border: 2px solid #000000; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: hidden; vertical-align: middle;">
              <img src="https://alumni.qarshidu.uz/images/qardu-avatar.png" alt="QarDU" width="68" height="68" style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%; display: block; border: 0;" />
            </div>
            <div style="margin-top: 10px;">
              <h3 style="margin: 0; font-size: 15px; font-weight: 800; color: #000000; letter-spacing: 0.5px; text-transform: uppercase;">QARSHI DAVLAT UNIVERSITETI</h3>
              <p style="margin: 2px 0 0 0; font-size: 12.5px; font-weight: 600; color: #64748b;">Rasmiy bitiruvchilar platformasi (ALUMNI)</p>
            </div>
          </div>

          <!-- Main Title & Dynamic Action Description -->
          <div style="text-align: center; padding: 22px 0 16px 0;">
            <div style="display: inline-block; background: #f1f5f9; padding: 4px 12px; border-radius: 20px; font-size: 11.5px; font-weight: 700; color: #002b49; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
              alumni.qarshidu.uz
            </div>
            <h2 style="color: #000000; margin: 0 0 10px 0; font-size: 19px; font-weight: 800; letter-spacing: -0.3px;">{title_text}</h2>
            <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 auto; max-width: 400px;">
              {desc_text}
            </p>
          </div>

          <!-- Compact Centered OTP Box -->
          <div style="max-width: 290px; margin: 0 auto 20px auto; background: #f8fafc; padding: 14px 20px; border-radius: 12px; text-align: center; border: 2px dashed #000000;">
            <span style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #000000; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; display: inline-block; padding-left: 8px;">{code}</span>
          </div>

          <!-- Security & Expiration Box -->
          <div style="max-width: 400px; margin: 0 auto; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 10px; padding: 12px 16px; text-align: center;">
            <p style="color: #92400e; font-size: 12.5px; line-height: 1.45; margin: 0; font-weight: 600;">
              ⏰ Ushbu kod <strong>10 daqiqa</strong> davomida amal qiladi.
            </p>
            <p style="color: #b45309; font-size: 11.5px; line-height: 1.4; margin: 3px 0 0 0;">
              Xavfsizlik yuzasidan ushbu kodni begonalarga bermang.
            </p>
          </div>

          <!-- Footer -->
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 11.5px; color: #94a3b8;">
            Qarshi davlat universiteti bitiruvchilar hamjamiyati • <a href="https://alumni.qarshidu.uz" style="color: #002b49; font-weight: 600; text-decoration: none;">alumni.qarshidu.uz</a>
          </div>
        </div>
        """

        try:
            sent = send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                html_message=html_message,
                fail_silently=False,
            )
            if sent != 1:
                raise OSError("Email backend did not accept the message")
        except Exception as e:
            logger.error("Failed to send verification email to %s: %s", email, e)
            EmailVerificationCode.objects.filter(email=email, purpose=purpose, code=code, is_verified=False).delete()
            return Response({"message": "Tasdiqlash xatini yuborib bo‘lmadi. Keyinroq qayta urinib ko‘ring."}, status=503)

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
        # Reopening the dialog must not invalidate an already rendered Google button.
        if not request.session.get("google_nonce"):
            request.session["google_nonce"] = secrets.token_urlsafe(32)
        response = Response({"client_id": settings.GOOGLE_CLIENT_ID, "nonce": request.session["google_nonce"], "csrf_token": get_token(request)})
        response["Cache-Control"] = "no-store"
        return response
