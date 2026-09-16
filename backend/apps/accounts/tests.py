import pytest
from rest_framework.test import APIClient
from apps.accounts.models import EmailVerificationCode, User

@pytest.fixture
def client():
    return APIClient()

@pytest.mark.django_db
def test_send_code_blocks_when_consent_not_accepted(client):
    payload = {
        "email": "talaba@qarshidu.uz",
        "purpose": "join",
        "consent_accepted": False,
    }
    response = client.post("/api/v1/auth/send-code/", payload, format="json")
    assert response.status_code == 400
    assert "consent_accepted" in response.data["error"]["fields"]
    assert EmailVerificationCode.objects.filter(email="talaba@qarshidu.uz").count() == 0

@pytest.mark.django_db
def test_send_code_succeeds_with_consent(client):
    payload = {
        "email": "talaba@qarshidu.uz",
        "purpose": "join",
        "consent_accepted": True,
    }
    response = client.post("/api/v1/auth/send-code/", payload, format="json")
    assert response.status_code == 200
    assert response.data["success"] is True

    record = EmailVerificationCode.objects.filter(email="talaba@qarshidu.uz").first()
    assert record is not None
    assert len(record.code) == 6
    assert record.is_verified is False

@pytest.mark.django_db
def test_send_code_rate_limiting(client):
    payload = {
        "email": "limittest@qarshidu.uz",
        "purpose": "join",
        "consent_accepted": True,
    }
    res1 = client.post("/api/v1/auth/send-code/", payload, format="json")
    assert res1.status_code == 200

    # Attempt immediately within 60s
    res2 = client.post("/api/v1/auth/send-code/", payload, format="json")
    assert res2.status_code == 400

@pytest.mark.django_db
def test_verify_code_lifecycle(client):
    email = "lifecycle@qarshidu.uz"
    # Send code
    client.post("/api/v1/auth/send-code/", {"email": email, "purpose": "join", "consent_accepted": True}, format="json")
    record = EmailVerificationCode.objects.get(email=email)

    # Wrong code
    wrong_res = client.post("/api/v1/auth/verify-code/", {"email": email, "code": "000000", "purpose": "join"}, format="json")
    assert wrong_res.status_code == 400
    record.refresh_from_db()
    assert record.attempts == 1

    # Correct code
    correct_res = client.post("/api/v1/auth/verify-code/", {"email": email, "code": record.code, "purpose": "join"}, format="json")
    assert correct_res.status_code == 200
    assert correct_res.data["verified"] is True
    record.refresh_from_db()
    assert record.is_verified is True

    # Reusing verified code fails
    reuse_res = client.post("/api/v1/auth/verify-code/", {"email": email, "code": record.code, "purpose": "join"}, format="json")
    assert reuse_res.status_code == 400

@pytest.mark.django_db
def test_google_auth_allows_login_without_explicit_consent(client):
    # Without explicit consent, google login is permitted (credential validation error if fake)
    res_no_consent = client.post(
        "/api/v1/auth/google/",
        {"credential": "google-user@example.com"},
        format="json",
    )
    # Fails on credential verification, not consent_accepted
    assert res_no_consent.status_code == 400
    assert "credential" in res_no_consent.data["error"]["fields"]
    assert not User.objects.filter(email="google-user@example.com").exists()

@pytest.mark.django_db
def test_google_signed_token_establishes_session(client, settings, monkeypatch):
    settings.GOOGLE_CLIENT_ID = "test.apps.googleusercontent.com"
    nonce = client.get("/api/v1/auth/google/config/").data["nonce"]
    def verify(token, transport, audience):
        assert token == "signed-token"
        assert audience == settings.GOOGLE_CLIENT_ID
        return {"sub": "123", "email": "test@gmail.com", "email_verified": True, "name": "Test Graduate", "nonce": nonce}
    monkeypatch.setattr("apps.accounts.views.id_token.verify_oauth2_token", verify)
    response = client.post("/api/v1/auth/google/", {"credential": "signed-token", "consent_accepted": True}, format="json")
    assert response.status_code == 200
    assert client.get("/api/v1/auth/session/").data["authenticated"]
    assert client.get("/api/v1/alumni/me/").data["data"]["full_name"] == "Test Graduate"
    assert client.post("/api/v1/auth/google/", {"credential": "signed-token", "consent_accepted": True}, format="json").status_code == 400
    assert client.post("/api/v1/auth/logout/").status_code == 204
    assert not client.get("/api/v1/auth/session/").data["authenticated"]

@pytest.mark.django_db
@pytest.mark.parametrize("changes", [{"nonce": "wrong"}, {"email_verified": False}, {"sub": ""}, {"email": "test@example.com"}])
def test_google_bad_claims_rejected(client, settings, monkeypatch, changes):
    settings.GOOGLE_CLIENT_ID = "test.apps.googleusercontent.com"
    nonce = client.get("/api/v1/auth/google/config/").data["nonce"]
    monkeypatch.setattr("apps.accounts.views.id_token.verify_oauth2_token", lambda *args: {"sub": "123", "email": "test@gmail.com", "email_verified": True, "nonce": nonce, **changes})
    response = client.post("/api/v1/auth/google/", {"credential": "token", "consent_accepted": True}, format="json")
    assert response.status_code == 400
    assert not User.objects.exists()

@pytest.mark.django_db
def test_google_forged_signature_rejected(client, settings, monkeypatch):
    settings.GOOGLE_CLIENT_ID = "test.apps.googleusercontent.com"
    def reject(*args):
        raise ValueError("Invalid signature")
    monkeypatch.setattr("apps.accounts.views.id_token.verify_oauth2_token", reject)
    response = client.post("/api/v1/auth/google/", {"credential": "forged", "consent_accepted": True}, format="json")
    assert response.status_code == 400
    assert not User.objects.exists()

@pytest.mark.django_db
def test_google_csrf_required():
    response = APIClient(enforce_csrf_checks=True).post("/api/v1/auth/google/", {"credential": "token", "consent_accepted": True}, format="json")
    assert response.status_code == 403

@pytest.mark.django_db
def test_email_failure_not_reported_as_success(client, monkeypatch):
    def fail(*args, **kwargs):
        raise OSError("SMTP unavailable")
    monkeypatch.setattr("apps.accounts.views.send_mail", fail)
    response = client.post("/api/v1/auth/send-code/", {"email": "test@example.com", "consent_accepted": True}, format="json")
    assert response.status_code == 503
    assert not EmailVerificationCode.objects.exists()

@pytest.mark.django_db
def test_verified_join_owns_profile(client):
    from django.utils import timezone
    from datetime import timedelta
    from unittest.mock import patch
    record = EmailVerificationCode.objects.create(email="new@example.com", code="123456", purpose="join", expires_at=timezone.now()+timedelta(minutes=10))
    response = client.post("/api/v1/auth/verify-code/", {"email": record.email, "code": record.code, "purpose": "join"}, format="json")
    assert response.status_code == 200
    with patch("apps.alumni.notifications.notify_new_alumni_confirmed"):
        response = client.post("/api/v1/alumni/submissions/", {"full_name": "New Graduate", "contact_email": record.email, "graduation_year": 2015, "consent_accepted": True}, format="json")
    assert response.status_code == 201
    assert client.get("/api/v1/auth/session/").data["authenticated"]
    assert client.get("/api/v1/alumni/me/").data["data"]["full_name"] == "New Graduate"
