from rest_framework import serializers

from .models import AlumniAdvice, AlumniInterview, Event, EventSpeaker, InterviewItem, News, StorySection, SuccessStory


class AchievementSummarySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()
    description = serializers.CharField(allow_blank=True, default="")
    year = serializers.IntegerField(allow_null=True, default=None)
    category = serializers.CharField(default="")


class TimelineSummarySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    year = serializers.IntegerField()
    title = serializers.CharField()
    organization = serializers.CharField(allow_blank=True, default="")
    description = serializers.CharField(allow_blank=True, default="")
    type = serializers.CharField(default="")


class AlumnusSummarySerializer(serializers.Serializer):
    full_name = serializers.CharField()
    slug = serializers.SlugField()
    avatar = serializers.ImageField(allow_null=True, default=None)
    image_url = serializers.CharField(allow_blank=True, default="")
    image_alt = serializers.CharField(allow_blank=True, default="")
    position = serializers.CharField(allow_blank=True, default="")
    current_company = serializers.CharField(allow_blank=True, default="")
    faculty = serializers.CharField(source="faculty.name", default=None)
    specialty = serializers.CharField(source="specialty.name", default=None)
    graduation_year = serializers.IntegerField(default=None)
    degree = serializers.CharField(allow_blank=True, default="")
    academic_degree = serializers.CharField(allow_blank=True, default="")
    academic_degree_display = serializers.CharField(source="get_academic_degree_display", default="")
    academic_title = serializers.CharField(allow_blank=True, default="")
    academic_title_display = serializers.CharField(source="get_academic_title_display", default="")
    bio = serializers.CharField(allow_blank=True, default="")
    achievements = AchievementSummarySerializer(many=True, read_only=True)
    timeline = TimelineSummarySerializer(many=True, read_only=True)


class StorySectionSerializer(serializers.ModelSerializer):
    class Meta: model = StorySection; fields = ("id", "kind", "heading_uz", "heading_en", "content_uz", "content_en", "order")


class SuccessStoryListSerializer(serializers.ModelSerializer):
    alumnus = AlumnusSummarySerializer(read_only=True)
    class Meta: model = SuccessStory; fields = ("id", "slug", "title_uz", "title_en", "summary_uz", "summary_en", "hero_image", "hero_image_url", "hero_image_alt", "hero_image_credit", "hero_image_source_url", "published_at", "is_featured", "alumnus")


class SuccessStoryDetailSerializer(SuccessStoryListSerializer):
    sections = StorySectionSerializer(many=True, read_only=True)
    related_stories = serializers.SerializerMethodField()

    class Meta(SuccessStoryListSerializer.Meta):
        fields = SuccessStoryListSerializer.Meta.fields + (
            "student_takeaway_uz",
            "student_takeaway_en",
            "sections",
            "related_stories",
        )

    def get_related_stories(self, obj):
        related = (
            SuccessStory.objects.filter(is_published=True, alumnus__is_published=True)
            .exclude(pk=obj.pk)
            .select_related("alumnus", "alumnus__faculty")[:3]
        )
        return SuccessStoryListSerializer(related, many=True).data



class InterviewItemSerializer(serializers.ModelSerializer):
    class Meta: model = InterviewItem; fields = ("id", "question_uz", "question_en", "answer_uz", "answer_en", "order")


class InterviewListSerializer(serializers.ModelSerializer):
    alumnus = AlumnusSummarySerializer(read_only=True)
    items_count = serializers.IntegerField(source="items.count", read_only=True)
    class Meta: model = AlumniInterview; fields = ("id", "slug", "title_uz", "title_en", "intro_uz", "intro_en", "pull_quote_uz", "pull_quote_en", "video_url", "video_duration", "published_at", "is_featured", "alumnus", "items_count")


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


class NewsListSerializer(serializers.ModelSerializer):
    class Meta:
        model = News
        fields = (
            "id",
            "slug",
            "title_uz",
            "title_ru",
            "title_en",
            "summary_uz",
            "summary_ru",
            "summary_en",
            "category",
            "cover_image",
            "cover_image_url",
            "cover_image_alt",
            "cover_image_credit",
            "cover_image_source_url",
            "views_count",
            "author_name",
            "published_at",
            "is_featured",
            "created_at",
        )


class NewsDetailSerializer(NewsListSerializer):
    class Meta(NewsListSerializer.Meta):
        fields = NewsListSerializer.Meta.fields + (
            "content_uz",
            "content_ru",
            "content_en",
            "updated_at",
        )


class AdminNewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = News
        fields = "__all__"

