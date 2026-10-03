import pytest
from django.core.cache import cache
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.editorial.models import News
from apps.feedback.models import Feedback


@pytest.fixture
def client(db):
    client = APIClient()
    client.force_authenticate(User.objects.create_superuser(email="management@example.com", password="Test123!"))
    cache.clear()
    yield client
    cache.clear()


def test_news_crud_publication_and_validation(client):
    payload = {"title_uz": "Sinov yangilik", "summary_uz": "Qisqa tavsif", "content_uz": "", "is_published": False}
    response = client.post("/api/v1/admin/news/", payload, format="json")
    assert response.status_code == 201, response.data
    identifier = response.data["id"]
    endpoint = f"/api/v1/admin/news/{identifier}/"
    assert response.data["published_at"] is None
    public = APIClient()
    assert public.get("/api/v1/news/").status_code == 200
    duplicate = client.post("/api/v1/admin/news/", payload, format="json")
    assert duplicate.status_code == 201
    assert duplicate.data["slug"] != response.data["slug"]
    published = client.put(endpoint, {"is_published": True}, format="json")
    assert published.status_code == 200 and published.data["published_at"]
    refreshed = public.get("/api/v1/news/")
    assert refreshed["X-Cache-Lookup"] == "MISS"
    assert identifier in {item["id"] for item in refreshed.data["data"]}
    draft = client.put(endpoint, {"is_published": "false"}, format="json")
    assert draft.status_code == 200 and draft.data["is_published"] is False
    assert draft.data["published_at"] is None
    hidden = public.get("/api/v1/news/")
    assert hidden["X-Cache-Lookup"] == "MISS"
    assert identifier not in {item["id"] for item in hidden.data["data"]}
    invalid = client.put(endpoint, {"category": "invalid", "title_uz": "Changed"}, format="json")
    assert invalid.status_code == 400
    assert News.objects.get(pk=identifier).title_uz == payload["title_uz"]
    assert client.put(endpoint, {"cover_image_url": "javascript:invalid"}, format="json").status_code == 400
    assert client.post("/api/v1/admin/news/", {"title_uz": None}, format="json").status_code == 400
    assert client.delete(endpoint).status_code == 204
    assert client.get(endpoint).status_code == 404


def test_news_and_feedback_pagination_filters(client):
    for index in range(21):
        News.objects.create(title_uz=f"Yangilik {index}", slug=f"news-{index}", summary_uz="Summary")
        Feedback.objects.create(name=f"Sender {index}", message="Message", type="question")
    for endpoint in ("/api/v1/admin/news/", "/api/v1/admin/feedback/"):
        first = client.get(endpoint)
        second = client.get(endpoint, {"page": 2})
        assert first.data["count"] == 21
        assert len(first.data["results"]) == 20 and len(second.data["results"]) == 1
        assert not {item["id"] for item in first.data["results"]} & {item["id"] for item in second.data["results"]}
    assert client.get("/api/v1/admin/news/", {"search": "Yangilik 20"}).data["count"] == 1
    assert client.get("/api/v1/admin/feedback/", {"type": "proposal"}).data["count"] == 0


def test_feedback_status_is_persisted_and_invalid_status_rejected(client):
    feedback = Feedback.objects.create(name="Test sender", message="Test message")
    endpoint = f"/api/v1/admin/feedback/{feedback.pk}/"
    response = client.patch(endpoint, {"status": "resolved"}, format="json")
    assert response.status_code == 200 and response.data["status"] == "resolved"
    feedback.refresh_from_db()
    assert feedback.reviewed_at and feedback.reviewed_by == "management@example.com"
    assert client.patch(endpoint, {"status": "invalid"}, format="json").status_code == 400
    feedback.refresh_from_db()
    assert feedback.status == "resolved"
    assert client.get("/api/v1/admin/feedback/", {"status": "new"}).data["count"] == 0
    assert client.delete(endpoint).status_code == 204


def test_management_requires_admin(db):
    anonymous = APIClient()
    for endpoint in ("/api/v1/admin/news/", "/api/v1/admin/feedback/", "/api/v1/admin/recognitions/"):
        assert anonymous.get(endpoint).status_code in (401, 403)


def test_recognition_crud_validates_slug_and_keeps_changes(client):
    endpoint = "/api/v1/admin/recognitions/"
    payload = {"name": "Yangi mukofot", "slug": "yangi-mukofot", "annual_quota": 3, "is_active": True}
    created = client.post(endpoint, payload, format="json")
    assert created.status_code == 201, created.data
    detail = f"{endpoint}{created.data['id']}/"
    assert client.post(endpoint, payload, format="json").status_code == 400
    assert client.put(detail, {"annual_quota": -1}, format="json").status_code == 400
    edited = client.put(detail, {"name": "Tahrirlangan mukofot", "is_active": False}, format="json")
    assert edited.status_code == 200 and edited.data["is_active"] is False
    assert client.get(detail).data["name"] == "Tahrirlangan mukofot"
    assert client.delete(detail).status_code == 204
    assert client.get(detail).status_code == 404
