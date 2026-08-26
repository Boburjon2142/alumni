import uuid
from datetime import date
from pathlib import Path
from urllib.parse import urlparse
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator, MaxValueValidator, MinValueValidator, URLValidator
from django.db import models
from django.utils import timezone
from django.utils.text import slugify

def avatar_path(instance, filename):
    owner = instance.slug or instance.pk or "new"
    return f"alumni/{owner}/{uuid.uuid4().hex}{Path(filename).suffix.lower()}"

def validate_avatar_size(value):
    if value.size > 3 * 1024 * 1024:
        raise ValidationError("Avatar 3 MB dan oshmasligi kerak.")

def validate_unsplash_image_url(value):
    parsed = urlparse(value)
    if parsed.scheme != "https" or parsed.hostname != "images.unsplash.com":
        raise ValidationError("Demo rasm faqat HTTPS images.unsplash.com manzilidan bo‘lishi mumkin.")

def validate_unsplash_source_url(value):
    parsed = urlparse(value)
    if parsed.scheme != "https" or parsed.hostname not in {"unsplash.com", "www.unsplash.com"}:
        raise ValidationError("Rasm manbasi faqat HTTPS Unsplash sahifasi bo‘lishi mumkin.")

class AlumniProfile(models.Model):
    class Verification(models.TextChoices):
        UNVERIFIED="unverified", "Tasdiqlanmagan"; PENDING="pending", "Kutilmoqda"; VERIFIED="verified", "Tasdiqlangan"; REJECTED="rejected", "Rad etilgan"
    class Visibility(models.TextChoices):
        PUBLIC="public", "Ommaviy"; ALUMNI="alumni", "Faqat bitiruvchilar"; UNIVERSITY="university", "Faqat universitet"; PRIVATE="private", "Yopiq"
    user = models.OneToOneField(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="alumni_profile")
    full_name = models.CharField(max_length=160)
    slug = models.SlugField(max_length=180, unique=True, blank=True)
    avatar = models.ImageField(upload_to=avatar_path, blank=True, validators=[FileExtensionValidator(["jpg", "jpeg", "png", "webp"]), validate_avatar_size])
    image_url = models.URLField(max_length=700, blank=True, validators=[validate_unsplash_image_url])
    image_alt = models.CharField(max_length=220, blank=True)
    image_credit = models.CharField(max_length=120, blank=True)
    image_source_url = models.URLField(max_length=500, blank=True, validators=[validate_unsplash_source_url])
    faculty = models.ForeignKey("universities.Faculty", null=True, blank=True, on_delete=models.SET_NULL, related_name="alumni")
    specialty = models.ForeignKey("universities.Specialty", null=True, blank=True, on_delete=models.SET_NULL, related_name="alumni")
    graduation_year = models.PositiveSmallIntegerField(null=True, blank=True, db_index=True, validators=[MinValueValidator(1956), MaxValueValidator(date.today().year + 1)])
    degree = models.CharField(max_length=80, blank=True)
    current_company = models.CharField(max_length=160, blank=True, db_index=True)
    position = models.CharField(max_length=160, blank=True)
    industry = models.CharField(max_length=120, blank=True, db_index=True)
    city = models.CharField(max_length=120, blank=True, db_index=True)
    country = models.CharField(max_length=120, blank=True, default="O‘zbekiston")
    skills = models.JSONField(default=list, blank=True)
    bio = models.TextField(blank=True, max_length=1200)
    biography_uz = models.TextField(blank=True, max_length=2400)
    biography_en = models.TextField(blank=True, max_length=2400)
    career_story_uz = models.TextField(blank=True, max_length=6000)
    career_story_en = models.TextField(blank=True, max_length=6000)
    linkedin_url = models.URLField(blank=True); github_url = models.URLField(blank=True); website_url = models.URLField(blank=True)
    phone = models.CharField(max_length=32, blank=True)
    visibility = models.CharField(max_length=16, choices=Visibility.choices, default=Visibility.PUBLIC, db_index=True)
    verification_status = models.CharField(max_length=16, choices=Verification.choices, default=Verification.UNVERIFIED, db_index=True)
    is_featured = models.BooleanField(default=False, db_index=True)
    featured_order = models.PositiveSmallIntegerField(null=True, blank=True, db_index=True)
    is_published = models.BooleanField(default=False, db_index=True)
    published_at = models.DateTimeField(null=True, blank=True, db_index=True)
    seo_title = models.CharField(max_length=180, blank=True)
    seo_description = models.CharField(max_length=320, blank=True)
    created_at = models.DateTimeField(auto_now_add=True); updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ("-is_featured", "featured_order", "full_name")
        indexes = [
            models.Index(fields=("is_published", "is_featured"), name="alumni_pub_featured_idx"),
            models.Index(fields=("is_published", "graduation_year"), name="alumni_pub_year_idx"),
        ]
    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.full_name) or uuid.uuid4().hex[:10]
            candidate, suffix = base, 2
            while AlumniProfile.objects.exclude(pk=self.pk).filter(slug=candidate).exists():
                candidate, suffix = f"{base}-{suffix}", suffix + 1
            self.slug = candidate
        if self.is_published and self.published_at is None:
            self.published_at = timezone.now()
        if not self.is_published:
            self.published_at = None
        super().save(*args, **kwargs)
    def __str__(self): return self.full_name

class Achievement(models.Model):
    class Category(models.TextChoices):
        PROFESSIONAL="professional", "Professional"; ACADEMIC="academic", "Academic"; PUBLIC_SERVICE="public_service", "Public Service"; LEADERSHIP="leadership", "Leadership"; INTERNATIONAL="international", "International"; AWARD="award", "Award"; INNOVATION="innovation", "Innovation"
    alumnus = models.ForeignKey(AlumniProfile, on_delete=models.CASCADE, related_name="achievements")
    title = models.CharField(max_length=220)
    description = models.TextField(blank=True, max_length=1200)
    year = models.PositiveSmallIntegerField(null=True, blank=True)
    category = models.CharField(max_length=32, choices=Category.choices, default=Category.PROFESSIONAL)
    order = models.PositiveSmallIntegerField(default=0)
    class Meta: ordering = ("order", "-year", "id")
    def __str__(self): return self.title

class CareerTimelineItem(models.Model):
    class Type(models.TextChoices):
        EDUCATION="education", "Education"; CAREER="career", "Career"; AWARD="award", "Award"; LEADERSHIP="leadership", "Leadership"; MILESTONE="milestone", "Milestone"
    alumnus = models.ForeignKey(AlumniProfile, on_delete=models.CASCADE, related_name="timeline")
    year = models.PositiveSmallIntegerField(validators=[MinValueValidator(1956), MaxValueValidator(date.today().year + 1)])
    title = models.CharField(max_length=220)
    organization = models.CharField(max_length=180, blank=True)
    description = models.TextField(blank=True, max_length=1200)
    type = models.CharField(max_length=24, choices=Type.choices, default=Type.CAREER)
    order = models.PositiveSmallIntegerField(default=0)
    class Meta: ordering = ("order", "year", "id")
    def __str__(self): return f"{self.year} — {self.title}"

def validate_https_url(value):
    URLValidator(schemes=["https"])(value)
    if not value.lower().startswith("https://"):
        raise ValidationError("Faqat HTTPS manzillarga ruxsat beriladi.")

class AlumniSource(models.Model):
    class Type(models.TextChoices):
        UNIVERSITY="university", "University"; OFFICIAL_ORGANIZATION="official_organization", "Official organization"; GOVERNMENT="government", "Government"; NEWS="news", "News"; PROFESSIONAL_PROFILE="professional_profile", "Professional profile"; PUBLICATION="publication", "Publication"; OTHER="other", "Other"
    alumnus = models.ForeignKey(AlumniProfile, on_delete=models.CASCADE, related_name="sources")
    title = models.CharField(max_length=220)
    url = models.URLField(max_length=500, validators=[validate_https_url])
    source_type = models.CharField(max_length=32, choices=Type.choices, default=Type.OTHER)
    publisher = models.CharField(max_length=180, blank=True)
    published_date = models.DateField(null=True, blank=True)
    is_verified = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta: ordering = ("-is_verified", "-published_date", "id")
    def __str__(self): return self.title

class FeaturedAlumni(models.Model):
    alumni = models.OneToOneField(AlumniProfile, on_delete=models.CASCADE, related_name="featured_entry")
    title = models.CharField(max_length=180)
    short_description = models.CharField(max_length=320, blank=True)
    display_order = models.PositiveSmallIntegerField(default=0, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    featured_at = models.DateTimeField(auto_now_add=True)
    class Meta: ordering = ("display_order", "-featured_at"); verbose_name_plural = "Featured alumni"
    def __str__(self): return f"{self.display_order}. {self.alumni.full_name}"
