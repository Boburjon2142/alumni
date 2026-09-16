from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone

class UserManager(BaseUserManager):
    use_in_migrations = True
    def create_user(self, email, password=None, **extra):
        if not email: raise ValueError("Email majburiy")
        user = self.model(email=self.normalize_email(email), **extra)
        user.set_password(password); user.save(using=self._db); return user
    def create_superuser(self, email, password=None, **extra):
        extra.update(is_staff=True, is_superuser=True, role=User.Role.ADMIN)
        return self.create_user(email, password, **extra)

class User(AbstractUser):
    class Role(models.TextChoices):
        ALUMNI = "alumni", "Bitiruvchi"
        STAFF = "staff", "Universitet xodimi"
        ADMIN = "admin", "Administrator"
    username = None
    email = models.EmailField(unique=True)
    google_sub = models.CharField(max_length=255, unique=True, null=True, blank=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.ALUMNI)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    USERNAME_FIELD = "email"; REQUIRED_FIELDS = []
    objects = UserManager()

class EmailVerificationCode(models.Model):
    class Purpose(models.TextChoices):
        JOIN = "join", "Anketa / Ro‘yxatdan o‘tish"
        LOGIN = "login", "Tizimga kirish"

    email = models.EmailField(db_index=True)
    code = models.CharField(max_length=6)
    purpose = models.CharField(max_length=20, choices=Purpose.choices, default=Purpose.JOIN)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(db_index=True)
    is_verified = models.BooleanField(default=False, db_index=True)
    attempts = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=["email", "purpose", "is_verified"]),
        ]

    def is_valid(self):
        return (not self.is_verified) and (timezone.now() < self.expires_at) and (self.attempts < 5)

    def __str__(self):
        return f"{self.email} ({self.code}) - {self.purpose}"


