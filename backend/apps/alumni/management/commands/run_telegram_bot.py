import time
import requests
from django.conf import settings
from django.core.management.base import BaseCommand
from apps.alumni.telegram_bot import handle_telegram_update

class Command(BaseCommand):
    help = "QarshiDU Alumni Telegram botini polling rejimida ishga tushiradi (mahalliy ishlab chiqish uchun)."

    def handle(self, *args, **options):
        bot_token = getattr(settings, "TELEGRAM_BOT_TOKEN", None)
        if not bot_token:
            self.stderr.write(self.style.ERROR("TELEGRAM_BOT_TOKEN sozlanmagan!"))
            return

        self.stdout.write(self.style.SUCCESS("Telegram bot polling rejimida ishga tushmoqda..."))
        offset = None

        while True:
            try:
                url = f"https://api.telegram.org/bot{bot_token}/getUpdates"
                params = {"timeout": 20}
                if offset:
                    params["offset"] = offset

                resp = requests.get(url, params=params, timeout=25)
                if resp.status_code == 200:
                    data = resp.json()
                    for update in data.get("result", []):
                        offset = update["update_id"] + 1
                        try:
                            handle_telegram_update(update)
                        except Exception as e:
                            self.stderr.write(f"Update qayta ishlashda xato: {e}")
                time.sleep(1)
            except KeyboardInterrupt:
                self.stdout.write("Bot to‘xtatildi.")
                break
            except Exception as exc:
                self.stderr.write(f"So‘rovda xato: {exc}")
                time.sleep(3)
