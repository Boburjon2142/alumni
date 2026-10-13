import pytest
from datetime import date

from .models import AlumniProfile, AlumniRecognition, RecognitionTitle
from .serializers import PublicAlumniListSerializer, PublicAlumniDetailSerializer


@pytest.mark.django_db
@pytest.mark.parametrize("count", [0, 1, 2, 3])
def test_card_selection_caps_honors_without_truncating_profile(count):
    profile = AlumniProfile.objects.create(full_name="Card Test Member")
    for index in range(count):
        title = RecognitionTitle.objects.create(name=f"Honor {index}", slug=f"card-{index}", order=index)
        AlumniRecognition.objects.create(alumnus=profile, title=title, status="approved")
    draft = RecognitionTitle.objects.create(name="Draft", slug="card-draft", order=0)
    AlumniRecognition.objects.create(alumnus=profile, title=draft, status="draft")
    for serializer in (PublicAlumniListSerializer, PublicAlumniDetailSerializer):
        data = serializer(profile).data
        assert len(data["card_honors"]) == min(count, 1)
        assert len(data["recognitions"]) == count
        if count:
            assert data["card_honors"][0]["slug"] == f"card-{count - 1}"


@pytest.mark.django_db
@pytest.mark.parametrize("serializer", [PublicAlumniListSerializer, PublicAlumniDetailSerializer])
def test_latest_awarded_date_wins_over_title_order_and_ignores_revoked(serializer):
    profile = AlumniProfile.objects.create(full_name="Latest Award Member")
    newest = RecognitionTitle.objects.create(name="Newest", slug="latest", order=99)
    AlumniRecognition.objects.create(alumnus=profile, title=newest, status="approved", awarded_at=date(2025, 6, 1))
    older = RecognitionTitle.objects.create(name="Older", slug="older", order=0)
    AlumniRecognition.objects.create(alumnus=profile, title=older, status="approved", awarded_at=date(2024, 6, 1))
    revoked = RecognitionTitle.objects.create(name="Revoked", slug="revoked")
    AlumniRecognition.objects.create(alumnus=profile, title=revoked, status="revoked", awarded_at=date(2026, 6, 1))
    data = serializer(profile).data
    assert [r["slug"] for r in data["card_honors"]] == ["latest"]
    assert len(data["recognitions"]) == 2


@pytest.mark.django_db
@pytest.mark.parametrize("serializer", [PublicAlumniListSerializer, PublicAlumniDetailSerializer])
def test_card_selection_uses_year_when_awarded_date_is_missing(serializer):
    profile = AlumniProfile.objects.create(full_name="Award Year Member")
    latest = RecognitionTitle.objects.create(name="Latest year", slug="latest-year", order=99)
    AlumniRecognition.objects.create(alumnus=profile, title=latest, status="approved", year=2025)
    older = RecognitionTitle.objects.create(name="Older year", slug="older-year", order=0)
    AlumniRecognition.objects.create(alumnus=profile, title=older, status="approved", year=2024)
    assert serializer(profile).data["card_honors"][0]["slug"] == "latest-year"
