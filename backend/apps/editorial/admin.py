from django.contrib import admin

from .models import AlumniAdvice, AlumniInterview, Event, EventSpeaker, InterviewItem, News, StorySection, SuccessStory


class StorySectionInline(admin.StackedInline):
    model = StorySection
    extra = 0
    fields = ("order", "kind", "heading_uz", "heading_en", "content_uz", "content_en")


@admin.register(SuccessStory)
class SuccessStoryAdmin(admin.ModelAdmin):
    list_display = ("title_uz", "alumnus", "is_featured", "is_published", "published_at")
    list_filter = ("is_published", "is_featured", "published_at")
    search_fields = ("title_uz", "title_en", "summary_uz", "alumnus__full_name")
    prepopulated_fields = {"slug": ("title_uz",)}
    readonly_fields = ("published_at", "created_at", "updated_at")
    list_select_related = ("alumnus",)
    inlines = (StorySectionInline,)
    fieldsets = (
        ("Asosiy", {"fields": ("alumnus", "slug", "title_uz", "title_en", "summary_uz", "summary_en", "hero_image")}),
        ("Remote demo image", {"fields": ("hero_image_url", "hero_image_alt", "hero_image_credit", "hero_image_source_url"), "classes": ("collapse",)}),
        ("Talabalar uchun xulosa", {"fields": ("student_takeaway_uz", "student_takeaway_en")}),
        ("Nashr", {"fields": ("is_featured", "is_published", "published_at")}),
        ("Tizim", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )


class InterviewItemInline(admin.StackedInline):
    model = InterviewItem
    extra = 0
    fields = ("order", "question_uz", "question_en", "answer_uz", "answer_en")


@admin.register(AlumniInterview)
class AlumniInterviewAdmin(admin.ModelAdmin):
    list_display = ("title_uz", "alumnus", "is_featured", "is_published", "published_at")
    list_filter = ("is_published", "is_featured", "published_at")
    search_fields = ("title_uz", "title_en", "alumnus__full_name")
    prepopulated_fields = {"slug": ("title_uz",)}
    readonly_fields = ("published_at", "created_at", "updated_at")
    list_select_related = ("alumnus",)
    inlines = (InterviewItemInline,)
    fieldsets = (
        ("Asosiy", {"fields": ("alumnus", "slug", "title_uz", "title_en", "intro_uz", "intro_en")}),
        ("Muhim iqtibos", {"fields": ("pull_quote_uz", "pull_quote_en")}),
        ("Nashr", {"fields": ("is_featured", "is_published", "published_at")}),
        ("Tizim", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )


@admin.register(AlumniAdvice)
class AlumniAdviceAdmin(admin.ModelAdmin):
    list_display = ("alumnus", "category", "source_type", "is_featured", "is_published", "published_at")
    list_filter = ("category", "source_type", "is_published", "is_featured")
    search_fields = ("title_uz", "content_uz", "alumnus__full_name")
    readonly_fields = ("published_at", "created_at", "updated_at")
    list_select_related = ("alumnus", "source_interview_item")
    fieldsets = (
        ("Manba", {"fields": ("alumnus", "category", "source_type", "source_interview_item")}),
        ("Kontent", {"fields": ("title_uz", "title_en", "content_uz", "content_en")}),
        ("Nashr", {"fields": ("is_featured", "is_published", "published_at")}),
        ("Tizim", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )


class EventSpeakerInline(admin.TabularInline):
    model = EventSpeaker
    extra = 0
    fields = ("order", "alumnus", "external_name", "role_uz", "role_en")


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title_uz", "event_type", "start_at", "location_type", "is_featured", "is_published")
    list_filter = ("event_type", "location_type", "is_published", "is_featured", "start_at")
    search_fields = ("title_uz", "title_en", "summary_uz", "location_uz")
    prepopulated_fields = {"slug": ("title_uz",)}
    readonly_fields = ("published_at", "created_at", "updated_at")
    date_hierarchy = "start_at"
    inlines = (EventSpeakerInline,)
    fieldsets = (
        ("Asosiy", {"fields": ("slug", "event_type", "title_uz", "title_en", "summary_uz", "summary_en", "cover_image")}),
        ("Remote demo image", {"fields": ("cover_image_url", "cover_image_alt", "cover_image_credit", "cover_image_source_url"), "classes": ("collapse",)}),
        ("Sana va vaqt", {"fields": ("start_at", "end_at")}),
        ("Joylashuv", {"fields": ("location_type", "location_uz", "location_en")}),
        ("Kontent", {"fields": ("description_uz", "description_en")}),
        ("Rasmiy havola", {"fields": ("external_url",)}),
        ("Nashr", {"fields": ("is_featured", "is_published", "published_at")}),
        ("Tizim", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )


@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ("title_uz", "category", "author_name", "views_count", "is_featured", "is_published", "published_at")
    list_filter = ("category", "is_published", "is_featured", "published_at")
    search_fields = ("title_uz", "title_ru", "title_en", "summary_uz", "content_uz", "author_name")
    prepopulated_fields = {"slug": ("title_uz",)}
    readonly_fields = ("views_count", "published_at", "created_at", "updated_at")
    date_hierarchy = "published_at"
    fieldsets = (
        ("Asosiy", {"fields": ("slug", "category", "title_uz", "title_ru", "title_en", "summary_uz", "summary_ru", "summary_en", "author_name")}),
        ("Rasm", {"fields": ("cover_image", "cover_image_url", "cover_image_alt", "cover_image_credit", "cover_image_source_url")}),
        ("To‘liq matn", {"fields": ("content_uz", "content_ru", "content_en")}),
        ("Nashr", {"fields": ("is_featured", "is_published", "published_at", "views_count")}),
        ("Tizim", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )

