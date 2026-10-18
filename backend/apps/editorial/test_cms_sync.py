import pytest
from django.core.cache import cache
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.alumni.models import AlumniProfile
from .models import AlumniAdvice, AlumniInterview, InterviewItem


@pytest.fixture
def cms(db):
    cache.clear()
    admin = APIClient()
    admin.force_authenticate(User.objects.create_superuser(email="cms@example.com", password="test-pass-123"))
    profile = AlumniProfile.objects.create(full_name="CMS Graduate", is_published=True, approval_status="approved")
    yield admin, APIClient(), profile
    cache.clear()


@pytest.mark.parametrize("resource,content", [
    ("interviews", {"intro_uz": "Kirish", "items": [{"question_uz": "Savol", "answer_uz": "Javob"}]}),
    ("stories", {"summary_uz": "Qisqa matn", "sections": [{"kind": "introduction", "content_uz": "Batafsil"}]}),
    ("advice", {"category": "career", "content_uz": "Maslahat"}),
])
def test_admin_public_crud_and_cache_agree(cms, resource, content):
    admin, public, profile = cms
    endpoint = f"/api/v1/admin/{resource}/"
    public_endpoint = f"/api/v1/{resource}/"
    created = admin.post(endpoint, {"alumni_id": profile.pk, "title_uz": "CMS title", "is_published": False, **content}, format="json")
    assert created.status_code == 201, created.data
    pk = created.data["id"]
    assert created.data["alumni_id"] == profile.pk
    assert not created.data["is_published"]
    assert not public.get(public_endpoint).data["data"]
    detail = f"{endpoint}{pk}/"
    published = admin.put(detail, {"is_published": True}, format="json")
    assert published.status_code == 200, published.data
    assert published.data["is_published"] and published.data["published_at"]
    assert public.get(public_endpoint).data["data"][0]["title_uz"] == "CMS title"
    edited = admin.put(detail, {"title_uz": "Changed title"}, format="json")
    assert edited.status_code == 200
    rows = public.get(public_endpoint).data["data"]
    assert rows[0]["title_uz"] == edited.data["title_uz"]
    assert admin.get(endpoint).data["results"][0]["title_uz"] == rows[0]["title_uz"]
    assert admin.put(detail, {"is_published": "false"}, format="json").data["is_published"] is False
    assert not public.get(public_endpoint).data["data"]
    assert admin.delete(detail).status_code == 204
    assert admin.get(detail).status_code == 404


def test_interview_validation_does_not_destroy_saved_content(cms):
    admin, public, profile = cms
    endpoint = "/api/v1/admin/interviews/"
    payload = {"alumni_id": profile.pk, "title_uz": "Interview", "intro_uz": "Intro", "is_published": True}
    assert admin.post(endpoint, {**payload, "items": []}, format="json").status_code == 400
    assert not AlumniInterview.objects.exists()
    created = admin.post(endpoint, {**payload, "items": [{"question_uz": "Question", "answer_uz": "Answer"}]}, format="json")
    detail = f"{endpoint}{created.data['id']}/"
    bad = admin.put(detail, {"title_uz": "Should not save", "items": []}, format="json")
    assert bad.status_code == 400
    assert admin.get(detail).data["title_uz"] == "Interview"
    assert admin.put(detail, {"alumni_id": 999999}, format="json").status_code == 400
    assert admin.put(detail, {"title_uz": ""}, format="json").status_code == 400


def test_interview_edits_keep_advice_source_and_invalidate_both_lists(cms):
    admin, public, profile = cms
    interview = AlumniInterview.objects.create(alumnus=profile, slug="linked", title_uz="Linked", intro_uz="Intro", is_published=True)
    item = InterviewItem.objects.create(interview=interview, question_uz="Question", answer_uz="Old answer")
    advice = AlumniAdvice.objects.create(alumnus=profile, category="career", source_type="interview", source_interview_item=item, is_published=True)
    public.get("/api/v1/advice/")
    public.get("/api/v1/interviews/")
    detail = f"/api/v1/admin/interviews/{interview.pk}/"
    edited = admin.put(detail, {"items": [{"id": item.pk, "question_uz": "Updated question", "answer_uz": "New answer"}]}, format="json")
    assert edited.status_code == 200, edited.data
    advice.refresh_from_db()
    assert advice.source_interview_item_id == item.pk
    assert public.get("/api/v1/advice/").data["data"][0]["content_uz"] == "New answer"
    assert public.get(f"/api/v1/interviews/{interview.slug}/").data["items"][0]["answer_uz"] == "New answer"
    assert admin.put(detail, {"is_published": False, "items": []}, format="json").status_code == 400
    assert admin.delete(detail).status_code == 409


def test_ordinary_user_cannot_manage_editorial(cms):
    _, public, _ = cms
    for resource in ("interviews", "stories", "advice"):
        assert public.get(f"/api/v1/admin/{resource}/").status_code == 403


def test_profile_edit_refreshes_embedded_editorial_data(cms):
    _, public, profile = cms
    AlumniAdvice.objects.create(alumnus=profile, category="career", content_uz="Advice", is_published=True)
    assert public.get("/api/v1/advice/").data["data"][0]["alumnus"]["full_name"] == "CMS Graduate"
    profile.full_name = "Updated graduate"
    profile.save()
    assert public.get("/api/v1/advice/").data["data"][0]["alumnus"]["full_name"] == "Updated graduate"


def test_admin_does_not_report_stale_publication_date_as_published(cms):
    from django.utils import timezone
    admin, public, profile = cms
    interview = AlumniInterview.objects.create(alumnus=profile, slug="stale-date", title_uz="Draft", intro_uz="Intro")
    InterviewItem.objects.create(interview=interview, question_uz="Question", answer_uz="Answer")
    AlumniInterview.objects.filter(pk=interview.pk).update(published_at=timezone.now())
    response = admin.get("/api/v1/admin/interviews/").data["results"][0]
    assert response["is_published"] is False
    assert response["published_at"] is None
    assert not public.get("/api/v1/interviews/").data["data"]
    published = admin.put(f"/api/v1/admin/interviews/{interview.pk}/", {"is_published": True}, format="json")
    assert published.status_code == 200
    assert public.get("/api/v1/interviews/").data["data"][0]["id"] == response["id"]
