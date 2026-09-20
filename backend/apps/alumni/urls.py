from django.urls import path
from .admin_views import (
    AdminAlumniDetailView,
    AdminAlumniListView,
    AdminAlumniModerationActionView,
    AdminDashboardStatsView,
    AdminGraduationYearRequestActionView,
    AdminGraduationYearRequestListView,
    AdminRecognitionTitleDetailView,
    AdminRecognitionTitleListView,
)
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
    RecognitionTitleListView,
)

urlpatterns = [
    # Admin APIs
    path("admin/stats/", AdminDashboardStatsView.as_view(), name="admin-stats"),
    path("admin/alumni/", AdminAlumniListView.as_view(), name="admin-alumni-list"),
    path("admin/alumni/<str:identifier>/", AdminAlumniDetailView.as_view(), name="admin-alumni-detail"),
    path("admin/alumni/<int:pk>/action/", AdminAlumniModerationActionView.as_view(), name="admin-alumni-action"),
    path("admin/recognitions/", AdminRecognitionTitleListView.as_view(), name="admin-recognitions-list"),
    path("admin/recognitions/<int:pk>/", AdminRecognitionTitleDetailView.as_view(), name="admin-recognitions-detail"),
    path("admin/requests/graduation-year/", AdminGraduationYearRequestListView.as_view(), name="admin-year-requests-list"),
    path("admin/requests/graduation-year/<int:pk>/action/", AdminGraduationYearRequestActionView.as_view(), name="admin-year-requests-action"),

    # Public APIs
    path("alumni/recognitions/", RecognitionTitleListView.as_view(), name="recognition-title-list"),
    path("alumni/recognitions", RecognitionTitleListView.as_view()),
    path("recognitions/", RecognitionTitleListView.as_view(), name="recognition-title-list-alt"),
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
