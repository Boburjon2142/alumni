import pytest
from django.core.exceptions import ValidationError
from rest_framework.test import APIClient
from apps.accounts.models import User
from .models import AlumniProfile, AlumniSource, FeaturedAlumni

@pytest.fixture
def client(): return APIClient()

@pytest.fixture
def alumni(db):
    user = User.objects.create_user(email="alumni@example.com", password="StrongPass123")
    return AlumniProfile.objects.create(user=user, full_name="Aziz Rahmonov", phone="+998901234567", is_published=True, is_featured=True)

@pytest.mark.django_db
def test_register_ignores_privileged_fields(client):
    response = client.post("/api/v1/auth/register/", {"email":"new@example.com", "password":"StrongPass123", "full_name":"New Alumni", "role":"admin"}, format="json")
    assert response.status_code == 201
    assert User.objects.get(email="new@example.com").role == User.Role.ALUMNI

@pytest.mark.django_db
def test_private_fields_not_exposed(client, alumni):
    response = client.get(f"/api/v1/alumni/{alumni.slug}/")
    assert response.status_code == 200 and "phone" not in response.data and "email" not in response.data

@pytest.mark.django_db
def test_directory_is_minimal_and_detail_is_public_safe(client, alumni):
    listed = client.get("/api/v1/alumni/").data["data"][0]
    assert set(listed) == {"id", "slug", "avatar", "image_url", "image_alt", "full_name", "position", "current_company", "faculty", "specialty", "graduation_year", "is_featured"}
    detail = client.get(f"/api/v1/alumni/{alumni.slug}/")
    assert detail.status_code == 200
    assert "phone" not in detail.data and "email" not in detail.data
    assert "timeline" in detail.data and "achievements" in detail.data and "sources" in detail.data

@pytest.mark.django_db
def test_anonymous_cannot_edit_and_user_cannot_set_controlled_fields(client, alumni):
    assert client.patch("/api/v1/alumni/me/", {"full_name":"Hacked"}, format="json").status_code in (401, 403)
    client.login(email="alumni@example.com", password="StrongPass123")
    response = client.patch("/api/v1/alumni/me/", {"verification_status":"verified", "is_featured":True}, format="json")
    alumni.refresh_from_db()
    assert response.status_code == 200 and alumni.verification_status == "unverified"

@pytest.mark.django_db
def test_featured_listing_only_active_public(client, alumni):
    FeaturedAlumni.objects.create(alumni=alumni, title="Backend Engineer", is_active=True)
    assert len(client.get("/api/v1/featured-alumni/").data) == 1
    alumni.is_published = False; alumni.save()
    assert len(client.get("/api/v1/featured-alumni/").data) == 0

@pytest.mark.django_db
def test_public_cannot_see_draft_alumni(client, alumni):
    alumni.is_published = False; alumni.save()
    assert client.get(f"/api/v1/alumni/{alumni.slug}/").status_code == 404

@pytest.mark.django_db
def test_search_and_sort_are_bounded(client, alumni):
    assert client.get("/api/v1/alumni/?search=Aziz&ordering=name").data["pagination"]["count"] == 1
    assert client.get(f"/api/v1/alumni/?search={'x' * 101}").status_code == 400

@pytest.mark.django_db
def test_source_requires_https(alumni):
    source = AlumniSource(alumnus=alumni, title="Unsafe", url="javascript:alert(1)")
    with pytest.raises(Exception): source.full_clean()

@pytest.mark.django_db
def test_remote_portrait_allows_only_unsplash_cdn(alumni):
    alumni.image_url = "https://example.com/portrait.jpg"
    with pytest.raises(ValidationError):
        alumni.full_clean()
    alumni.image_url = "https://images.unsplash.com/photo-demo?auto=format&w=800"
    alumni.image_source_url = "https://unsplash.com"
    alumni.full_clean()
