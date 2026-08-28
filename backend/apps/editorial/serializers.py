from rest_framework import serializers

from .models import AlumniAdvice, AlumniInterview, Event, EventSpeaker, InterviewItem, StorySection, SuccessStory


class AlumnusSummarySerializer(serializers.Serializer):
    full_name = serializers.CharField()
    slug = serializers.SlugField()
    avatar = serializers.ImageField()
    image_url = serializers.URLField()
    image_alt = serializers.CharField()
    position = serializers.CharField()
    current_company = serializers.CharField()
    faculty = serializers.CharField(source="faculty.name", default=None)


class StorySectionSerializer(serializers.ModelSerializer):
    class Meta: model = StorySection; fields = ("id", "kind", "heading_uz", "heading_en", "content_uz", "content_en", "order")


class SuccessStoryListSerializer(serializers.ModelSerializer):
    alumnus = AlumnusSummarySerializer(read_only=True)
    class Meta: model = SuccessStory; fields = ("id", "slug", "title_uz", "title_en", "summary_uz", "summary_en", "hero_image", "hero_image_url", "hero_image_alt", "hero_image_credit", "hero_image_source_url", "published_at", "is_featured", "alumnus")


class SuccessStoryDetailSerializer(SuccessStoryListSerializer):
    sections = StorySectionSerializer(many=True, read_only=True)
    class Meta(SuccessStoryListSerializer.Meta):
        fields = SuccessStoryListSerializer.Meta.fields + ("student_takeaway_uz", "student_takeaway_en", "sections")


class InterviewItemSerializer(serializers.ModelSerializer):
    class Meta: model = InterviewItem; fields = ("id", "question_uz", "question_en", "answer_uz", "answer_en", "order")


class InterviewListSerializer(serializers.ModelSerializer):
    alumnus = AlumnusSummarySerializer(read_only=True)
    class Meta: model = AlumniInterview; fields = ("id", "slug", "title_uz", "title_en", "intro_uz", "intro_en", "pull_quote_uz", "pull_quote_en", "published_at", "is_featured", "alumnus")


class InterviewDetailSerializer(InterviewListSerializer):
    items = InterviewItemSerializer(many=True, read_only=True)
    class Meta(InterviewListSerializer.Meta): fields = InterviewListSerializer.Meta.fields + ("items",)


class AdviceSerializer(serializers.ModelSerializer):
    alumnus = AlumnusSummarySerializer(read_only=True)
    content_uz = serializers.CharField(source="resolved_content_uz", read_only=True)
    content_ru = serializers.CharField(source="resolved_content_ru", read_only=True)
    content_en = serializers.CharField(source="resolved_content_en", read_only=True)
    class Meta: model = AlumniAdvice; fields = ("id", "category", "title_uz", "title_ru", "title_en", "content_uz", "content_ru", "content_en", "published_at", "is_featured", "alumnus")


class EventSpeakerSerializer(serializers.ModelSerializer):
    alumnus = AlumnusSummarySerializer(read_only=True)
    display_name = serializers.SerializerMethodField()
    class Meta: model = EventSpeaker; fields = ("id", "display_name", "alumnus", "role_uz", "role_en", "order")
    def get_display_name(self, obj): return obj.alumnus.full_name if obj.alumnus_id else obj.external_name


class EventListSerializer(serializers.ModelSerializer):
    status = serializers.CharField(source="computed_status", read_only=True)
    class Meta: model = Event; fields = ("id", "slug", "title_uz", "title_en", "summary_uz", "summary_en", "event_type", "cover_image", "cover_image_url", "cover_image_alt", "cover_image_credit", "cover_image_source_url", "start_at", "end_at", "location_type", "location_uz", "location_en", "external_url", "status", "is_featured")


class EventDetailSerializer(EventListSerializer):
    speakers = EventSpeakerSerializer(source="speaker_links", many=True, read_only=True)
    class Meta(EventListSerializer.Meta): fields = EventListSerializer.Meta.fields + ("description_uz", "description_en", "speakers")
