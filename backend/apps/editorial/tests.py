from datetime import timedelta

import pytest
from django.core.exceptions import ValidationError
from django.core.management import call_command
from django.core.management.base import CommandError
from django.utils import timezone
from rest_framework.test import APIClient

from apps.alumni.models import AlumniProfile
from .models import AlumniAdvice, AlumniInterview, Event, InterviewItem, StorySection, SuccessStory


@pytest.fixture
def client(): return APIClient()


@pytest.fixture
def alumnus(db): return AlumniProfile.objects.create(full_name="Dilnoza Karimova", is_published=True)


@pytest.mark.django_db
def test_published_story_visible_and_draft_hidden(client, alumnus):
    published = SuccessStory.objects.create(alumnus=alumnus, slug="published-story", title_uz="Yo‘l", summary_uz="Hikoya", is_published=True)
    SuccessStory.objects.create(alumnus=alumnus, slug="draft-story", title_uz="Draft", summary_uz="Draft")
    StorySection.objects.create(story=published, kind="introduction", content_uz="Boshlanish", order=1)
    response = client.get("/api/v1/stories/")
    assert response.status_code == 200 and response.data["pagination"]["count"] == 1
    assert client.get("/api/v1/stories/draft-story/").status_code == 404


@pytest.mark.django_db
def test_interview_requires_complete_items_to_be_public(client, alumnus):
    interview = AlumniInterview.objects.create(alumnus=alumnus, slug="interview", title_uz="Suhbat", intro_uz="Kirish", is_published=True)
    assert client.get("/api/v1/interviews/").data["pagination"]["count"] == 0
    InterviewItem.objects.create(interview=interview, question_uz="Savol?", answer_uz="Javob", order=1)
    assert client.get("/api/v1/interviews/").data["pagination"]["count"] == 1


@pytest.mark.django_db
def test_interview_items_are_ordered(client, alumnus):
    interview = AlumniInterview.objects.create(alumnus=alumnus, slug="ordered", title_uz="Suhbat", intro_uz="Kirish", is_published=True)
    InterviewItem.objects.create(interview=interview, question_uz="Ikkinchi", answer_uz="B", order=2)
    InterviewItem.objects.create(interview=interview, question_uz="Birinchi", answer_uz="A", order=1)
    data = client.get("/api/v1/interviews/ordered/").data
    assert [item["order"] for item in data["items"]] == [1, 2]


@pytest.mark.django_db
def test_advice_provenance_must_match_alumnus(alumnus):
    other = AlumniProfile.objects.create(full_name="Other", is_published=True)
    interview = AlumniInterview.objects.create(alumnus=other, slug="other", title_uz="Suhbat", intro_uz="Kirish")
    item = InterviewItem.objects.create(interview=interview, question_uz="Savol", answer_uz="Javob")
    advice = AlumniAdvice(alumnus=alumnus, category="career", source_type="interview", source_interview_item=item)
    with pytest.raises(ValidationError): advice.full_clean()


@pytest.mark.django_db
def test_event_status_timezone_and_draft_visibility(client):
    now = timezone.now()
    upcoming = Event.objects.create(slug="upcoming", title_uz="Tadbir", summary_uz="Yaqinda", description_uz="Tavsif", event_type="conference", start_at=now + timedelta(days=2), location_type="offline", location_uz="QarDU", is_published=True)
    Event.objects.create(slug="draft", title_uz="Draft", summary_uz="Draft", description_uz="Draft", event_type="conference", start_at=now + timedelta(days=3), location_type="offline", location_uz="QarDU")
    assert upcoming.computed_status == "upcoming"
    response = client.get("/api/v1/events/?status=upcoming")
    assert response.data["pagination"]["count"] == 1
    assert client.get("/api/v1/events/draft/").status_code == 404


@pytest.mark.django_db
def test_event_rejects_unsafe_url():
    event = Event(slug="unsafe", title_uz="Unsafe", summary_uz="Unsafe", description_uz="Unsafe", event_type="conference", start_at=timezone.now() + timedelta(days=1), location_type="online", location_uz="Online", external_url="javascript:alert(1)")
    with pytest.raises(ValidationError): event.full_clean()


@pytest.mark.django_db(transaction=True)
def test_demo_seed_requires_explicit_confirmation():
    with pytest.raises(CommandError):
        call_command("seed_demo_data")
