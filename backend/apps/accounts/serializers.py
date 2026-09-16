from django.contrib.auth import authenticate
from django.db import transaction
from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    slug = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "email", "role", "full_name", "avatar", "slug")

    def get_full_name(self, obj):
        if hasattr(obj, "alumni_profile") and obj.alumni_profile:
            return obj.alumni_profile.full_name
        return obj.email.split("@")[0]

    def get_avatar(self, obj):
        if hasattr(obj, "alumni_profile") and obj.alumni_profile:
            if obj.alumni_profile.avatar:
                return obj.alumni_profile.avatar.url
            if obj.alumni_profile.image_url:
                return obj.alumni_profile.image_url
        return None

    def get_slug(self, obj):
        if hasattr(obj, "alumni_profile") and obj.alumni_profile:
            return obj.alumni_profile.slug
        return None

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    full_name = serializers.CharField(write_only=True, max_length=160)
    class Meta: model = User; fields = ("email", "password", "full_name")
    @transaction.atomic
    def create(self, data):
        full_name = data.pop("full_name")
        user = User.objects.create_user(**data)
        from apps.alumni.models import AlumniProfile
        AlumniProfile.objects.create(user=user, full_name=full_name)
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(); password = serializers.CharField(write_only=True)
    def validate(self, data):
        user = authenticate(request=self.context.get("request"), email=data["email"], password=data["password"])
        if not user or not user.is_active: raise serializers.ValidationError("Email yoki parol noto‘g‘ri.")
        data["user"] = user; return data

class SendCodeSerializer(serializers.Serializer):
    email = serializers.EmailField()
    purpose = serializers.ChoiceField(
        choices=["join", "login"],
        default="join"
    )
    consent_accepted = serializers.BooleanField(required=False, default=False)

    def validate(self, data):
        if data.get("purpose") == "join" and not data.get("consent_accepted"):
            raise serializers.ValidationError(
                {
                    "consent_accepted": (
                        "Shaxsiy ma’lumotlarni qayta ishlash shartlariga rozilik bildirilishi shart. "
                        "Rozilik bildirmasdan tasdiqlash kodini ololmaysiz."
                    )
                }
            )
        return data

class VerifyCodeSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)
    purpose = serializers.ChoiceField(
        choices=["join", "login"],
        default="join"
    )

class GoogleAuthSerializer(serializers.Serializer):
    credential = serializers.CharField(required=True)
    consent_accepted = serializers.BooleanField(required=False, default=True)

