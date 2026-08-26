import uuid
from pathlib import Path

from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from django.db import models
from django.utils import timezone

from apps.alumni.models import AlumniProfile, validate_avatar_size, validate_https_url, validate_unsplash_image_url, validate_unsplash_source_url


def editorial_image_path(instance, filename):
    kind = instance.__class__.__name__.lower()
    return f"editorial/{kind}/{uuid.uuid4().hex}{Path(filename).suffix.lower()}"


image_validators = [FileExtensionValidator(["jpg", "jpeg", "png", "webp"]), validate_avatar_size]


class PublishableModel(models.Model):
    is_featured = models.BooleanField(default=False, db_index=True)
    is_published = models.BooleanField(default=False, db_index=True)
    published_at = models.DateTimeField(null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        if self.is_published and self.published_at is None:
            self.published_at = timezone.now()
        if not self.is_published:
            self.published_at = None
        super().save(*args, **kwargs)


class SuccessStory(PublishableModel):
    alumnus = models.ForeignKey(AlumniProfile, on_delete=models.PROTECT, related_name="success_stories")
    slug = models.SlugField(max_length=190, unique=True)
    title_uz = models.CharField(max_length=220)
    title_en = models.CharField(max_length=220, blank=True)
    summary_uz = models.CharField(max_length=420)
    summary_en = models.CharField(max_length=420, blank=True)
    hero_image = models.ImageField(upload_to=editorial_image_path, blank=True, validators=image_validators)
    hero_image_url = models.URLField(max_length=700, blank=True, validators=[validate_unsplash_image_url])
    hero_image_alt = models.CharField(max_length=220, blank=True)
    hero_image_credit = models.CharField(max_length=120, blank=True)
    hero_image_source_url = models.URLField(max_length=500, blank=True, validators=[validate_unsplash_source_url])
    student_takeaway_uz = models.TextField(blank=True, max_length=1600)
    student_takeaway_en = models.TextField(blank=True, max_length=1600)

    class Meta:
        ordering = ("-is_featured", "-published_at", "-created_at")
        indexes = [models.Index(fields=("is_published", "published_at"), name="story_pub_date_idx")]

    def __str__(self): return self.title_uz


class StorySection(models.Model):
    class Kind(models.TextChoices):
        INTRODUCTION="introduction", "Introduction"; UNIVERSITY="university", "University years"; EARLY_CAREER="early_career", "Early career"; TURNING_POINT="turning_point", "Turning point"; ACHIEVEMENTS="achievements", "Major achievements"; CURRENT_IMPACT="current_impact", "Current impact"; REFLECTION="reflection", "Advice / reflection"
    story = models.ForeignKey(SuccessStory, on_delete=models.CASCADE, related_name="sections")
    kind = models.CharField(max_length=24, choices=Kind.choices)
    heading_uz = models.CharField(max_length=180, blank=True)
    heading_en = models.CharField(max_length=180, blank=True)
    content_uz = models.TextField(max_length=6000)
    content_en = models.TextField(blank=True, max_length=6000)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ("order", "id")
        constraints = [models.UniqueConstraint(fields=("story", "order"), name="unique_story_section_order")]

    def __str__(self): return self.heading_uz or self.get_kind_display()


class AlumniInterview(PublishableModel):
    alumnus = models.ForeignKey(AlumniProfile, on_delete=models.PROTECT, related_name="interviews")
    slug = models.SlugField(max_length=190, unique=True)
    title_uz = models.CharField(max_length=220)
    title_en = models.CharField(max_length=220, blank=True)
    intro_uz = models.TextField(max_length=1800)
    intro_en = models.TextField(blank=True, max_length=1800)
    pull_quote_uz = models.CharField(max_length=420, blank=True)
    pull_quote_en = models.CharField(max_length=420, blank=True)

    class Meta:
        ordering = ("-is_featured", "-published_at", "-created_at")
        indexes = [models.Index(fields=("is_published", "published_at"), name="interview_pub_date_idx")]

    def clean(self):
        if self.is_published and self.pk and not self.items.exclude(question_uz="").exclude(answer_uz="").exists():
            raise ValidationError("Intervyuni nashr qilish uchun kamida bitta to‘liq savol-javob kerak.")

    def __str__(self): return self.title_uz


class InterviewItem(models.Model):
    interview = models.ForeignKey(AlumniInterview, on_delete=models.CASCADE, related_name="items")
    question_uz = models.CharField(max_length=500)
    question_en = models.CharField(max_length=500, blank=True)
    answer_uz = models.TextField(max_length=5000)
    answer_en = models.TextField(blank=True, max_length=5000)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ("order", "id")
        constraints = [models.UniqueConstraint(fields=("interview", "order"), name="unique_interview_item_order")]

    def __str__(self): return self.question_uz


class AlumniAdvice(PublishableModel):
    class Category(models.TextChoices):
        CAREER="career", "Career"; STUDY="study", "Study"; LEADERSHIP="leadership", "Leadership"; PERSONAL_GROWTH="personal_growth", "Personal growth"; INDUSTRY="industry", "Industry"; LIFE="life", "Life lesson"
    class SourceType(models.TextChoices):
        MANUAL="manual", "Manual"; INTERVIEW="interview", "Interview"
    alumnus = models.ForeignKey(AlumniProfile, on_delete=models.PROTECT, related_name="advice")
    category = models.CharField(max_length=24, choices=Category.choices)
    title_uz = models.CharField(max_length=180, blank=True)
    title_en = models.CharField(max_length=180, blank=True)
    content_uz = models.TextField(blank=True, max_length=1600)
    content_en = models.TextField(blank=True, max_length=1600)
    source_type = models.CharField(max_length=16, choices=SourceType.choices, default=SourceType.MANUAL)
    source_interview_item = models.ForeignKey(InterviewItem, null=True, blank=True, on_delete=models.PROTECT, related_name="derived_advice")

    class Meta:
        ordering = ("-is_featured", "-published_at", "-created_at")
        indexes = [models.Index(fields=("is_published", "category"), name="advice_pub_category_idx")]

    def clean(self):
        errors = {}
        if self.source_type == self.SourceType.INTERVIEW and not self.source_interview_item_id:
            errors["source_interview_item"] = "Intervyudan olingan maslahat uchun manba savol-javob majburiy."
        if self.source_type == self.SourceType.MANUAL and not self.content_uz.strip():
            errors["content_uz"] = "Manual maslahat matni majburiy."
        if self.source_interview_item_id and self.source_interview_item.interview.alumnus_id != self.alumnus_id:
            errors["source_interview_item"] = "Maslahat va intervyu bir xil bitiruvchiga tegishli bo‘lishi kerak."
        if errors: raise ValidationError(errors)

    @property
    def resolved_content_uz(self):
        return self.source_interview_item.answer_uz if self.source_interview_item_id else self.content_uz

    @property
    def resolved_content_en(self):
        if self.source_interview_item_id:
            return self.source_interview_item.answer_en or self.source_interview_item.answer_uz
        return self.content_en or self.content_uz

    def __str__(self): return self.title_uz or f"{self.alumnus} — {self.get_category_display()}"


class Event(PublishableModel):
    class Type(models.TextChoices):
        MEETUP="meetup", "Alumni Meetup"; REUNION="reunion", "Reunion"; CONFERENCE="conference", "University Conference"; GUEST_LECTURE="guest_lecture", "Guest Lecture"; ANNIVERSARY="anniversary", "Anniversary"; AWARD="award", "Award Ceremony"; CAREER_TALK="career_talk", "Career Talk"; PUBLIC_LECTURE="public_lecture", "Public Lecture"
    class LocationType(models.TextChoices):
        OFFLINE="offline", "Offline"; ONLINE="online", "Online"; HYBRID="hybrid", "Hybrid"
    slug = models.SlugField(max_length=190, unique=True)
    title_uz = models.CharField(max_length=220)
    title_en = models.CharField(max_length=220, blank=True)
    summary_uz = models.CharField(max_length=420)
    summary_en = models.CharField(max_length=420, blank=True)
    description_uz = models.TextField(max_length=7000)
    description_en = models.TextField(blank=True, max_length=7000)
    event_type = models.CharField(max_length=24, choices=Type.choices, db_index=True)
    cover_image = models.ImageField(upload_to=editorial_image_path, blank=True, validators=image_validators)
    cover_image_url = models.URLField(max_length=700, blank=True, validators=[validate_unsplash_image_url])
    cover_image_alt = models.CharField(max_length=220, blank=True)
    cover_image_credit = models.CharField(max_length=120, blank=True)
    cover_image_source_url = models.URLField(max_length=500, blank=True, validators=[validate_unsplash_source_url])
    start_at = models.DateTimeField(db_index=True)
    end_at = models.DateTimeField(null=True, blank=True)
    location_type = models.CharField(max_length=12, choices=LocationType.choices)
    location_uz = models.CharField(max_length=260)
    location_en = models.CharField(max_length=260, blank=True)
    external_url = models.URLField(max_length=500, blank=True, validators=[validate_https_url])
    speakers = models.ManyToManyField(AlumniProfile, through="EventSpeaker", related_name="events", blank=True)

    class Meta:
        ordering = ("start_at",)
        indexes = [models.Index(fields=("is_published", "start_at"), name="event_pub_start_idx")]

    def clean(self):
        errors = {}
        if timezone.is_naive(self.start_at): errors["start_at"] = "Timezone-aware vaqt kiriting."
        if self.end_at and timezone.is_naive(self.end_at): errors["end_at"] = "Timezone-aware vaqt kiriting."
        if self.end_at and self.end_at <= self.start_at: errors["end_at"] = "Tugash vaqti boshlanish vaqtidan keyin bo‘lishi kerak."
        if errors: raise ValidationError(errors)

    @property
    def computed_status(self):
        now = timezone.now()
        if self.start_at > now: return "upcoming"
        if self.end_at and self.end_at >= now: return "ongoing"
        return "past"

    def __str__(self): return self.title_uz


class EventSpeaker(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="speaker_links")
    alumnus = models.ForeignKey(AlumniProfile, null=True, blank=True, on_delete=models.PROTECT, related_name="speaker_links")
    external_name = models.CharField(max_length=180, blank=True)
    role_uz = models.CharField(max_length=180, blank=True)
    role_en = models.CharField(max_length=180, blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ("order", "id")
        constraints = [models.UniqueConstraint(fields=("event", "order"), name="unique_event_speaker_order")]

    def clean(self):
        if bool(self.alumnus_id) == bool(self.external_name.strip()):
            raise ValidationError("Platformadagi bitiruvchi yoki tashqi spiker nomidan faqat bittasini tanlang.")

    def __str__(self): return str(self.alumnus or self.external_name)
