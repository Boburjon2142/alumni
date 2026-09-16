import html
import logging
import requests
from django.conf import settings
from django.utils import timezone
from apps.alumni.notifications import get_approver_display_name

logger = logging.getLogger(__name__)

def get_main_reply_keyboard():
    return {
        "keyboard": [
            [{"text": "✅ Tasdiqlanganlar"}, {"text": "👥 Bitiruvchilar"}],
            [{"text": "🌐 Rasmiy sayt"}, {"text": "ℹ️ Bot haqida"}],
        ],
        "resize_keyboard": True,
        "one_time_keyboard": False,
    }

def format_approved_alumni_message(limit=10) -> tuple[str, dict]:
    from apps.alumni.models import AlumniProfile

    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000").rstrip("/")
    qs = (
        AlumniProfile.objects.filter(
            approval_status=AlumniProfile.ApprovalStatus.APPROVED,
            is_published=True,
        )
        .select_related("faculty", "approved_by")
        .order_by("-approved_at", "-id")[:limit]
    )

    total_count = AlumniProfile.objects.filter(
        approval_status=AlumniProfile.ApprovalStatus.APPROVED,
        is_published=True,
    ).count()

    if not qs:
        return (
            "ℹ️ Hozircha platformada tasdiqlangan bitiruvchilar mavjud emas.",
            {
                "inline_keyboard": [
                    [{"text": "🌐 Saytga o‘tish", "url": f"{frontend_url}/join"}]
                ]
            }
        )

    lines = [
        "✅ <b>QarshiDU — Tasdiqlangan Bitiruvchilar</b>\n",
        f"Platformada rasman tasdiqlangan bitiruvchilar (Jami: <b>{total_count}</b> nafar):\n"
    ]

    for idx, profile in enumerate(qs, 1):
        year_str = f"({profile.graduation_year}-yil)" if profile.graduation_year else ""
        faculty = f"🏛 {profile.faculty.name}\n" if profile.faculty else ""
        activity = profile.current_activity or profile.position or profile.current_company
        activity_str = f"💼 {html.escape(activity)}\n" if activity else ""
        
        if profile.approved_by:
            approver = get_approver_display_name(profile.approved_by)
            approver_str = f"🤝 <b>Tasdiqlagan:</b> {html.escape(approver)}\n"
        else:
            approver_str = "🤝 <b>Holati:</b> Hamjamiyat a’zosi (Faol)\n"

        date_str = profile.approved_at.strftime("%d.%m.%Y") if profile.approved_at else "Yaqinda"
        profile_link = f"{frontend_url}/alumni/{profile.slug}"

        lines.append(
            f"{idx}. <b>{html.escape(profile.full_name)}</b> {year_str}\n"
            f"{faculty}"
            f"{activity_str}"
            f"{approver_str}"
            f"📅 <b>Qo‘shilgan:</b> {date_str}\n"
            f"🔗 <a href=\"{profile_link}\">Profilni ko‘rish</a>\n"
        )

    text = "\n".join(lines)
    reply_markup = {
        "inline_keyboard": [
            [
                {"text": "🌐 Saytda barchasini ko‘rish", "url": f"{frontend_url}/alumni"},
                {"text": "🎓 Safimizga qo‘shilish", "url": f"{frontend_url}/join"},
            ]
        ]
    }
    return text, reply_markup

def format_overview_message() -> tuple[str, dict]:
    from apps.alumni.models import AlumniProfile

    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000").rstrip("/")
    total_approved = AlumniProfile.objects.filter(
        approval_status=AlumniProfile.ApprovalStatus.APPROVED,
        is_published=True,
    ).count()

    pending_count = AlumniProfile.objects.filter(
        approval_status=AlumniProfile.ApprovalStatus.PENDING
    ).count()

    text = (
        f"👥 <b>QarshiDU Bitiruvchilar Hamjamiyati</b>\n\n"
        f"📊 <b>Statistika:</b>\n"
        f"• Tasdiqlangan bitiruvchilar: <b>{total_approved}</b> nafar\n"
        f"• Ko‘rib chiqilayotgan arizalar: <b>{pending_count}</b> nafar\n\n"
        f"Platformada har bir bitiruvchi boshqa bitiruvchilar tomonidan tasdiqlanishi (peer verification) "
        f"orqali ishonchli va faol tarmoq yaratilmoqda."
    )

    reply_markup = {
        "inline_keyboard": [
            [{"text": "✅ Tasdiqlanganlar ro‘yxati", "callback_data": "list_approved"}],
            [{"text": "🌐 Platformaga kirish", "url": frontend_url}],
        ]
    }
    return text, reply_markup

def send_telegram_raw(chat_id: int | str, text: str, reply_markup: dict = None) -> bool:
    bot_token = getattr(settings, "TELEGRAM_BOT_TOKEN", None)
    if not bot_token:
        logger.warning("TELEGRAM_BOT_TOKEN sozlanmagan.")
        return False

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": True,
    }
    if reply_markup:
        payload["reply_markup"] = reply_markup

    try:
        resp = requests.post(url, json=payload, timeout=8)
        data = resp.json()
        return bool(resp.status_code == 200 and data.get("ok"))
    except Exception as exc:
        logger.error("Telegram xabari yuborilmadi: %s", exc)
        return False

def answer_callback_query(callback_query_id: str, text: str = ""):
    bot_token = getattr(settings, "TELEGRAM_BOT_TOKEN", None)
    if not bot_token:
        return
    url = f"https://api.telegram.org/bot{bot_token}/answerCallbackQuery"
    try:
        requests.post(url, json={"callback_query_id": callback_query_id, "text": text}, timeout=5)
    except Exception:
        pass

def handle_telegram_update(update: dict) -> bool:
    """Telegram webhook yoki pollingdan kelgan barcha yangilanishlarni qayta ishlaydi."""
    callback_query = update.get("callback_query")
    if callback_query:
        cq_id = callback_query.get("id")
        data = callback_query.get("data", "")
        message = callback_query.get("message", {})
        chat = message.get("chat", {})
        chat_id = chat.get("id")

        if cq_id:
            answer_callback_query(cq_id)

        if chat_id and data == "list_approved":
            text, markup = format_approved_alumni_message()
            send_telegram_raw(chat_id, text, markup)
            return True
        return True

    message = update.get("message")
    if not message:
        return True

    chat = message.get("chat", {})
    chat_id = chat.get("id")
    text = (message.get("text") or "").strip()

    if not chat_id:
        return False

    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000").rstrip("/")
    normalized = text.lower()

    if normalized in {"/start", "start"}:
        welcome_text = (
            f"Assalomu alaykum! 🎓\n\n"
            f"<b>Qarshi davlat universiteti bitiruvchilari</b> rasmiy botiga xush kelibsiz!\n\n"
            f"Ushbu bot orqali universitetimizning boshqa bitiruvchilar tomonidan tasdiqlangan "
            f"a’zolari bilan tanishishingiz va yangi tasdiqlangan safdoshlarimizni kuzatib borishingiz mumkin.\n\n"
            f"Quyidagi bo‘limlardan birini tanlang:"
        )
        send_telegram_raw(chat_id, welcome_text, get_main_reply_keyboard())
        return True

    if (
        normalized in {"/tasdiqlanganlar", "tasdiqlanganlar", "✅ tasdiqlanganlar"}
        or "tasdiqlangan" in normalized
    ):
        msg, markup = format_approved_alumni_message()
        send_telegram_raw(chat_id, msg, markup)
        return True

    if normalized in {"/bitiruvchilar", "bitiruvchilar", "👥 bitiruvchilar"}:
        msg, markup = format_overview_message()
        send_telegram_raw(chat_id, msg, markup)
        return True

    if normalized in {"/sayt", "rasmiy sayt", "🌐 rasmiy sayt"}:
        site_msg = (
            f"🌐 <b>Qarshi davlat universiteti bitiruvchilar portali</b>\n\n"
            f"Portalda o‘z profilingizni yarating, bitiruvchilar tarmog‘iga qo‘shiling "
            f"va safdoshlaringizni tasdiqlang:\n{frontend_url}"
        )
        site_markup = {
            "inline_keyboard": [
                [{"text": "🌐 Saytni ochish", "url": frontend_url}],
                [{"text": "📝 Anketa to‘ldirish", "url": f"{frontend_url}/join"}],
            ]
        }
        send_telegram_raw(chat_id, site_msg, site_markup)
        return True

    if normalized in {"/haqida", "bot haqida", "ℹ️ bot haqida"}:
        about_msg = (
            f"ℹ️ <b>QarshiDU Alumni Boti haqida</b>\n\n"
            f"Bu bot Qarshi davlat universiteti bitiruvchilarini birlashtirish, "
            f"yangi a’zolarni tasdiqlash va mavjud bitiruvchilarni xabardor qilish uchun xizmat qiladi.\n\n"
            f"• <b>Peer-verification (Tasdiqlash):</b> Yangi bitiruvchilar mavjud bitiruvchilar tomonidan tasdiqlanadi.\n"
            f"• <b>Xabarnomalar:</b> Har bir tasdiqlangan bitiruvchi haqida guruh va bot a’zolariga xabar yuboriladi.\n\n"
            f"Rasmiy portal: {frontend_url}"
        )
        send_telegram_raw(chat_id, about_msg, get_main_reply_keyboard())
        return True

    # Standart noaniq buyruqlar uchun
    fallback_text = (
        f"Kechirasiz, buyruqni tushunmadim. Iltimos, quyidagi menyudan foydalaning yoki "
        f"<b>/tasdiqlanganlar</b> buyrug‘ini yuboring."
    )
    send_telegram_raw(chat_id, fallback_text, get_main_reply_keyboard())
    return True
