from django.urls import path

from .views import AdviceListView, EventDetailView, EventListView, InterviewDetailView, InterviewListView, StoryDetailView, StoryListView

urlpatterns = [
    path("stories/", StoryListView.as_view()),
    path("stories/<slug:slug>/", StoryDetailView.as_view()),
    path("interviews/", InterviewListView.as_view()),
    path("interviews/<slug:slug>/", InterviewDetailView.as_view()),
    path("advice/", AdviceListView.as_view()),
    path("events/", EventListView.as_view()),
    path("events/<slug:slug>/", EventDetailView.as_view()),
]
