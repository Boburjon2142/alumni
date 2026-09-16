from django.contrib import admin
from .models import Contribution, ScoreTransaction, Achievement, AlumniAchievement


@admin.register(Contribution)
class ContributionAdmin(admin.ModelAdmin):
    list_display = ("alumni", "category", "action_type", "status", "occurred_at", "verified_by")
    list_filter = ("status", "category", "action_type", "source_type")
    search_fields = ("alumni__full_name", "title", "description")
    readonly_fields = ("submitted_at", "created_at", "updated_at")
    raw_id_fields = ("alumni", "verified_by")


@admin.register(ScoreTransaction)
class ScoreTransactionAdmin(admin.ModelAdmin):
    list_display = ("alumni", "points", "category", "transaction_type", "scoring_rule_version", "created_at")
    list_filter = ("category", "transaction_type", "scoring_rule_version")
    search_fields = ("alumni__full_name", "reason")
    readonly_fields = ("alumni", "contribution", "category", "points", "transaction_type", "scoring_rule_version", "reason", "created_at")

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ("code", "name_uz", "category", "threshold", "icon_key", "is_active")
    list_filter = ("category", "is_active")
    search_fields = ("code", "name_uz", "name_en", "name_ru")


@admin.register(AlumniAchievement)
class AlumniAchievementAdmin(admin.ModelAdmin):
    list_display = ("alumni", "achievement", "awarded_at")
    list_filter = ("achievement__category",)
    search_fields = ("alumni__full_name", "achievement__name_uz")
    raw_id_fields = ("alumni", "achievement")
