from rest_framework import serializers
from .models import Feedback

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ("id", "type", "name", "contact", "message", "page_type", "page_url", "alumni", "story", "created_at")
        read_only_fields = ("id", "created_at")

    def validate_message(self, value):
        val = value.strip()
        if len(val) < 5:
            raise serializers.ValidationError("Xabar matni kamida 5 belgidan iborat bo‘lishi kerak.")
        if len(val) > 3000:
            raise serializers.ValidationError("Xabar matni 3000 belgidan oshmasligi kerak.")
        return val
