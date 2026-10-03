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
    class ApprovalStatus(models.TextChoices):
        PENDING = "pending", "Kutilmoqda"
        APPROVED = "approved", "Tasdiqlangan"
        REJECTED = "rejected", "Rad etilgan"
    class AcademicDegree(models.TextChoices):
        NONE = "", "Ilmiy darajasi yo‘q"
        PHD = "phd", "Falsafa doktori (PhD)"
        DSC = "dsc", "Fan doktori (DSc)"
    class AcademicTitle(models.TextChoices):
        NONE = "", "Ilmiy unvoni yo‘q"
        DOCENT = "docent", "Dotsent"
        PROFESSOR = "professor", "Professor"
        SENIOR_RESEARCHER = "senior_researcher", "Katta ilmiy xodim"
        ACADEMICIAN = "academician", "Akademik"
    class Verification(models.TextChoices):
        UNVERIFIED="unverified", "Tasdiqlanmagan"; PENDING="pending", "Kutilmoqda"; VERIFIED="verified", "Tasdiqlangan"; REJECTED="rejected", "Rad etilgan"
    class Visibility(models.TextChoices):
        PUBLIC="public", "Ommaviy"; ALUMNI="alumni", "Faqat bitiruvchilar"; UNIVERSITY="university", "Faqat universitet"; PRIVATE="private", "Yopiq"
    user = models.OneToOneField(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="alumni_profile")
    full_name = models.CharField(max_length=160, unique=True)
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
    academic_degree = models.CharField(max_length=64, choices=AcademicDegree.choices, blank=True, default="")
    academic_title = models.CharField(max_length=64, choices=AcademicTitle.choices, blank=True, default="")
    current_company = models.CharField(max_length=160, blank=True, db_index=True)
    position = models.CharField(max_length=160, blank=True)
    current_activity = models.CharField(max_length=255, blank=True)
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
    contact_email = models.EmailField(max_length=254, blank=True)
    visibility = models.CharField(max_length=16, choices=Visibility.choices, default=Visibility.PUBLIC, db_index=True)
    verification_status = models.CharField(max_length=16, choices=Verification.choices, default=Verification.UNVERIFIED, db_index=True)
    approval_status = models.CharField(max_length=16, choices=ApprovalStatus.choices, default=ApprovalStatus.PENDING, db_index=True)
    is_honorary = models.BooleanField(default=False, db_index=True)
    approved_at = models.DateTimeField(null=True, blank=True, db_index=True)
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="approved_alumni_profiles")
    is_featured = models.BooleanField(default=False, db_index=True)
    featured_order = models.PositiveSmallIntegerField(null=True, blank=True, db_index=True)
    is_published = models.BooleanField(default=False, db_index=True)
    published_at = models.DateTimeField(null=True, blank=True, db_index=True)
    seo_title = models.CharField(max_length=180, blank=True)
    seo_description = models.CharField(max_length=320, blank=True)
    created_at = models.DateTimeField(auto_now_add=True); updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ("-is_honorary", "-is_featured", "featured_order", "full_name")
        indexes = [
            models.Index(fields=("is_published", "is_featured"), name="alumni_pub_featured_idx"),
            models.Index(fields=("is_published", "graduation_year"), name="alumni_pub_year_idx"),
            models.Index(fields=("approval_status", "graduation_year"), name="alumni_appr_year_idx"),
            models.Index(fields=("approval_status", "is_honorary"), name="alumni_appr_hon_idx"),
        ]
    def save(self, *args, **kwargs):
        if self.avatar and hasattr(self.avatar, "file") and not str(self.avatar.name).lower().endswith(".webp"):
            try:
                from common.image_optimizer import optimize_image_field
                optimize_image_field(self.avatar, max_dimension=800, quality=82)
            except Exception:
                pass

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

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

@receiver([post_save, post_delete], sender=AlumniProfile)
def clear_alumni_cache(sender, **kwargs):
    from common.cache_utils import invalidate_cache_prefix
    invalidate_cache_prefix("api:alumni")
    invalidate_cache_prefix("api:featured_alumni")
    invalidate_cache_prefix("api:recognition_titles")
    invalidate_cache_prefix("api:graduation_group")
    invalidate_cache_prefix("api:stats")
    invalidate_cache_prefix("api:impact")


class Achievement(models.Model):
    class Category(models.TextChoices):
        PROFESSIONAL="professional", "Professional"; ACADEMIC="academic", "Academic"; PUBLIC_SERVICE="public_service", "Public Service"; LEADERSHIP="leadership", "Leadership"; INTERNATIONAL="international", "International"; AWARD="award", "Award"; INNOVATION="innovation", "Innovation"
    alumnus = models.ForeignKey(AlumniProfile, on_delete=models.CASCADE, related_name="achievements")
    title = models.CharField(max_length=500)
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
    title = models.CharField(max_length=500)
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

class AlumniConsent(models.Model):
    alumni = models.OneToOneField(AlumniProfile, on_delete=models.CASCADE, related_name="consent")
    policy_version = models.CharField(max_length=32, default="1.0")
    accepted = models.BooleanField(default=True)
    accepted_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=500, blank=True)

    class Meta:
        ordering = ("-accepted_at",)
        verbose_name = "Alumni roziligi"
        verbose_name_plural = "Alumni roziliklari"

    def __str__(self):
        return f"{self.alumni.full_name} — v{self.policy_version} ({self.accepted_at:%d.%m.%Y %H:%M})"


class WorkExperience(models.Model):
    alumnus = models.ForeignKey(AlumniProfile, on_delete=models.CASCADE, related_name="work_experiences")
    region = models.CharField(max_length=120, blank=True)
    company = models.CharField(max_length=200)
    position = models.CharField(max_length=200)
    industry = models.CharField(max_length=160, blank=True, verbose_name="Faoliyat sohasi")
    start_year = models.PositiveSmallIntegerField(validators=[MinValueValidator(1956), MaxValueValidator(date.today().year + 1)])
    end_year = models.PositiveSmallIntegerField(null=True, blank=True, validators=[MinValueValidator(1956), MaxValueValidator(date.today().year + 1)])
    is_current = models.BooleanField(default=False)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ("order", "-start_year", "id")
        verbose_name = "Mehnat faoliyati"
        verbose_name_plural = "Mehnat faoliyati yozuvlari"

    def __str__(self):
        return f"{self.company} — {self.position} ({self.start_year}-{self.end_year or 'hozir'})"


class EducationExperience(models.Model):
    class DegreeLevel(models.TextChoices):
        BACHELOR = "bachelor", "Bakalavr"
        MASTER = "master", "Magistratura (Magistr)"
        PHD = "phd", "Falsafa doktori (PhD)"
        DSC = "dsc", "Fan doktori (DSc)"
        RESIDENCY = "residency", "Ordinatura / Rezidentura"
        SECOND_DEGREE = "second_degree", "Ikkinchi oliy ta'lim"
        OTHER = "other", "Boshqa"

    alumnus = models.ForeignKey(AlumniProfile, on_delete=models.CASCADE, related_name="educations")
    degree_level = models.CharField(max_length=32, choices=DegreeLevel.choices, default=DegreeLevel.MASTER)
    institution = models.CharField(max_length=220, default="Qarshi davlat universiteti")
    faculty = models.CharField(max_length=220, blank=True)
    specialty = models.CharField(max_length=220, blank=True)
    start_year = models.PositiveSmallIntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(1956), MaxValueValidator(date.today().year + 1)]
    )
    graduation_year = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1956), MaxValueValidator(date.today().year + 1)]
    )
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ("order", "-graduation_year", "id")
        verbose_name = "Ta'lim ma'lumoti"
        verbose_name_plural = "Ta'lim ma'lumotlari"

    def __str__(self):
        return f"{self.get_degree_level_display()} — {self.institution} ({self.graduation_year})"


class GraduationYearChangeRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Kutilmoqda"
        APPROVED = "approved", "Tasdiqlangan"
        REJECTED = "rejected", "Rad etilgan"

    alumnus = models.ForeignKey(AlumniProfile, on_delete=models.CASCADE, related_name="graduation_year_requests")
    old_year = models.PositiveSmallIntegerField(null=True, blank=True)
    requested_year = models.PositiveSmallIntegerField(validators=[MinValueValidator(1956), MaxValueValidator(date.today().year + 1)])
    reason = models.TextField(max_length=1000)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING, db_index=True)
    admin_note = models.TextField(blank=True, max_length=1000)
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="reviewed_graduation_requests")

    class Meta:
        ordering = ("-created_at",)
        verbose_name = "Bitiruv yilini o‘zgartirish so‘rovi"
        verbose_name_plural = "Bitiruv yilini o‘zgartirish so‘rovlari"

    def __str__(self):
        return f"{self.alumnus.full_name}: {self.old_year} -> {self.requested_year} ({self.get_status_display()})"


class RecognitionTitle(models.Model):
    class Category(models.TextChoices):
        SUPREME_HONOR = "supreme_honor", "Oliy unvon"
        ACHIEVEMENT_NOMINATION = "achievement_nomination", "Yutuqlar uchun nominatsiya"
        UNIVERSITY_CONTRIBUTION = "university_contribution", "Universitetga qo‘shgan hissa"
        TRADITIONAL_STATUS = "traditional_status", "An’anaviy status"

    class RecognitionType(models.TextChoices):
        SUPREME_HONOR = "supreme_honor", "Oliy unvon"
        NOMINATION = "nomination", "Yillik nominatsiya"
        TERM_STATUS = "term_status", "Muddatli maqom"
        TRADITIONAL_STATUS = "traditional_status", "An’anaviy status"

    name = models.CharField(max_length=160)
    slug = models.SlugField(max_length=160, unique=True)
    category = models.CharField(
        max_length=32,
        choices=Category.choices,
        default=Category.ACHIEVEMENT_NOMINATION,
        db_index=True,
    )
    recognition_type = models.CharField(
        max_length=32,
        choices=RecognitionType.choices,
        default=RecognitionType.NOMINATION,
        db_index=True,
    )
    description = models.TextField(blank=True, max_length=1000)
    eligibility_summary = models.TextField(blank=True, max_length=1000)
    symbol_name = models.CharField(max_length=64, blank=True)
    icon = models.CharField(max_length=64, blank=True, default="award")
    has_levels = models.BooleanField(default=False)
    annual_quota = models.PositiveSmallIntegerField(null=True, blank=True)
    term_years = models.PositiveSmallIntegerField(null=True, blank=True)
    order = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        ordering = ("order", "name")
        verbose_name = "Faxriy unvon / Mukofot"
        verbose_name_plural = "Faxriy unvonlar va mukofotlar"
        indexes = [
            models.Index(fields=("category", "is_active"), name="rec_title_cat_act_idx"),
            models.Index(fields=("recognition_type", "is_active"), name="rec_title_type_act_idx"),
        ]

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"


class AlumniRecognition(models.Model):
    class Level(models.TextChoices):
        BRONZE = "bronze", "Bronza"
        SILVER = "silver", "Kumush"
        GOLD = "gold", "Oltin"

    LEVEL_ORDER = {
        Level.BRONZE: 1,
        Level.SILVER: 2,
        Level.GOLD: 3,
    }

    class Status(models.TextChoices):
        DRAFT = "draft", "Qoralama"
        APPROVED = "approved", "Tasdiqlangan"
        REVOKED = "revoked", "Bekor qilingan"

    alumnus = models.ForeignKey(AlumniProfile, on_delete=models.CASCADE, related_name="recognitions")
    title = models.ForeignKey(RecognitionTitle, on_delete=models.CASCADE, related_name="alumni_recognitions")
    level = models.CharField(max_length=16, choices=Level.choices, null=True, blank=True, db_index=True)
    year = models.PositiveSmallIntegerField(null=True, blank=True, db_index=True)
    awarded_at = models.DateField(null=True, blank=True)
    valid_from = models.DateField(null=True, blank=True)
    valid_until = models.DateField(null=True, blank=True)
    justification = models.TextField(blank=True, max_length=2000)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.APPROVED, db_index=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="approved_recognitions"
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    revoked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="revoked_recognitions"
    )
    revoked_at = models.DateTimeField(null=True, blank=True)
    revocation_reason = models.TextField(blank=True, max_length=1000)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("title__order", "-year", "id")
        verbose_name = "Bitiruvchi e’tirofi / mukofoti"
        verbose_name_plural = "Bitiruvchilar e’tiroflari va mukofotlari"
        indexes = [
            models.Index(fields=("status", "is_active"), name="alumni_rec_st_act_idx"),
            models.Index(fields=("title", "year", "status"), name="alumni_rec_yr_st_idx"),
            models.Index(fields=("alumnus", "title", "status"), name="alumni_rec_alumnus_idx"),
        ]

    def clean(self):
        super().clean()
        # 1. Sync is_active with status
        if self.status == self.Status.APPROVED:
            self.is_active = True
        else:
            self.is_active = False

        # 2. Duplicate prevention & level upgrade validation
        if self.alumnus_id and self.title_id:
            existing = AlumniRecognition.objects.filter(
                alumnus_id=self.alumnus_id,
                title_id=self.title_id
            ).exclude(pk=self.pk).exclude(status=self.Status.REVOKED)

            if existing.exists():
                if not getattr(self.title, "has_levels", False):
                    raise ValidationError(
                        f'"{self.title.name}" e’tirofi ushbu bitiruvchiga allaqachon biriktirilgan. '
                        f'Nizomga ko‘ra bitta nominatsiya bir shaxsga bir marta beriladi.'
                    )
                else:
                    # For awards with levels (e.g. Oliyhimmat), check level upgrade
                    prev_rec = existing.first()
                    prev_order = self.LEVEL_ORDER.get(prev_rec.level, 0)
                    curr_order = self.LEVEL_ORDER.get(self.level, 0)
                    if curr_order <= prev_order:
                        raise ValidationError(
                            f'"{self.title.name}" mukofoti darajasini faqat oshirish mumkin '
                            f'(Mavjud: {prev_rec.get_level_display() or "Yo‘q"}, Yangi: {self.get_level_display() or "Yo‘q"}).'
                        )

        # 3. Quota enforcement for nominations with annual quota
        if self.title_id and getattr(self.title, "annual_quota", None) and self.year and self.status == self.Status.APPROVED:
            quota = self.title.annual_quota
            current_approved_count = AlumniRecognition.objects.filter(
                title_id=self.title_id,
                year=self.year,
                status=self.Status.APPROVED
            ).exclude(pk=self.pk).count()

            if current_approved_count >= quota:
                raise ValidationError(
                    f'"{self.title.name}" nominatsiyasi uchun {self.year}-yilda belgilangan '
                    f'yillik kvota ({quota} nafar laureat) to‘lgan.'
                )

        # 4. Term status validity date auto-computation
        if self.title_id and getattr(self.title, "recognition_type", "") == RecognitionTitle.RecognitionType.TERM_STATUS:
            if self.valid_from and not self.valid_until:
                term_years = getattr(self.title, "term_years", 2) or 2
                try:
                    self.valid_until = self.valid_from.replace(year=self.valid_from.year + term_years)
                except ValueError:
                    self.valid_until = self.valid_from + (date(self.valid_from.year + term_years, 3, 1) - date(self.valid_from.year, 3, 1))

    def save(self, *args, **kwargs):
        self.clean()
        if self.status == self.Status.APPROVED and not self.approved_at:
            self.approved_at = timezone.now()
        if self.status == self.Status.REVOKED and not self.revoked_at:
            self.revoked_at = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        level_str = f" ({self.get_level_display()})" if self.level else ""
        year_str = f" [{self.year}]" if self.year else ""
        return f"{self.alumnus.full_name} — {self.title.name}{level_str}{year_str}"


post_save.connect(clear_alumni_cache, sender=RecognitionTitle, dispatch_uid="recognition_title_saved")
post_delete.connect(clear_alumni_cache, sender=RecognitionTitle, dispatch_uid="recognition_title_deleted")
post_save.connect(clear_alumni_cache, sender=AlumniRecognition, dispatch_uid="alumni_recognition_saved")
post_delete.connect(clear_alumni_cache, sender=AlumniRecognition, dispatch_uid="alumni_recognition_deleted")


