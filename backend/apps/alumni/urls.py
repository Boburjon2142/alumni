from django.urls import path
from .telegram_views import TelegramWebhookView
from .views import (
    AlumniConfirmView,
    AlumniDetailView,
    AlumniListView,
    AlumniSubmissionCreateView,
    FeaturedListView,
    GraduationGroupDetailView,
    GraduationGroupListView,
    GraduationYearRequestCreateView,
    MeView,
)

urlpatterns = [
    path("alumni/submissions/", AlumniSubmissionCreateView.as_view(), name="alumni-submissions"),
    path("alumni/submissions", AlumniSubmissionCreateView.as_view()),
    path("alumni/groups/", GraduationGroupListView.as_view(), name="alumni-groups"),
    path("alumni/groups/<int:year>/", GraduationGroupDetailView.as_view(), name="alumni-group-detail"),
    path("alumni/me/graduation-year-request/", GraduationYearRequestCreateView.as_view(), name="alumni-me-graduation-request"),
    path("alumni/me/", MeView.as_view(), name="alumni-me"),
    path("alumni/", AlumniListView.as_view(), name="alumni-list"),
    path("alumni/<slug:slug>/confirm/", AlumniConfirmView.as_view(), name="alumni-confirm"),
    path("alumni/<slug:slug>/", AlumniDetailView.as_view(), name="alumni-detail"),
    path("featured-alumni/", FeaturedListView.as_view(), name="featured-alumni"),
    path("telegram/webhook/", TelegramWebhookView.as_view(), name="telegram-webhook"),
    path("telegram/webhook", TelegramWebhookView.as_view()),
]


