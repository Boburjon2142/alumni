import pytest
from rest_framework.test import APIClient
from .models import AlumniProfile, AlumniRecognition, RecognitionTitle


@pytest.mark.django_db
def test_recognized_directory_includes_awards_without_impact_points():
    title = RecognitionTitle.objects.create(name="Ibrat", slug="ibrat")
    second = RecognitionTitle.objects.create(name="Ziyo mash’ali", slug="ziyo-mashali")
    awarded = AlumniProfile.objects.create(full_name="Awarded", slug="awarded", is_published=True, approval_status="approved", industry="Ta’lim")
    AlumniRecognition.objects.create(alumnus=awarded, title=title)
    AlumniRecognition.objects.create(alumnus=awarded, title=second)
    revoked = AlumniProfile.objects.create(full_name="Revoked", slug="revoked", is_published=True, approval_status="approved")
    AlumniRecognition.objects.create(alumnus=revoked, title=title, status="revoked")
    hidden = AlumniProfile.objects.create(full_name="Hidden", slug="hidden")
    AlumniRecognition.objects.create(alumnus=hidden, title=title)
    client = APIClient()
    for query in [{"recognized": "true"}, {"recognized": "true", "category": "mentorship", "industry": "Ta’lim"}]:
        response = client.get("/api/v1/alumni/", query)
        assert response.status_code == 200
        assert response.data["pagination"]["count"] == 1
        assert [p["id"] for p in response.data["data"]] == [awarded.pk]
