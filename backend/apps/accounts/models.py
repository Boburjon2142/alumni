from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

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
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.ALUMNI)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    USERNAME_FIELD = "email"; REQUIRED_FIELDS = []
    objects = UserManager()

