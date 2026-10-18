"""Validated CMS writes with the same content returned by the public API."""
import uuid

from django.db import transaction
from django.utils.text import slugify
from rest_framework import serializers

from apps.alumni.models import AlumniProfile
from .models import AlumniAdvice, AlumniInterview, InterviewItem, StorySection, SuccessStory
from .serializers import AdviceSerializer, InterviewDetailSerializer, SuccessStoryDetailSerializer


class SectionWriteSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = StorySection
        fields = ("id", "kind", "heading_uz", "heading_en", "content_uz", "content_en")


class ItemWriteSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = InterviewItem
        fields = ("id", "question_uz", "question_en", "answer_uz", "answer_en")


class EditorialWriteSerializer(serializers.ModelSerializer):
    alumni_id = serializers.PrimaryKeyRelatedField(source="alumnus", queryset=AlumniProfile.objects.all())
    output_serializer = None
    children_name = None
    child_model = None
    parent_field = None

    def validate(self, attrs):
        if self.instance and "slug" in attrs and self.Meta.model.objects.filter(slug=attrs["slug"]).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError({"slug": "Bu manzil boshqa yozuvda ishlatilgan."})
        if self.instance and self.children_name and self.children_name in attrs:
            existing = list(getattr(self.instance, self.children_name).all())
            by_id = {child.pk: child for child in existing}
            ids = [item["id"] for item in attrs[self.children_name] if "id" in item]
            if len(ids) != len(set(ids)) or any(pk not in by_id for pk in ids):
                raise serializers.ValidationError({self.children_name: "Bo‘lim identifikatori noto‘g‘ri."})
            # Old clients identify children by their position. Preserve their IDs
            # so advice derived from an interview keeps referencing the same answer.
            used = set(ids)
            for index, item in enumerate(attrs[self.children_name]):
                if "id" not in item and index < len(existing) and existing[index].pk not in used:
                    item["id"] = existing[index].pk
                    used.add(existing[index].pk)
            if self.child_model is InterviewItem:
                if any(child.pk not in used and child.derived_advice.exists() for child in existing):
                    raise serializers.ValidationError({"items": "Maslahatga bog‘langan savol-javobni o‘chirib bo‘lmaydi."})
        return attrs

    def _save_children(self, instance, children):
        manager = getattr(instance, self.children_name)
        existing = {child.pk: child for child in manager.all()}
        retained = {item["id"] for item in children if "id" in item}
        manager.exclude(pk__in=retained).delete()
        # Move retained children out of the final order range before reordering.
        for index, child in enumerate(existing.values()):
            if child.pk in retained:
                manager.filter(pk=child.pk).update(order=10000 + index)
        for index, values in enumerate(children):
            values = dict(values)
            child = existing.get(values.pop("id", None))
            if child is None:
                child = self.child_model(**{self.parent_field: instance})
            for key, value in values.items():
                setattr(child, key, value)
            child.order = index
            child.save()
        instance._prefetched_objects_cache = {}

    @transaction.atomic
    def create(self, validated_data):
        children = validated_data.pop(self.children_name, []) if self.children_name else None
        if hasattr(self.Meta.model, "slug"):
            base = slugify(validated_data.get("slug") or validated_data["title_uz"])[:170] or uuid.uuid4().hex
            slug, counter = base, 2
            while self.Meta.model.objects.filter(slug=slug).exists():
                slug, counter = f"{base}-{counter}", counter + 1
            validated_data["slug"] = slug
        instance = super().create(validated_data)
        if children is not None:
            self._save_children(instance, children)
        return instance

    @transaction.atomic
    def update(self, instance, validated_data):
        children = validated_data.pop(self.children_name, None) if self.children_name else None
        instance = super().update(instance, validated_data)
        if children is not None:
            self._save_children(instance, children)
        return instance

    def to_representation(self, instance):
        data = self.output_serializer(instance, context=self.context).data
        if not instance.is_published:
            data["published_at"] = None
        return {**data, "alumni_id": instance.alumnus_id, "is_published": instance.is_published}


class StoryManagementSerializer(EditorialWriteSerializer):
    sections = SectionWriteSerializer(many=True, required=False, max_length=100)
    output_serializer = SuccessStoryDetailSerializer
    children_name, child_model, parent_field = "sections", StorySection, "story"

    class Meta:
        model = SuccessStory
        fields = ("alumni_id", "slug", "title_uz", "title_en", "summary_uz", "summary_en",
                  "hero_image_url", "hero_image_alt", "hero_image_credit", "hero_image_source_url",
                  "student_takeaway_uz", "student_takeaway_en", "is_featured", "is_published", "sections")
        extra_kwargs = {"slug": {"required": False, "validators": []}}


class InterviewManagementSerializer(EditorialWriteSerializer):
    items = ItemWriteSerializer(many=True, required=False, max_length=100)
    output_serializer = InterviewDetailSerializer
    children_name, child_model, parent_field = "items", InterviewItem, "interview"

    class Meta:
        model = AlumniInterview
        fields = ("alumni_id", "slug", "title_uz", "title_en", "intro_uz", "intro_en",
                  "pull_quote_uz", "pull_quote_en", "video_url", "video_duration", "is_featured", "is_published", "items")
        extra_kwargs = {"slug": {"required": False, "validators": []}}

    def validate(self, attrs):
        attrs = super().validate(attrs)
        published = attrs.get("is_published", self.instance.is_published if self.instance else False)
        if published:
            items = attrs.get("items")
            complete = any(item.get("question_uz", "").strip() and item.get("answer_uz", "").strip() for item in items) if items is not None else bool(
                self.instance and self.instance.items.exclude(question_uz="").exclude(answer_uz="").exists())
            if not complete:
                raise serializers.ValidationError({"items": "Nashr qilish uchun kamida bitta to‘liq savol-javob kerak."})
        return attrs


class AdviceManagementSerializer(EditorialWriteSerializer):
    output_serializer = AdviceSerializer

    class Meta:
        model = AlumniAdvice
        fields = ("alumni_id", "category", "title_uz", "title_ru", "title_en", "content_uz", "content_ru", "content_en", "is_featured", "is_published")

    def validate(self, attrs):
        attrs = super().validate(attrs)
        source = self.instance.source_interview_item if self.instance else None
        alumnus = attrs.get("alumnus", self.instance.alumnus if self.instance else None)
        if source and source.interview.alumnus_id != alumnus.pk:
            raise serializers.ValidationError({"alumni_id": "Maslahat va manba intervyu bir bitiruvchiga tegishli bo‘lishi kerak."})
        if source and "content_uz" in attrs and not attrs["content_uz"].strip():
            raise serializers.ValidationError({"content_uz": "Manba savol-javob matni bo‘sh bo‘lmasligi kerak."})
        if not source and not attrs.get("content_uz", self.instance.content_uz if self.instance else "").strip():
            raise serializers.ValidationError({"content_uz": "Maslahat matni majburiy."})
        # The existing editor edits the displayed answer. Persist it to the source
        # as well, rather than reporting success while the public content stays old.
        return attrs

    @transaction.atomic
    def update(self, instance, validated_data):
        if instance.source_interview_item_id:
            source = instance.source_interview_item
            for language in ("uz", "en"):
                key = f"content_{language}"
                if key in validated_data:
                    setattr(source, f"answer_{language}", validated_data[key])
            source.save()
        return super().update(instance, validated_data)
