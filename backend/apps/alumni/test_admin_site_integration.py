import pytest
from django.core.cache import cache
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.alumni.models import AlumniProfile, AlumniRecognition, RecognitionTitle


@pytest.fixture
def admin_client(db):
    client = APIClient()
    client.force_authenticate(User.objects.create_superuser(
        email="site-admin@example.com", password="IntegrationTest123"
    ))
    cache.clear()
    yield client
    cache.clear()


@pytest.mark.django_db
def test_admin_lists_site_profiles_with_actual_moderation_state(admin_client):
    profile = AlumniProfile.objects.create(
        full_name="Admin integration profile", contact_email="alumnus@example.com",
        phone="+998901234567", approval_status="pending", is_published=False,
    )
    response = admin_client.get("/api/v1/admin/alumni/", {"search": profile.full_name})
    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["email"] == profile.contact_email
    assert response.data["results"][0]["is_published"] is False
    detail = admin_client.get(f"/api/v1/admin/alumni/{profile.slug}/")
    assert detail.data["phone"] == profile.phone
    assert detail.data["is_published"] is False
    public = APIClient().get(f"/api/v1/alumni/{profile.slug}/")
    assert public.status_code == 404


@pytest.mark.django_db
def test_admin_moderation_updates_public_directory_and_groups(admin_client):
    profile = AlumniProfile.objects.create(full_name="Moderated member", graduation_year=2025)
    public = APIClient()
    assert public.get("/api/v1/alumni/").data["data"] == []
    assert public.get("/api/v1/alumni/groups/").data["data"] == []
    action_url = f"/api/v1/admin/alumni/{profile.pk}/action/"
    assert admin_client.post(action_url, {"action": "approve"}, format="json").status_code == 200
    assert public.get("/api/v1/alumni/").data["data"][0]["id"] == profile.pk
    assert public.get("/api/v1/alumni/groups/").data["data"][0]["members_count"] == 1
    assert admin_client.post(action_url, {"action": "toggle_publish"}, format="json").status_code == 200
    assert public.get("/api/v1/alumni/").data["data"] == []
    assert public.get("/api/v1/alumni/groups/").data["data"] == []


@pytest.mark.django_db
def test_recognition_updates_invalidate_public_responses(admin_client):
    profile = AlumniProfile.objects.create(full_name="Recognition member", approval_status="approved", is_published=True)
    title = RecognitionTitle.objects.create(name="Integration award", slug="integration-award")
    public = APIClient()
    assert public.get("/api/v1/alumni/").data["data"][0]["recognitions"] == []
    recognition = AlumniRecognition.objects.create(alumnus=profile, title=title, status="approved")
    assert public.get("/api/v1/alumni/").data["data"][0]["recognitions"][0]["name"] == title.name
    recognition.delete()
    assert public.get("/api/v1/alumni/").data["data"][0]["recognitions"] == []


@pytest.mark.django_db
def test_non_admin_cannot_read_admin_contact_data():
    client = APIClient()
    client.force_authenticate(User.objects.create_user(email="regular@example.com"))
    assert client.get("/api/v1/admin/alumni/").status_code == 403


@pytest.mark.django_db
def test_feedback_admin_route_manages_the_same_site_messages(admin_client):
    from apps.feedback.models import Feedback
    feedback = Feedback.objects.create(type="proposal", name="Site visitor", message="Integration feedback")
    response = admin_client.get("/api/v1/admin/feedback/")
    assert response.status_code == 200
    assert response.data["results"][0]["id"] == feedback.pk
    response = admin_client.patch(f"/api/v1/admin/feedback/{feedback.pk}/", {"status": "resolved"}, format="json")
    assert response.status_code == 200
    feedback.refresh_from_db()
    assert feedback.status == "resolved"
    assert APIClient().get("/api/v1/admin/feedback/").status_code == 403


@pytest.mark.django_db
def test_approved_contribution_refreshes_public_rankings(admin_client):
    from apps.impact.models import Contribution
    profile = AlumniProfile.objects.create(full_name="Impact member", approval_status="approved", is_published=True)
    contribution = Contribution.objects.create(alumni=profile, category="career", action_type="alumni_hired", title="Career support")
    public = APIClient()
    before = public.get("/api/v1/impact/rankings/?period=all")
    assert before.status_code == 200
    response = admin_client.post(f"/api/v1/impact/contributions/{contribution.pk}/approve/", {}, format="json")
    assert response.status_code == 200
    after = public.get("/api/v1/impact/rankings/?period=all")
    assert after["X-Cache-Lookup"] == "MISS"
    assert after.data != before.data


@pytest.mark.django_db
def test_profile_save_keeps_existing_award_metadata_and_revokes_removed_awards(admin_client):
    profile = AlumniProfile.objects.create(full_name="Award history member", approval_status="approved", is_published=True)
    title = RecognitionTitle.objects.create(name="History award", slug="history-award", has_levels=True)
    award = AlumniRecognition.objects.create(alumnus=profile, title=title, level="gold", year=2025, justification="Original award")
    url = f"/api/v1/admin/alumni/{profile.pk}/"
    response = admin_client.put(url, {"is_featured": True, "recognition_ids": [title.pk]}, format="json")
    assert response.status_code == 200
    award.refresh_from_db()
    assert award.level == "gold" and award.year == 2025 and award.justification == "Original award"
    assert admin_client.put(url, {"recognition_ids": []}, format="json").status_code == 200
    award.refresh_from_db()
    assert award.status == "revoked" and not award.is_active


@pytest.mark.django_db
def test_failed_award_save_rolls_back_moderation_changes(admin_client):
    profile = AlumniProfile.objects.create(full_name="Atomic save member", is_published=False)
    response = admin_client.put(f"/api/v1/admin/alumni/{profile.pk}/", {"is_published": True, "recognition_ids": [999999]}, format="json")
    assert response.status_code == 400
    profile.refresh_from_db()
    assert profile.is_published is False
