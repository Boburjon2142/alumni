import pytest
from django.core.management import call_command
from apps.accounts.models import User
from apps.editorial.models import AlumniInterview
from .models import AlumniProfile, AlumniRecognition


@pytest.mark.django_db
def test_public_snapshot_is_repeatable_and_preserves_accounts(settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path / "media"
    user = User.objects.create_user(email="snapshot-test@example.test", password="KeepMe123!")
    profile = AlumniProfile.objects.create(slug="xolmurodov-abdulhamid-erkinovich", full_name="Existing snapshot profile", user=user, contact_email="private@example.test")
    call_command("sync_public_snapshot")
    profile.refresh_from_db()
    assert profile.full_name == "Existing snapshot profile"
    assert AlumniProfile.objects.count() == 1
    call_command("sync_public_snapshot", apply=True)
    counts = (AlumniProfile.objects.count(), AlumniRecognition.objects.count())
    assert counts[0] == 12
    call_command("sync_public_snapshot", apply=True)
    assert (AlumniProfile.objects.count(), AlumniRecognition.objects.count()) == counts
    profile.refresh_from_db()
    user.refresh_from_db()
    assert profile.user_id == user.pk
    assert profile.contact_email == "private@example.test"
    assert user.check_password("KeepMe123!")
    assert not AlumniInterview.objects.get(slug="panjiyev-maqsud-aliqulovich-bilan-suhbat").is_published
