from django.urls import path
from .admin_views import (
    AdminAdviceDetailView,
    AdminAdviceListView,
    AdminInterviewDetailView,
    AdminInterviewListView,
    AdminSuccessStoryDetailView,
    AdminSuccessStoryListView,
)
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
    # Admin APIs
    path("admin/stories/", AdminSuccessStoryListView.as_view(), name="admin-stories-list"),
    path("admin/stories/<int:pk>/", AdminSuccessStoryDetailView.as_view(), name="admin-stories-detail"),
    path("admin/interviews/", AdminInterviewListView.as_view(), name="admin-interviews-list"),
    path("admin/interviews/<int:pk>/", AdminInterviewDetailView.as_view(), name="admin-interviews-detail"),
    path("admin/advice/", AdminAdviceListView.as_view(), name="admin-advice-list"),
    path("admin/advice/<int:pk>/", AdminAdviceDetailView.as_view(), name="admin-advice-detail"),

    # Public APIs
    path("advice/", AdviceListView.as_view(), name="advice-list"),
    path("stories/", StoryListView.as_view(), name="story-list"),
    path("stories/<slug:slug>/", StoryDetailView.as_view(), name="story-detail"),
    path("interviews/", InterviewListView.as_view(), name="interview-list"),
    path("interviews/<slug:slug>/", InterviewDetailView.as_view(), name="interview-detail"),
    path("events/", EventListView.as_view(), name="event-list"),
    path("events/<slug:slug>/", EventDetailView.as_view(), name="event-detail"),
]
