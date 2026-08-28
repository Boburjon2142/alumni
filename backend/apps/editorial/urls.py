from django.urls import path
from .views import (
    AdviceListView,
    EventDetailView,
    EventListView,
    InterviewDetailView,
    InterviewListView,
    StoryDetailView,
    StoryListView,
)

urlpatterns = [
    path("advice/", AdviceListView.as_view(), name="advice-list"),
    path("stories/", StoryListView.as_view(), name="story-list"),
    path("stories/<slug:slug>/", StoryDetailView.as_view(), name="story-detail"),
    path("interviews/", InterviewListView.as_view(), name="interview-list"),
    path("interviews/<slug:slug>/", InterviewDetailView.as_view(), name="interview-detail"),
    path("events/", EventListView.as_view(), name="event-list"),
    path("events/<slug:slug>/", EventDetailView.as_view(), name="event-detail"),
]

