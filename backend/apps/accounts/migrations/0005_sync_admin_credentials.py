from django.db import migrations
from django.contrib.auth.hashers import make_password

def sync_admin_user(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    admin_email = "boburjonabduganiyev83@gmail.com"
    admin_password = "KSUCareer2026"
    
    user, created = User.objects.get_or_create(
        email=admin_email,
        defaults={
            "password": make_password(admin_password),
            "role": "admin",
            "is_staff": True,
            "is_superuser": True,
            "is_active": True,
        }
    )
    if not created:
        user.password = make_password(admin_password)
        user.role = "admin"
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.save()

def reverse_admin(apps, schema_editor):
    pass

class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0004_ensure_admin_user'),
    ]

    operations = [
        migrations.RunPython(sync_admin_user, reverse_admin),
    ]
