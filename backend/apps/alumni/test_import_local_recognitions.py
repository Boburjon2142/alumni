import json
from pathlib import Path

import pytest
from django.conf import settings
from django.core.management import call_command
from django.core.management.base import CommandError

from .models import AlumniProfile, AlumniRecognition, RecognitionTitle


@pytest.fixture
def snapshot_profiles(db):
    payload = json.loads((Path(settings.BASE_DIR) / "fixtures/local_recognitions_2026-10-13.json").read_text(encoding="utf-8"))
    for slug in {r["alumnus_slug"] for r in payload["assignments"]}:
        AlumniProfile.objects.create(slug=slug, full_name=slug)
    return payload


@pytest.mark.django_db
def test_import_dry_run_writes_nothing(snapshot_profiles):
    before = RecognitionTitle.objects.count()
    call_command("import_local_recognitions")
    assert AlumniRecognition.objects.count() == 0
    assert RecognitionTitle.objects.count() == before


@pytest.mark.django_db
def test_import_is_idempotent(snapshot_profiles):
    call_command("import_local_recognitions", apply=True)
    call_command("import_local_recognitions", apply=True)
    assert AlumniRecognition.objects.count() == len(snapshot_profiles["assignments"])
    assert not AlumniRecognition.objects.exclude(status="approved", is_active=True).exists()


@pytest.mark.django_db
def test_missing_profile_aborts(snapshot_profiles):
    AlumniProfile.objects.first().delete()
    with pytest.raises(CommandError, match="Missing profile"):
        call_command("import_local_recognitions", apply=True)
    assert AlumniRecognition.objects.count() == 0


@pytest.mark.django_db
def test_conflicting_server_assignment_preserved(snapshot_profiles):
    call_command("import_local_recognitions", apply=True)
    award = AlumniRecognition.objects.first()
    award.status = "revoked"
    award.save()
    with pytest.raises(CommandError, match="conflicts"):
        call_command("import_local_recognitions", apply=True)
    award.refresh_from_db()
    assert award.status == "revoked"
    assert AlumniRecognition.objects.count() == len(snapshot_profiles["assignments"])
