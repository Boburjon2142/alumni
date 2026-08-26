from django.contrib.auth import authenticate
from django.db import transaction
from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta: model = User; fields = ("id", "email", "role")

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

