from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    ordering = ("email",); list_display = ("email", "role", "is_active", "is_staff")
    fieldsets = ((None, {"fields": ("email", "password")}), ("Ruxsatlar", {"fields": ("role", "is_active", "is_staff", "is_superuser", "groups", "user_permissions")}), ("Muhim sanalar", {"fields": ("last_login", "date_joined")}))
    add_fieldsets = ((None, {"fields": ("email", "password1", "password2", "role")}),)

