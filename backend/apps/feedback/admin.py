from django.contrib import admin
from .models import Feedback

@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ("type", "name", "contact", "status", "telegram_delivery_status", "created_at")
    list_filter = ("type", "status", "telegram_delivery_status", "created_at")
    search_fields = ("name", "contact", "message", "page_url")
    readonly_fields = ("created_at", "ip_address", "telegram_delivery_status", "telegram_message_id")
