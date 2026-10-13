import pytest

from .models import AlumniProfile
from .serializers import OwnAlumniSerializer


@pytest.mark.django_db
def test_primary_graduation_degree_defaults_and_persists():
    profile = AlumniProfile.objects.create(full_name="Graduation Stage Test")
    assert profile.graduation_degree == "bachelor"
    serializer = OwnAlumniSerializer(profile, data={"graduation_degree": "master"}, partial=True)
    assert serializer.is_valid(), serializer.errors
    serializer.save()
    profile.refresh_from_db()
    assert profile.graduation_degree == "master"


@pytest.mark.django_db
@pytest.mark.parametrize("value", [["bachelor", "master"], "invalid"])
def test_primary_graduation_degree_rejects_multiple_or_unknown_values(value):
    profile = AlumniProfile.objects.create(full_name="Graduation Stage Test")
    serializer = OwnAlumniSerializer(profile, data={"graduation_degree": value}, partial=True)
    assert not serializer.is_valid()
    assert "graduation_degree" in serializer.errors
