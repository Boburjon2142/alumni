import pytest
from django.core.exceptions import ValidationError
from django.core.management import call_command
from django.core.management.base import CommandError
from rest_framework.test import APIClient

from apps.alumni.models import AlumniProfile
from .models import AlumniAdvice, AlumniInterview, InterviewItem

@pytest.fixture
def client(): return APIClient()

@pytest.fixture
def alumnus(db): return AlumniProfile.objects.create(full_name="Dilnoza Karimova", is_published=True)

@pytest.mark.django_db
def test_advice_list_endpoint_and_category_filter(client, alumnus):
    AlumniAdvice.objects.create(alumnus=alumnus, category="career", content_uz="Mehnat qiling.", is_published=True)
    AlumniAdvice.objects.create(alumnus=alumnus, category="study", content_uz="Ilm o‘rganing.", is_published=True)
    AlumniAdvice.objects.create(alumnus=alumnus, category="career", content_uz="Draft advice", is_published=False)
    
    response = client.get("/api/v1/advice/")
    assert response.status_code == 200 and response.data["pagination"]["count"] == 2
    
    cat_response = client.get("/api/v1/advice/?category=career")
    assert cat_response.status_code == 200 and cat_response.data["pagination"]["count"] == 1

@pytest.mark.django_db
def test_advice_provenance_must_match_alumnus(alumnus):
    other = AlumniProfile.objects.create(full_name="Other", is_published=True)
    interview = AlumniInterview.objects.create(alumnus=other, slug="other", title_uz="Suhbat", intro_uz="Kirish")
    item = InterviewItem.objects.create(interview=interview, question_uz="Savol", answer_uz="Javob")
    advice = AlumniAdvice(alumnus=alumnus, category="career", source_type="interview", source_interview_item=item)
    with pytest.raises(ValidationError): advice.full_clean()

@pytest.mark.django_db(transaction=True)
def test_demo_seed_requires_explicit_confirmation():
    with pytest.raises(CommandError):
        call_command("seed_demo_data")
