from rest_framework import serializers
from .models import Feedback

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ("id", "type", "name", "contact", "message", "page_type", "page_url", "alumni", "story", "created_at")
        read_only_fields = ("id", "created_at")

    def validate_type(self, value):
        if value not in Feedback.Type.values:
            raise serializers.ValidationError("Invalid feedback type.")
        return value

    def validate_name(self, value):
        if value:
            val = value.strip()
            if len(val) > 160:
                raise serializers.ValidationError("Ism 160 belgidan oshmasligi kerak.")
            return val
        return value

    def validate_contact(self, value):
        if value:
            val = value.strip()
            if len(val) > 160:
                raise serializers.ValidationError("Aloqa 160 belgidan oshmasligi kerak.")
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
            raise serializers.ValidationError("Xabar matni kamida 5 belgidan iborat bo'lishi kerak.")
        if len(val) > 3000:
            raise serializers.ValidationError("Xabar matni 3000 belgidan oshmasligi kerak.")
        return val
