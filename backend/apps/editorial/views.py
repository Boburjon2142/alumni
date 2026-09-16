from django.db.models import Q
from django.utils import timezone
from rest_framework import generics
from rest_framework.permissions import AllowAny

from .models import AlumniAdvice, AlumniInterview, Event, SuccessStory
from .serializers import AdviceSerializer, EventDetailSerializer, EventListSerializer, InterviewDetailSerializer, InterviewListSerializer, SuccessStoryDetailSerializer, SuccessStoryListSerializer


class PublishedListMixin:
    permission_classes = (AllowAny,)


class StoryListView(PublishedListMixin, generics.ListAPIView):
    serializer_class = SuccessStoryListSerializer
    search_fields = ("title_uz", "title_en", "summary_uz", "summary_en", "alumnus__full_name")
    def get_queryset(self):
        qs = SuccessStory.objects.filter(is_published=True, alumnus__is_published=True).select_related("alumnus")
        if self.request.query_params.get("featured") == "true": qs = qs.filter(is_featured=True)
        return qs


class StoryDetailView(generics.RetrieveAPIView):
    permission_classes = (AllowAny,); serializer_class = SuccessStoryDetailSerializer; lookup_field = "slug"
    queryset = SuccessStory.objects.filter(is_published=True, alumnus__is_published=True).select_related("alumnus").prefetch_related("sections")


class InterviewListView(PublishedListMixin, generics.ListAPIView):
    serializer_class = InterviewListSerializer
    def get_queryset(self):
        qs = AlumniInterview.objects.filter(is_published=True, alumnus__is_published=True, items__isnull=False).select_related("alumnus", "alumnus__faculty").distinct()
        search = self.request.query_params.get("search")
        if search:
            search = search.strip()
            qs = qs.filter(
                Q(title_uz__icontains=search) |
                Q(title_en__icontains=search) |
                Q(intro_uz__icontains=search) |
                Q(intro_en__icontains=search) |
                Q(pull_quote_uz__icontains=search) |
                Q(pull_quote_en__icontains=search) |
                Q(alumnus__full_name__icontains=search) |
                Q(alumnus__position__icontains=search) |
                Q(alumnus__current_company__icontains=search) |
                Q(alumnus__faculty__name__icontains=search)
            )
        if self.request.query_params.get("featured") == "true":
            qs = qs.filter(is_featured=True)
        return qs


class InterviewDetailView(generics.RetrieveAPIView):
    permission_classes = (AllowAny,); serializer_class = InterviewDetailSerializer; lookup_field = "slug"
    queryset = AlumniInterview.objects.filter(is_published=True, alumnus__is_published=True, items__isnull=False).select_related("alumnus").prefetch_related("items").distinct()


class AdviceListView(PublishedListMixin, generics.ListAPIView):
    serializer_class = AdviceSerializer
    def get_queryset(self):
        qs = AlumniAdvice.objects.filter(is_published=True, alumnus__is_published=True).select_related("alumnus", "source_interview_item")
        category = self.request.query_params.get("category")
        return qs.filter(category=category) if category else qs


class EventListView(PublishedListMixin, generics.ListAPIView):
    serializer_class = EventListSerializer
    def get_queryset(self):
        qs = Event.objects.filter(is_published=True)
        event_type = self.request.query_params.get("event_type")
        year = self.request.query_params.get("year")
        status = self.request.query_params.get("status")
        if event_type: qs = qs.filter(event_type=event_type)
        if year and year.isdigit(): qs = qs.filter(start_at__year=int(year))
        now = timezone.now()
        if status == "upcoming": qs = qs.filter(start_at__gt=now)
        elif status == "ongoing": qs = qs.filter(start_at__lte=now, end_at__gte=now)
        elif status == "past": qs = qs.filter(Q(end_at__lt=now) | Q(end_at__isnull=True, start_at__lte=now))
        return qs


class EventDetailView(generics.RetrieveAPIView):
    permission_classes = (AllowAny,); serializer_class = EventDetailSerializer; lookup_field = "slug"
    queryset = Event.objects.filter(is_published=True).prefetch_related("speaker_links__alumnus")
