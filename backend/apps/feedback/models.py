from django.db import models
from apps.alumni.models import AlumniProfile
from apps.editorial.models import SuccessStory

class Feedback(models.Model):
    class Type(models.TextChoices):
        PROPOSAL = "proposal", "Taklif"
        QUESTION = "question", "Savol"
        ERROR_REPORT = "error_report", "Xato haqida xabar"
        DATA_CORRECTION = "data_correction", "Ma’lumotni tuzatish"
        ALUMNI_NOMINATION = "alumni_nomination", "Bitiruvchi ma’lumotini taklif qilish"
        ADDITIONAL_INFO = "additional_info", "Qo‘shimcha ma’lumot"
        OTHER = "other", "Boshqa"

    class Status(models.TextChoices):
        NEW = "new", "Yangi"
        REVIEWING = "reviewing", "Ko‘rib chiqilmoqda"
        RESOLVED = "resolved", "Hal qilindi"
        SPAM = "spam", "Spam"

    class DeliveryStatus(models.TextChoices):
        PENDING = "pending", "Kutilmoqda"
        SENT = "sent", "Yuborildi"
        FAILED = "failed", "Yuborilmadi"

    type = models.CharField(max_length=32, choices=Type.choices, default=Type.PROPOSAL)
    subject = models.CharField(max_length=200, blank=True, default="")
    name = models.CharField(max_length=160, blank=True)
    email = models.EmailField(max_length=160, blank=True, default="")
    phone = models.CharField(max_length=40, blank=True, default="")
    contact = models.CharField(max_length=160, blank=True)
    message = models.TextField(max_length=3000)
    page_type = models.CharField(max_length=64, blank=True)
    page_url = models.URLField(max_length=500, blank=True)
    alumni = models.ForeignKey(AlumniProfile, null=True, blank=True, on_delete=models.SET_NULL, related_name="feedbacks")
    story = models.ForeignKey(SuccessStory, null=True, blank=True, on_delete=models.SET_NULL, related_name="feedbacks")
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.NEW, db_index=True)
    telegram_delivery_status = models.CharField(max_length=16, choices=DeliveryStatus.choices, default=DeliveryStatus.PENDING)
    telegram_message_id = models.IntegerField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.CharField(max_length=160, blank=True)

    class Meta:
        ordering = ("-created_at",)
        verbose_name = "Murojaat"
        verbose_name_plural = "Murojaatlar va Takliflar"

    def __str__(self):
        subj = f" ({self.subject})" if self.subject else ""
        return f"{self.get_type_display()}{subj} — {self.name or 'Anonim'} ({self.created_at:%d.%m.%Y %H:%M})"
