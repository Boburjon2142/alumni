from rest_framework import serializers
from .models import Feedback

class FeedbackSerializer(serializers.ModelSerializer):
    page_url = serializers.CharField(required=False, allow_blank=True, max_length=500, default="")
    subject = serializers.CharField(required=False, allow_blank=True, max_length=200, default="")
    email = serializers.EmailField(required=False, allow_blank=True, max_length=160, default="")
    phone = serializers.CharField(required=False, allow_blank=True, max_length=40, default="")

    class Meta:
        model = Feedback
        fields = (
            "id",
            "type",
            "subject",
            "name",
            "email",
            "phone",
            "contact",
            "message",
            "page_type",
            "page_url",
            "alumni",
            "story",
            "created_at",
        )
        read_only_fields = ("id", "created_at")

    def validate_type(self, value):
        if value not in Feedback.Type.values:
            raise serializers.ValidationError("Murojaat turi noto‘g‘ri tanlandi.")
        return value

    def validate_subject(self, value):
        if value:
            val = value.strip()
            if len(val) > 200:
                raise serializers.ValidationError("Mavzu 200 belgidan oshmasligi kerak.")
            return val
        return value

    def validate_name(self, value):
        if value:
            val = value.strip()
            if len(val) > 160:
                raise serializers.ValidationError("Ism 160 belgidan oshmasligi kerak.")
            return val
        return value

    def validate_email(self, value):
        if value:
            val = value.strip()
            if len(val) > 160:
                raise serializers.ValidationError("Email 160 belgidan oshmasligi kerak.")
            return val
        return value

    def validate_phone(self, value):
        if value:
            val = value.strip()
            if len(val) > 40:
                raise serializers.ValidationError("Telefon 40 belgidan oshmasligi kerak.")
            return val
        return value

    def validate_contact(self, value):
        if value:
            val = value.strip()
            if len(val) > 160:
                raise serializers.ValidationError("Aloqa ma’lumoti 160 belgidan oshmasligi kerak.")
            return val
        return value

    def validate_page_url(self, value):
        if value:
            val = value.strip()
            if len(val) > 500:
                raise serializers.ValidationError("URL 500 belgidan oshmasligi kerak.")
            return val
        return value

    def validate_message(self, value):
        val = value.strip()
        if len(val) < 5:
            raise serializers.ValidationError("Xabar matni kamida 5 belgidan iborat bo‘lishi kerak.")
        if len(val) > 3000:
            raise serializers.ValidationError("Xabar matni 3000 belgidan oshmasligi kerak.")
        return val

    def create(self, validated_data):
        # Auto-combine contact if email or phone are given and contact is blank
        email = validated_data.get("email", "")
        phone = validated_data.get("phone", "")
        contact = validated_data.get("contact", "")

        if not contact:
            parts = []
            if email:
                parts.append(email)
            if phone:
                parts.append(phone)
            if parts:
                validated_data["contact"] = " | ".join(parts)[:160]

        return super().create(validated_data)
