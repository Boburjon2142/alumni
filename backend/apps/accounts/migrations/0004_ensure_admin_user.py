import os
from django.db import migrations

def create_or_update_admin(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    
    # 1. Main local admin user
    main_admin_email = "boburjonabduganiyev83@gmail.com"
    main_admin_password_hash = "pbkdf2_sha256$1000000$ar42aqtGEL0hsh1kagcEvD$2IxKFayp+23FarH63xKAf+ePw19dCw4IdbJ82k47TUw="
    
    admin_user, created = User.objects.get_or_create(
        email=main_admin_email,
        defaults={
            "password": main_admin_password_hash,
            "role": "admin",
            "is_staff": True,
            "is_superuser": True,
            "is_active": True,
        }
    )
    if not created:
        admin_user.password = main_admin_password_hash
        admin_user.role = "admin"
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.is_active = True
        admin_user.save()

    # 2. Support optional custom production admin from environment variables
    env_admin_email = os.getenv("ADMIN_EMAIL", "").strip().lower()
    env_admin_password = os.getenv("ADMIN_PASSWORD", "").strip()
    if env_admin_email and env_admin_password:
        from django.contrib.auth.hashers import make_password
        env_admin, _ = User.objects.get_or_create(
            email=env_admin_email,
            defaults={
                "password": make_password(env_admin_password),
                "role": "admin",
                "is_staff": True,
                "is_superuser": True,
                "is_active": True,
            }
        )
        env_admin.password = make_password(env_admin_password)
        env_admin.role = "admin"
        env_admin.is_staff = True
        env_admin.is_superuser = True
        env_admin.is_active = True
        env_admin.save()

def reverse_admin(apps, schema_editor):
    pass

class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_user_google_sub'),
    ]

    operations = [
        migrations.RunPython(create_or_update_admin, reverse_admin),
    ]
