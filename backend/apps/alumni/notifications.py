import html
import logging
from typing import Optional
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
import requests

logger = logging.getLogger(__name__)

def get_approver_display_name(approver_user) -> str:
    """Tasdiqlovchi shaxsning to'liq ismini yoki rolini qaytaradi."""
    if not approver_user:
        return "QarshiDU Hamjamiyati"
    try:
        if hasattr(approver_user, "alumni_profile") and approver_user.alumni_profile:
            return approver_user.alumni_profile.full_name
    except Exception:
        pass

    full_name = f"{getattr(approver_user, 'first_name', '')} {getattr(approver_user, 'last_name', '')}".strip()
    if full_name:
        return full_name
    return getattr(approver_user, "email", "Tasdiqlangan bitiruvchi")

def send_telegram_alumni_confirmed_post(profile, approver_name: str) -> bool:
    """Telegram guruh/kanaliga yangi tasdiqlangan bitiruvchi haqida post yuboradi."""
    bot_token = getattr(settings, "TELEGRAM_BOT_TOKEN", None)
    chat_id = getattr(settings, "TELEGRAM_ADMIN_CHAT_ID", None)

    if not bot_token or not chat_id:
        logger.warning("Telegram bot token yoki chat ID sozlanmagan.")
        return False

    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000").rstrip("/")
    profile_url = f"{frontend_url}/alumni/{profile.slug}"
    faculty_name = profile.faculty.name if profile.faculty else "Qarshi davlat universiteti"
    activity = profile.current_activity or profile.position or profile.current_company or "Bitiruvchi"
    approved_time_str = (
        profile.approved_at.strftime("%d.%m.%Y %H:%M")
        if profile.approved_at
        else timezone.now().strftime("%d.%m.%Y %H:%M")
    )
    year_str = f"{profile.graduation_year}-yil" if profile.graduation_year else "Bitiruvchi"

    if approver_name and approver_name not in ("Universitet ma’muriyati", "QarshiDU Hamjamiyati"):
        status_line = f"✅ <b>Tasdiqladi:</b> {html.escape(approver_name)} (bitiruvchi)\n"
    else:
        status_line = "✅ <b>Holati:</b> QarshiDU bitiruvchilari safiga qo‘shildi (Faol)\n"

    text = (
        f"🎓 <b>QarshiDU Alumni — Yangi bitiruvchi safimizda!</b>\n\n"
        f"👤 <b>F.I.Sh.:</b> {html.escape(profile.full_name)}\n"
        f"📅 <b>Bitirgan yili:</b> {year_str}\n"
        f"🏛 <b>Fakultet:</b> {html.escape(faculty_name)}\n"
        f"💼 <b>Faoliyati:</b> {html.escape(activity)}\n"
        f"{status_line}"
        f"⏰ <b>Sana:</b> {approved_time_str}\n\n"
        f"🔗 <a href=\"{profile_url}\">Platformadagi profilini ko‘rish</a>"
    )

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": False,
        "reply_markup": {
            "inline_keyboard": [
                [
                    {"text": "👤 Profilni ochish", "url": profile_url},
                    {"text": "✅ Tasdiqlanganlar", "callback_data": "list_approved"},
                ]
            ]
        }
    }

    try:
        resp = requests.post(url, json=payload, timeout=8)
        data = resp.json()
        if resp.status_code == 200 and data.get("ok"):
            logger.info("Yangi tasdiqlangan bitiruvchi Telegramga muvaffaqiyatli yuborildi: %s", profile.full_name)
            return True
        else:
            logger.error("Telegram API xatosi: %s", data)
            return False
    except Exception as exc:
        logger.error("Telegram so‘rovi bajarilmadi: %s", exc)
        return False

def notify_existing_alumni_via_email(profile, approver_name: str) -> int:
    """Mavjud barcha tasdiqlangan bitiruvchilar emailiga yangi a'zo haqida bildirishnoma yuboradi."""
    from apps.alumni.models import AlumniProfile

    existing_qs = (
        AlumniProfile.objects.filter(
            approval_status=AlumniProfile.ApprovalStatus.APPROVED,
            is_published=True,
        )
        .exclude(pk=profile.pk)
        .select_related("user")
    )

    recipient_emails = set()
    for item in existing_qs:
        if item.contact_email and "@" in item.contact_email:
            recipient_emails.add(item.contact_email.strip().lower())
        if item.user and item.user.email and "@" in item.user.email:
            recipient_emails.add(item.user.email.strip().lower())

    if not recipient_emails:
        return 0

    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000").rstrip("/")
    profile_url = f"{frontend_url}/alumni/{profile.slug}"
    faculty_name = profile.faculty.name if profile.faculty else "Qarshi davlat universiteti"
    activity = profile.current_activity or profile.position or profile.current_company or "Bitiruvchi"
    year_str = f"{profile.graduation_year}-yil" if profile.graduation_year else "Bitiruvchi"

    subject = f"QarshiDU Alumni — Yangi safdoshimiz qo‘shildi: {profile.full_name}"
    
    text_body = (
        f"Assalomu alaykum, hurmatli QarshiDU bitiruvchisi!\n\n"
        f"Qarshi davlat universiteti bitiruvchilar hamjamiyatimizga yangi bitiruvchi qo‘shildi va tasdiqlandi:\n\n"
        f"• F.I.Sh.: {profile.full_name}\n"
        f"• Bitirgan yili: {year_str}\n"
        f"• Fakultet: {faculty_name}\n"
        f"• Hozirgi faoliyati: {activity}\n"
        f"• Tasdiqladi: {approver_name} (bitiruvchi)\n\n"
        f"Yangi bitiruvchining to‘liq profili bilan tanishish uchun havola:\n"
        f"{profile_url}\n\n"
        f"Hurmat bilan,\n"
        f"QarshiDU Bitiruvchilar Hamjamiyati"
    )

    if approver_name and approver_name not in ("Universitet ma’muriyati", "QarshiDU Hamjamiyati"):
        intro_text = "Hamjamiyatimizga yangi bitiruvchi muvaffaqiyatli qo‘shildi va safdoshimiz tomonidan tasdiqlandi:"
        approver_table_row = f"""
            <tr>
              <td style="padding: 4px 0; font-weight: 600;">Tasdiqladi:</td>
              <td style="padding: 4px 0; color: #16a34a; font-weight: 600;">✅ {html.escape(approver_name)}</td>
            </tr>
        """
    else:
        intro_text = "Hamjamiyatimizga yangi bitiruvchi muvaffaqiyatli qo‘shildi va faollashtirildi:"
        approver_table_row = """
            <tr>
              <td style="padding: 4px 0; font-weight: 600;">Holati:</td>
              <td style="padding: 4px 0; color: #16a34a; font-weight: 600;">✅ Hamjamiyat a’zosi (Faol)</td>
            </tr>
        """

    html_body = f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background: linear-gradient(135deg, #002B49 0%, #004270 100%); padding: 28px 24px; text-align: center; color: #ffffff;">
        <span style="display: inline-block; background: rgba(255,255,255,0.15); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Yangi a’zo</span>
        <h1 style="margin: 0; font-size: 22px; font-weight: 700;">Safimiz kengaymoqda!</h1>
        <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.85;">Qarshi davlat universiteti bitiruvchilar hamjamiyati</p>
      </div>
      <div style="padding: 28px 24px;">
        <p style="color: #334155; font-size: 15px; line-height: 1.6; margin-top: 0;">
          Assalomu alaykum, hurmatli bitiruvchi! {intro_text}
        </p>
        <div style="background: #f8fafc; border-left: 4px solid #002B49; border-radius: 8px; padding: 18px 20px; margin: 20px 0;">
          <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #002B49;">{html.escape(profile.full_name)}</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #475569;">
            <tr>
              <td style="padding: 4px 0; font-weight: 600; width: 130px;">Bitirgan yili:</td>
              <td style="padding: 4px 0; color: #0f172a;">{year_str}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: 600;">Fakultet:</td>
              <td style="padding: 4px 0; color: #0f172a;">{html.escape(faculty_name)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: 600;">Faoliyati:</td>
              <td style="padding: 4px 0; color: #0f172a;">{html.escape(activity)}</td>
            </tr>
            {approver_table_row}
          </table>
        </div>
        <div style="text-align: center; margin: 28px 0 16px 0;">
          <a href="{profile_url}" style="display: inline-block; background: #002B49; color: #ffffff; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-decoration: none; box-shadow: 0 2px 6px rgba(0,43,73,0.25);">
            Profil bilan tanishish →
          </a>
        </div>
      </div>
      <div style="background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
        Ushbu xabar QarshiDU bitiruvchilar platformasining tasdiqlangan a’zosi bo‘lganingiz uchun yuborildi.
      </div>
    </div>
    """

    sent_count = 0
    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "QarshiDU Alumni <noreply@qarshidu.uz>")
    for email in recipient_emails:
        try:
            send_mail(
                subject=subject,
                message=text_body,
                from_email=from_email,
                recipient_list=[email],
                html_message=html_body,
                fail_silently=True,
            )
            sent_count += 1
        except Exception as exc:
            logger.warning("Email yuborishda xatolik (%s): %s", email, exc)

    logger.info("%d nafar mavjud bitiruvchiga yangi a'zo haqida email yuborildi.", sent_count)
    return sent_count

def notify_new_alumni_confirmed(profile, approver_user=None):
    """
    Yangi bitiruvchi tasdiqlanganda chaqiriladigan markaziy funksiya:
    1. Mavjud tasdiqlangan bitiruvchilarga email xabarnoma yuboradi.
    2. Telegram guruh/kanaliga post yuboradi.
    """
    approver_name = get_approver_display_name(approver_user)
    
    # 1. Telegram xabarnoma
    send_telegram_alumni_confirmed_post(profile, approver_name)

    # 2. Email xabarnomalar
    notify_existing_alumni_via_email(profile, approver_name)
