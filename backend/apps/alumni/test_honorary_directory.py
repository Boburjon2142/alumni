import pytest
from django.core.cache import cache
from rest_framework.test import APIClient
from apps.alumni.models import AlumniProfile


@pytest.mark.django_db
def test_honorary_directory_excludes_regular_and_featured_graduates():
    cache.clear()
    honorary = AlumniProfile.objects.create(full_name="Honorary member", is_honorary=True,
        approval_status="approved", is_published=True, graduation_year=2025)
    regular = AlumniProfile.objects.create(full_name="New graduate", is_honorary=False,
        is_featured=True, approval_status="approved", is_published=True, graduation_year=2025)
    client = APIClient()
    for parameter in ("honorary", "is_honorary"):
        response = client.get("/api/v1/alumni/", {parameter: "true"})
        assert response.status_code == 200
        assert {item["id"] for item in response.data["data"]} == {honorary.pk}
    response = client.get("/api/v1/alumni/", {"honorary": "false"})
    assert {item["id"] for item in response.data["data"]} == {regular.pk}
    group = client.get("/api/v1/alumni/groups/2025/")
    assert {item["id"] for item in group.data["data"]} == {honorary.pk, regular.pk}
    cache.clear()
