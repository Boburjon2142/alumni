from django.contrib import admin

from .models import Achievement, AlumniProfile, AlumniSource, CareerTimelineItem, FeaturedAlumni


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
    list_display = ("full_name", "faculty", "graduation_year", "current_company", "is_featured", "is_published", "published_at")
    list_filter = ("is_published", "is_featured", "faculty", "graduation_year", "industry")
    search_fields = ("full_name", "current_company", "position", "industry", "faculty__name")
    prepopulated_fields = {"slug": ("full_name",)}
    readonly_fields = ("created_at", "updated_at", "published_at")
    list_select_related = ("faculty", "specialty")
    inlines = (AchievementInline, CareerTimelineInline, AlumniSourceInline)
    fieldsets = (
        ("Asosiy ma’lumot", {"fields": ("user", "full_name", "slug", "avatar", "faculty", "specialty", "graduation_year", "degree")}),
        ("Professional ma’lumot", {"fields": ("position", "current_company", "industry", "city", "country")}),
        ("Biografiya", {"fields": ("biography_uz", "biography_en", "career_story_uz", "career_story_en")}),
        ("Remote demo image", {"fields": ("image_url", "image_alt", "image_credit", "image_source_url"), "classes": ("collapse",)}),
        ("SEO", {"fields": ("seo_title", "seo_description"), "classes": ("collapse",)}),
        ("Nashr", {"fields": ("is_featured", "featured_order", "is_published", "published_at")}),
        ("Tizim", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )


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
