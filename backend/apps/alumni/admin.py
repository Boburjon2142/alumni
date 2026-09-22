from django.contrib import admin
from django.utils import timezone
from django.utils.html import format_html

from .models import (
    Achievement,
    AlumniConsent,
    AlumniProfile,
    AlumniSource,
    CareerTimelineItem,
    EducationExperience,
    FeaturedAlumni,
    GraduationYearChangeRequest,
    WorkExperience,
)
from .notifications import notify_new_alumni_confirmed


class AlumniConsentInline(admin.StackedInline):
    model = AlumniConsent
    extra = 0
    readonly_fields = ("policy_version", "accepted", "accepted_at", "ip_address", "user_agent")
    can_delete = False

class EducationExperienceInline(admin.TabularInline):
    model = EducationExperience
    extra = 0
    fields = ("degree_level", "institution", "faculty", "specialty", "start_year", "graduation_year", "order")

class WorkExperienceInline(admin.TabularInline):
    model = WorkExperience
    extra = 0
    fields = ("company", "position", "region", "start_year", "end_year", "is_current", "order")

class AchievementInline(admin.TabularInline):
    model = Achievement
    extra = 0

class CareerTimelineInline(admin.StackedInline):
    model = CareerTimelineItem
    extra = 0

class AlumniSourceInline(admin.TabularInline):
    model = AlumniSource
    extra = 0

@admin.register(AlumniProfile)
class AlumniProfileAdmin(admin.ModelAdmin):
    list_display = (
        "full_name",
        "graduation_year",
        "contact_email",
        "approval_status_badge",
        "is_honorary",
        "is_featured",
        "is_published",
        "created_at",
    )
    list_filter = (
        "approval_status",
        "is_honorary",
        "is_featured",
        "is_published",
        "academic_degree",
        "academic_title",
        "graduation_year",
        "faculty",
    )
    search_fields = (
        "full_name",
        "contact_email",
        "current_activity",
        "current_company",
        "position",
        "faculty__name",
    )
    readonly_fields = (
        "created_at", "updated_at", "published_at", "approved_at", "approved_by",
        "user", "full_name", "slug", "avatar", "faculty", "specialty", "graduation_year",
        "academic_degree", "academic_title", "degree", "contact_email", "phone",
        "current_activity", "position", "current_company", "industry", "city", "country",
        "bio", "biography_uz", "biography_en", "career_story_uz", "career_story_en",
        "linkedin_url", "github_url", "website_url", "image_url", "image_alt", "image_credit", "image_source_url"
    )
    list_select_related = ("faculty", "specialty")
    inlines = (AlumniConsentInline, EducationExperienceInline, WorkExperienceInline, AchievementInline, CareerTimelineInline, AlumniSourceInline)
    actions = (
        "approve_selected_profiles",
        "reject_selected_profiles",
        "feature_selected_homepage",
        "unfeature_selected_homepage",
    )

    def has_add_permission(self, request):
        return False

    fieldsets = (
        ("Moderatsiya va Holat", {
            "fields": (
                "approval_status",
                "is_honorary",
                "is_featured",
                "featured_order",
                "is_published",
                "approved_at",
                "approved_by",
            )
        }),
        ("Asosiy ma’lumot", {
            "fields": (
                "user",
                "full_name",
                "slug",
                "avatar",
                "faculty",
                "specialty",
                "graduation_year",
                "academic_degree",
                "academic_title",
                "degree",
            )
        }),
        ("Aloqa va Faoliyat", {
            "fields": (
                "contact_email",
                "phone",
                "current_activity",
                "position",
                "current_company",
                "industry",
                "city",
                "country",
            )
        }),
        ("Biografiya", {
            "fields": (
                "bio",
                "biography_uz",
                "biography_en",
                "career_story_uz",
                "career_story_en",
            )
        }),
        ("Ijtimoiy tarmoqlar", {
            "fields": ("linkedin_url", "github_url", "website_url"),
            "classes": ("collapse",),
        }),
        ("Remote demo image", {
            "fields": ("image_url", "image_alt", "image_credit", "image_source_url"),
            "classes": ("collapse",),
        }),
        ("SEO", {
            "fields": ("seo_title", "seo_description"),
            "classes": ("collapse",),
        }),
        ("Tizim", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",),
        }),
    )

    @admin.display(description="Moderatsiya")
    def approval_status_badge(self, obj):
        colors = {
            AlumniProfile.ApprovalStatus.PENDING: "#eab308",
            AlumniProfile.ApprovalStatus.APPROVED: "#16a34a",
            AlumniProfile.ApprovalStatus.REJECTED: "#dc2626",
        }
        color = colors.get(obj.approval_status, "#64748b")
        label = obj.get_approval_status_display()
        return format_html(
            '<span style="background:{}; color:#fff; padding:3px 8px; border-radius:12px; font-weight:600; font-size:12px;">{}</span>',
            color,
            label,
        )

    @admin.action(description="Tanlangan profillarni tasdiqlash (Approve)")
    def approve_selected_profiles(self, request, queryset):
        now = timezone.now()
        approver = request.user if request.user.is_authenticated else None
        count = 0
        for profile in queryset:
            profile.approval_status = AlumniProfile.ApprovalStatus.APPROVED
            profile.is_published = True
            profile.approved_at = now
            profile.approved_by = approver
            profile.verification_status = AlumniProfile.Verification.VERIFIED
            profile.save()
            try:
                notify_new_alumni_confirmed(profile, approver_user=approver)
            except Exception as exc:
                self.message_user(request, f"Xabarnoma yuborishda ogohlantirish: {exc}", level="WARNING")
            count += 1
        self.message_user(request, f"{count} ta profil tasdiqlandi, e’lon qilindi va bildirishnomalar yuborildi.")


    @admin.action(description="Tanlangan profillarni rad etish (Reject)")
    def reject_selected_profiles(self, request, queryset):
        count = queryset.update(
            approval_status=AlumniProfile.ApprovalStatus.REJECTED,
            is_published=False,
        )
        self.message_user(request, f"{count} ta profil rad etildi.")

    @admin.action(description="Bosh sahifada ko‘rsatish (Feature on Homepage)")
    def feature_selected_homepage(self, request, queryset):
        count = queryset.update(is_featured=True)
        self.message_user(request, f"{count} ta profil bosh sahifada ko‘rsatish uchun belgilandi.")

    @admin.action(description="Bosh sahifadan olish (Unfeature)")
    def unfeature_selected_homepage(self, request, queryset):
        count = queryset.update(is_featured=False)
        self.message_user(request, f"{count} ta profil bosh sahifadan olib tashlandi.")

@admin.register(AlumniConsent)
class AlumniConsentAdmin(admin.ModelAdmin):
    list_display = ("alumni", "policy_version", "accepted", "accepted_at", "ip_address")
    list_filter = ("accepted", "policy_version")
    search_fields = ("alumni__full_name", "ip_address")
    readonly_fields = ("alumni", "policy_version", "accepted", "accepted_at", "ip_address", "user_agent")

@admin.register(FeaturedAlumni)
class FeaturedAlumniAdmin(admin.ModelAdmin):
    list_display = ("display_order", "alumni", "title", "is_active", "featured_at")
    list_display_links = ("alumni",)
    list_editable = ("display_order", "is_active")
    list_filter = ("is_active",)
    search_fields = ("alumni__full_name", "title")

@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ("title", "alumnus", "year", "category", "order")
    list_filter = ("category", "year")
    search_fields = ("title", "alumnus__full_name")

@admin.register(CareerTimelineItem)
class CareerTimelineAdmin(admin.ModelAdmin):
    list_display = ("year", "title", "alumnus", "organization", "type", "order")
    list_filter = ("type", "year")
    search_fields = ("title", "organization", "alumnus__full_name")

@admin.register(AlumniSource)
class AlumniSourceAdmin(admin.ModelAdmin):
    list_display = ("title", "alumnus", "source_type", "publisher", "is_verified")
    list_filter = ("source_type", "is_verified")
    search_fields = ("title", "publisher", "alumnus__full_name")

@admin.register(WorkExperience)
class WorkExperienceAdmin(admin.ModelAdmin):
    list_display = ("company", "position", "alumnus", "region", "start_year", "end_year", "is_current", "order")
    list_filter = ("region", "start_year", "is_current")
    search_fields = ("company", "position", "alumnus__full_name")

@admin.register(GraduationYearChangeRequest)
class GraduationYearChangeRequestAdmin(admin.ModelAdmin):
    list_display = ("alumnus", "old_year", "requested_year", "status_badge", "created_at", "reviewed_by", "reviewed_at")
    list_filter = ("status", "requested_year")
    search_fields = ("alumnus__full_name", "reason", "admin_note")
    readonly_fields = ("alumnus", "old_year", "requested_year", "reason", "created_at", "reviewed_at", "reviewed_by")
    actions = ("approve_requests", "reject_requests")

    @admin.display(description="Holat")
    def status_badge(self, obj):
        colors = {
            GraduationYearChangeRequest.Status.PENDING: "#eab308",
            GraduationYearChangeRequest.Status.APPROVED: "#16a34a",
            GraduationYearChangeRequest.Status.REJECTED: "#dc2626",
        }
        color = colors.get(obj.status, "#64748b")
        return format_html(
            '<span style="background:{}; color:#fff; padding:3px 8px; border-radius:12px; font-weight:600; font-size:12px;">{}</span>',
            color,
            obj.get_status_display(),
        )

    @admin.action(description="Tanlangan so‘rovlarni tasdiqlash va bitiruv yilini yangilash")
    def approve_requests(self, request, queryset):
        now = timezone.now()
        count = 0
        for req in queryset.filter(status=GraduationYearChangeRequest.Status.PENDING):
            req.status = GraduationYearChangeRequest.Status.APPROVED
            req.reviewed_at = now
            req.reviewed_by = request.user if request.user.is_authenticated else None
            req.save()

            # Profilning bitirgan yilini yangilash
            profile = req.alumnus
            profile.graduation_year = req.requested_year
            profile.save(update_fields=["graduation_year"])
            count += 1
        self.message_user(request, f"{count} ta bitiruv yili so‘rovi tasdiqlandi va profillar yangilandi.")

    @admin.action(description="Tanlangan so‘rovlarni rad etish")
    def reject_requests(self, request, queryset):
        now = timezone.now()
        count = 0
        for req in queryset.filter(status=GraduationYearChangeRequest.Status.PENDING):
            req.status = GraduationYearChangeRequest.Status.REJECTED
            req.reviewed_at = now
            req.reviewed_by = request.user if request.user.is_authenticated else None
            req.save()
            count += 1
        self.message_user(request, f"{count} ta bitiruv yili so‘rovi rad etildi.")

