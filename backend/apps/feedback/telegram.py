import os
import html
import requests
import logging

from pathlib import Path
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

def send_telegram_notification(feedback):
    """
    Xavfsiz server-side Telegram guruh bildirishnomasi.
    Telegram API mavjud bo'lmasa yoki xato bersa ham, xatolik ushlanadi va bazada delivery_status='failed' qilinadi.
    """
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_ADMIN_CHAT_ID")

    if not bot_token or not chat_id:
        base_dir = Path(__file__).resolve().parent.parent.parent
        load_dotenv(base_dir / ".env")
        load_dotenv(base_dir.parent / ".env")
        bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
        chat_id = os.getenv("TELEGRAM_ADMIN_CHAT_ID")

    if not bot_token or not chat_id:
        logger.warning("Telegram bot token yoki admin chat ID sozlanmagan.")
        feedback.telegram_delivery_status = "failed"
        feedback.save(update_fields=["telegram_delivery_status"])
        return False

    type_labels = {
        "proposal": "💡 Taklif",
        "question": "❓ Savol",
        "error_report": "⚠️ Xato haqida xabar",
        "data_correction": "✏️ Ma’lumotni tuzatish",
        "alumni_nomination": "🎓 Bitiruvchi ma’lumotini taklif qilish",
        "additional_info": "📝 Qo‘shimcha ma’lumot",
        "other": "📌 Boshqa",
    }

    type_text = type_labels.get(feedback.type, feedback.get_type_display())
    
    text = (
        f"<b>📩 Yangi murojaat</b>\n\n"
        f"<b>Turi:</b> {html.escape(type_text)}\n"
    )

    if feedback.subject:
        text += f"<b>Mavzu:</b> {html.escape(feedback.subject)}\n"
    if feedback.name:
        text += f"<b>Ism:</b> {html.escape(feedback.name)}\n"
    if feedback.email:
        text += f"<b>Email:</b> {html.escape(feedback.email)}\n"
    if feedback.phone:
        text += f"<b>Telefon:</b> {html.escape(feedback.phone)}\n"
    elif feedback.contact and not feedback.email and not feedback.phone:
        text += f"<b>Aloqa:</b> {html.escape(feedback.contact)}\n"
    if feedback.page_url:
        text += f"<b>Sahifa:</b> {html.escape(feedback.page_url)}\n"
    if feedback.alumni:
        text += f"<b>Bitiruvchi:</b> {html.escape(feedback.alumni.full_name)}\n"
    if feedback.story:
        text += f"<b>Hikoya:</b> {html.escape(feedback.story.title_uz)}\n"

    text += (
        f"\n<b>Xabar:</b>\n"
        f"<i>{html.escape(feedback.message)}</i>\n\n"
        f"📅 Sana: {feedback.created_at:%d.%m.%Y %H:%M}"
    )

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": True,
    }

    try:
        response = requests.post(url, json=payload, timeout=8)
        data = response.json()
        if response.status_code == 200 and data.get("ok"):
            feedback.telegram_delivery_status = "sent"
            feedback.telegram_message_id = data.get("result", {}).get("message_id")
            feedback.save(update_fields=["telegram_delivery_status", "telegram_message_id"])
            return True
        else:
            logger.error("Telegram API xatosi: %s", data)
            feedback.telegram_delivery_status = "failed"
            feedback.save(update_fields=["telegram_delivery_status"])
            return False
    except Exception as exc:
        logger.error("Telegram so'rovi bajarilmadi: %s", exc)
        feedback.telegram_delivery_status = "failed"
        feedback.save(update_fields=["telegram_delivery_status"])
        return False
