from django.conf import settings
from django.db import models
from django.utils import timezone


class Contribution(models.Model):
    class Category(models.TextChoices):
        CAREER = "career", "Career Impact (Ishga joylashtirish va amaliyot)"
        MENTORSHIP = "mentorship", "Mentorship Impact (Ustoz-shogirdlik)"
        UNIVERSITY = "university", "University Contribution (Universitetga ko‘mak)"
        COMMUNITY = "community", "Community Contribution (Hamjamiyat va tadbirlar)"

    class ActionType(models.TextChoices):
        # Career
        ALUMNI_HIRED = "alumni_hired", "Bitiruvchini ishga qabul qilish"
        STUDENT_INTERNSHIP = "student_internship", "Talabaga amaliyot (internship) taqdim etish"
        JOB_PLACEMENT_CONFIRMED = "job_placement_confirmed", "Ish bilan ta’minlashda ko‘maklashish"
        # Mentorship
        MENTORSHIP_COMPLETED = "mentorship_completed", "Mentorlik dasturini yakunlash"
        MENTEE_OUTCOME_VERIFIED = "mentee_outcome_verified", "Shogirdning kasbiy natijasini tasdiqlash"
        # University
        UNIVERSITY_PROJECT_SUPPORT = "university_project_support", "Universitet loyihasini qo‘llab-quvvatlash"
        FINANCIAL_SUPPORT = "financial_support", "Moddiy / grant ko‘magi"
        EQUIPMENT_SUPPORT = "equipment_support", "Laboratoriya yoki texnik vosita taqdim etish"
        SCHOLARSHIP_SUPPORT = "scholarship_support", "Talabalarga maxsus stipendiya ajratish"
        # Community
        EVENT_ORGANIZED = "event_organized", "Alumni tadbiri tashkilotchisi"
        EVENT_SPEAKER = "event_speaker", "Tadbir yoki anjumanda spikerlik"
        MASTERCLASS_DELIVERED = "masterclass_delivered", "Mahorat darsi yoki seminar o‘tkazish"
        COMMUNITY_INITIATIVE = "community_initiative", "Hamjamiyat rivoji tashabbusi"

    class Status(models.TextChoices):
        PENDING = "pending", "Kutilmoqda"
        VERIFIED = "verified", "Tasdiqlangan"
        REJECTED = "rejected", "Rad etilgan"
        REVOKED = "revoked", "Bekor qilingan"

    class SourceType(models.TextChoices):
        SELF_REPORTED = "self_reported", "Foydalanuvchi arizasi"
        SYSTEM_GENERATED = "system_generated", "Tizim orqali yaratilgan"
        EVENT = "event", "Universitet tadbiri"
        STAFF_ENTRY = "staff_entry", "Universitet xodimi kiritgan"

    alumni = models.ForeignKey(
        "alumni.AlumniProfile",
        on_delete=models.CASCADE,
        related_name="contributions"
    )
    category = models.CharField(max_length=32, choices=Category.choices, db_index=True)
    action_type = models.CharField(max_length=48, choices=ActionType.choices, db_index=True)
    source_type = models.CharField(max_length=32, choices=SourceType.choices, default=SourceType.SELF_REPORTED)
    source_id = models.CharField(max_length=120, blank=True)

    title = models.CharField(max_length=255)
    description = models.TextField(max_length=2000, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING, db_index=True)

    occurred_at = models.DateTimeField(default=timezone.now, db_index=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True, db_index=True)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="verified_contributions"
    )
    rejection_reason = models.TextField(max_length=1000, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-occurred_at", "-created_at")
        verbose_name = "Tasdiqlangan hissa"
        verbose_name_plural = "Bitiruvchilar hissalari"
        indexes = [
            models.Index(fields=("alumni", "category", "status"), name="contrib_alumni_cat_st_idx"),
            models.Index(fields=("status", "occurred_at"), name="contrib_st_occurred_idx"),
            models.Index(fields=("category", "action_type"), name="contrib_cat_action_idx"),
        ]

    def __str__(self):
        return f"{self.alumni.full_name} — {self.get_action_type_display()} ({self.get_status_display()})"


class ScoreTransaction(models.Model):
    class TransactionType(models.TextChoices):
        AWARD = "award", "Hissa balli qo‘shildi"
        REVERSAL = "reversal", "Hissa balli bekor qilindi"
        CORRECTION = "correction", "Tahrirlash / Korreksiya"

    alumni = models.ForeignKey(
        "alumni.AlumniProfile",
        on_delete=models.CASCADE,
        related_name="score_transactions"
    )
    contribution = models.ForeignKey(
        Contribution,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="score_transactions"
    )
    category = models.CharField(max_length=32, choices=Contribution.Category.choices, db_index=True)
    points = models.IntegerField(help_text="Qo‘shiladigan (musbat) yoki qaytariladigan (manfiy) ball")
    transaction_type = models.CharField(max_length=24, choices=TransactionType.choices, default=TransactionType.AWARD, db_index=True)
    scoring_rule_version = models.CharField(max_length=32, default="v1.0")
    reason = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ("-created_at",)
        verbose_name = "Hissa balli tranzaksiyasi"
        verbose_name_plural = "Hissa ballari ledgeri"
        indexes = [
            models.Index(fields=("alumni", "category", "created_at"), name="score_tx_alumni_cat_idx"),
            models.Index(fields=("transaction_type", "created_at"), name="score_tx_type_created_idx"),
            models.Index(fields=("contribution", "transaction_type"), name="score_tx_contrib_type_idx"),
        ]

    def __str__(self):
        sign = "+" if self.points > 0 else ""
        return f"{self.alumni.full_name}: {sign}{self.points} ({self.get_category_display()} - {self.get_transaction_type_display()})"


class Achievement(models.Model):
    code = models.SlugField(max_length=64, unique=True)
    name_uz = models.CharField(max_length=180)
    name_en = models.CharField(max_length=180, blank=True)
    name_ru = models.CharField(max_length=180, blank=True)
    description_uz = models.TextField(max_length=500)
    description_en = models.TextField(max_length=500, blank=True)
    description_ru = models.TextField(max_length=500, blank=True)
    category = models.CharField(max_length=32, choices=Contribution.Category.choices, db_index=True)
    threshold = models.PositiveIntegerField(default=1, help_text="Talab qilinadigan tasdiqlangan hissa yoki ball miqdori")
    icon_key = models.CharField(max_length=64, default="award")
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        ordering = ("category", "threshold", "id")
        verbose_name = "E’tirof nishoni"
        verbose_name_plural = "E’tirof nishonlari"

    def __str__(self):
        return self.name_uz


class AlumniAchievement(models.Model):
    alumni = models.ForeignKey(
        "alumni.AlumniProfile",
        on_delete=models.CASCADE,
        related_name="achievements_earned"
    )
    achievement = models.ForeignKey(
        Achievement,
        on_delete=models.CASCADE,
        related_name="awardees"
    )
    awarded_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ("-awarded_at",)
        verbose_name = "Bitiruvchi erishgan nishon"
        verbose_name_plural = "Bitiruvchilarning nishonlari"
        constraints = [
            models.UniqueConstraint(fields=("alumni", "achievement"), name="unique_alumni_achievement")
        ]

    def __str__(self):
        return f"{self.alumni.full_name} ➔ {self.achievement.name_uz}"
