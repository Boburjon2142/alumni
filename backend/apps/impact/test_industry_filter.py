import pytest
from rest_framework.test import APIClient

from apps.alumni.models import AlumniProfile
from apps.impact.models import ScoreTransaction


@pytest.mark.django_db
def test_ranking_filters_by_industry():
    profiles = [AlumniProfile.objects.create(full_name=f"Industry {index}", slug=f"industry-{index}",
                industry=industry, is_published=True)
                for index, industry in enumerate(["Jurnalistika va OAV", "Oliy ta’lim va ilm-fan"])]
    for profile in profiles:
        ScoreTransaction.objects.create(alumni=profile, category="career", points=100)
    client = APIClient()
    response = client.get("/api/v1/impact/rankings/", {"period": "all", "industry": "Jurnalistika va OAV"})
    assert response.status_code == 200
    assert [row["alumni"]["id"] for row in response.data["data"]] == [profiles[0].pk]
    response = client.get("/api/v1/impact/rankings/", {"period": "all", "industry": ""})
    assert {row["alumni"]["id"] for row in response.data["data"]} == {p.pk for p in profiles}
