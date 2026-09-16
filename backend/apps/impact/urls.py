from django.urls import path
from .views import (
    AlumniImpactDetailView,
    ContributionApproveView,
    ContributionListCreateView,
    ContributionRejectView,
    ContributionRevokeView,
    ImpactRankingView,
    MyImpactView,
)

urlpatterns = [
    path("rankings/", ImpactRankingView.as_view(), name="impact-rankings"),
    path("me/", MyImpactView.as_view(), name="my-impact"),
    path("alumni/<str:id_or_slug>/", AlumniImpactDetailView.as_view(), name="alumni-impact-detail"),
    path("contributions/", ContributionListCreateView.as_view(), name="contribution-list-create"),
    path("contributions/<int:pk>/approve/", ContributionApproveView.as_view(), name="contribution-approve"),
    path("contributions/<int:pk>/reject/", ContributionRejectView.as_view(), name="contribution-reject"),
    path("contributions/<int:pk>/revoke/", ContributionRevokeView.as_view(), name="contribution-revoke"),
]
