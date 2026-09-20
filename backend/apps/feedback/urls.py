from django.urls import path
from .admin_views import AdminFeedbackDetailView, AdminFeedbackListView
from .views import FeedbackCreateView

urlpatterns = [
    # Admin APIs
    path("admin/feedback/", AdminFeedbackListView.as_view(), name="admin-feedback-list"),
    path("admin/feedback/<int:pk>/", AdminFeedbackDetailView.as_view(), name="admin-feedback-detail"),

    # Public APIs
    path("", FeedbackCreateView.as_view(), name="feedback-create-root"),
    path("feedback/", FeedbackCreateView.as_view(), name="feedback-create"),
]
