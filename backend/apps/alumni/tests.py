import pytest
from datetime import date
from django.core.exceptions import ValidationError
from django.utils import timezone
from rest_framework.test import APIClient
from apps.accounts.models import User
from .models import Achievement, AlumniConsent, AlumniProfile, AlumniSource, FeaturedAlumni

@pytest.fixture
def client():
    return APIClient()

@pytest.fixture
def admin_user(db):
    return User.objects.create_superuser(email="admin@example.com", password="AdminPass123")

@pytest.fixture
def alumni(db):
    user = User.objects.create_user(email="alumni@example.com", password="StrongPass123")
    return AlumniProfile.objects.create(
        user=user,
        full_name="Aziz Rahmonov",
        phone="+998901234567",
        contact_email="aziz.rahmonov@example.com",
        current_activity="Senior Software Engineer — TechCorp",
        graduation_year=2015,
        approval_status=AlumniProfile.ApprovalStatus.APPROVED,
        is_published=True,
        is_featured=True,
        is_honorary=True,
    )

@pytest.mark.django_db
def test_register_ignores_privileged_fields(client):
    response = client.post(
        "/api/v1/auth/register/",
        {"email": "new@example.com", "password": "StrongPass123", "full_name": "New Alumni", "role": "admin"},
        format="json",
    )
    assert response.status_code == 201
    assert User.objects.get(email="new@example.com").role == User.Role.ALUMNI

@pytest.mark.django_db
def test_private_fields_not_exposed(client, alumni):
    response = client.get(f"/api/v1/alumni/{alumni.slug}/")
    assert response.status_code == 200
    assert "phone" not in response.data
    assert "email" not in response.data
    assert "contact_email" not in response.data

@pytest.mark.django_db
def test_directory_is_minimal_and_detail_is_public_safe(client, alumni):
    listed = client.get("/api/v1/alumni/").data["data"][0]
    expected_fields = {
        "id", "slug", "avatar", "image_url", "image_alt", "full_name",
        "position", "current_company", "current_activity", "faculty",
        "specialty", "graduation_year", "is_featured", "is_honorary", "recognitions"
    }
    assert set(listed) == expected_fields
    detail = client.get(f"/api/v1/alumni/{alumni.slug}/")
    assert detail.status_code == 200
    assert "phone" not in detail.data and "email" not in detail.data and "contact_email" not in detail.data
    assert "timeline" in detail.data and "achievements" in detail.data and "sources" in detail.data

@pytest.mark.django_db
def test_anonymous_cannot_edit_and_user_cannot_set_controlled_fields(client, alumni):
    assert client.patch("/api/v1/alumni/me/", {"full_name": "Hacked"}, format="json").status_code in (401, 403)
    client.login(email="alumni@example.com", password="StrongPass123")
    response = client.patch(
        "/api/v1/alumni/me/",
        {"verification_status": "verified", "is_featured": True, "approval_status": "approved"},
        format="json",
    )
    alumni.refresh_from_db()
    assert response.status_code == 200
    assert alumni.verification_status == "unverified"

@pytest.mark.django_db
def test_featured_listing_only_active_public(client, alumni):
    FeaturedAlumni.objects.create(alumni=alumni, title="Backend Engineer", is_active=True)
    assert len(client.get("/api/v1/featured-alumni/").data) == 1
    alumni.is_published = False
    alumni.save()
    assert len(client.get("/api/v1/featured-alumni/").data) == 0

@pytest.mark.django_db
def test_public_cannot_see_draft_alumni(client, alumni):
    alumni.is_published = False
    alumni.save()
    assert client.get(f"/api/v1/alumni/{alumni.slug}/").status_code == 404

@pytest.mark.django_db
def test_search_and_sort_are_bounded(client, alumni):
    assert client.get("/api/v1/alumni/?search=Aziz&ordering=name").data["pagination"]["count"] == 1
    assert client.get(f"/api/v1/alumni/?search={'x' * 101}").status_code == 400

@pytest.mark.django_db
def test_source_requires_https(alumni):
    source = AlumniSource(alumnus=alumni, title="Unsafe", url="javascript:alert(1)")
    with pytest.raises(Exception):
        source.full_clean()

@pytest.mark.django_db
def test_remote_portrait_allows_only_unsplash_cdn(alumni):
    alumni.image_url = "https://example.com/portrait.jpg"
    with pytest.raises(ValidationError):
        alumni.full_clean()
    alumni.image_url = "https://images.unsplash.com/photo-demo?auto=format&w=800"
    alumni.image_source_url = "https://unsplash.com"
    alumni.full_clean()

# ==================== NEW ONBOARDING, CONSENT & GROUP TESTS ====================

def _set_verified_join(client, email):
    from datetime import timedelta
    from django.utils import timezone
    session = client.session
    session["verified_join"] = {
        "email": email.strip().lower(),
        "expires": (timezone.now() + timedelta(minutes=15)).timestamp(),
    }
    session.save()

@pytest.mark.django_db
def test_alumni_submission_creates_pending_profile(client):
    _set_verified_join(client, "nodira@example.uz")
    payload = {
        "full_name": "Nodira Rahimova",
        "graduation_year": 2018,
        "contact_email": "nodira@example.uz",
        "current_activity": "Bosh hisobchi — OOO Agro",
        "bio": "Universitetni imtiyozli diplom bilan bitirganman.",
        "consent_accepted": True,
    }
    response = client.post("/api/v1/alumni/submissions/", payload, format="json")
    assert response.status_code == 201
    assert response.data["success"] is True

    profile = AlumniProfile.objects.get(id=response.data["data"]["id"])
    assert profile.full_name == "Nodira Rahimova"
    assert profile.graduation_year == 2018
    assert profile.contact_email == "nodira@example.uz"
    assert profile.approval_status == AlumniProfile.ApprovalStatus.APPROVED
    assert profile.is_published is True
    assert profile.is_featured is False
    assert profile.is_honorary is False

    # Check consent recorded and audited
    consent = AlumniConsent.objects.get(alumni=profile)
    assert consent.accepted is True
    assert consent.policy_version == "1.0"
    assert consent.accepted_at is not None

@pytest.mark.django_db
def test_submission_fails_without_consent(client):
    payload = {
        "full_name": "Bekzod Aliyev",
        "graduation_year": 2020,
        "contact_email": "bekzod@example.uz",
        "consent_accepted": False,
    }
    response = client.post("/api/v1/alumni/submissions/", payload, format="json")
    assert response.status_code == 400
    fields = response.data.get("error", {}).get("fields", response.data)
    assert "consent_accepted" in fields

@pytest.mark.django_db
def test_submission_rejects_invalid_graduation_year(client):
    payload = {
        "full_name": "Old Alumnus",
        "graduation_year": 1940,
        "contact_email": "old@example.uz",
        "consent_accepted": True,
    }
    response = client.post("/api/v1/alumni/submissions/", payload, format="json")
    assert response.status_code == 400
    fields = response.data.get("error", {}).get("fields", response.data)
    assert "graduation_year" in fields

@pytest.mark.django_db
def test_user_cannot_escalate_privileges_in_submission(client):
    _set_verified_join(client, "hacker@example.uz")
    payload = {
        "full_name": "Hacker Alumnus",
        "graduation_year": 2019,
        "contact_email": "hacker@example.uz",
        "consent_accepted": True,
        "approval_status": "approved",
        "is_featured": True,
        "is_honorary": True,
        "is_published": True,
    }
    response = client.post("/api/v1/alumni/submissions/", payload, format="json")
    assert response.status_code == 201
    profile = AlumniProfile.objects.get(id=response.data["data"]["id"])
    assert profile.approval_status == AlumniProfile.ApprovalStatus.APPROVED
    assert profile.is_featured is False
    assert profile.is_honorary is False
    assert profile.is_published is True

@pytest.mark.django_db
def test_pending_and_rejected_profiles_not_in_public_endpoints(client):
    pending = AlumniProfile.objects.create(
        full_name="Pending Profile",
        graduation_year=2021,
        approval_status=AlumniProfile.ApprovalStatus.PENDING,
        is_published=False,
    )
    rejected = AlumniProfile.objects.create(
        full_name="Rejected Profile",
        graduation_year=2021,
        approval_status=AlumniProfile.ApprovalStatus.REJECTED,
        is_published=False,
    )

    # Cannot view via detail
    assert client.get(f"/api/v1/alumni/{pending.slug}/").status_code == 404
    assert client.get(f"/api/v1/alumni/{rejected.slug}/").status_code == 404

    # Not in public directory
    list_res = client.get("/api/v1/alumni/")
    names = [item["full_name"] for item in list_res.data["data"]]
    assert "Pending Profile" not in names
    assert "Rejected Profile" not in names

@pytest.mark.django_db
def test_graduation_groups_list_and_detail(client):
    AlumniProfile.objects.create(
        full_name="Alumni 2010 A",
        graduation_year=2010,
        approval_status=AlumniProfile.ApprovalStatus.APPROVED,
        is_published=True,
    )
    AlumniProfile.objects.create(
        full_name="Alumni 2010 B",
        graduation_year=2010,
        approval_status=AlumniProfile.ApprovalStatus.APPROVED,
        is_published=True,
    )
    AlumniProfile.objects.create(
        full_name="Alumni 2012 A",
        graduation_year=2012,
        approval_status=AlumniProfile.ApprovalStatus.APPROVED,
        is_published=True,
    )

    # 1. Groups overview
    groups_res = client.get("/api/v1/alumni/groups/")
    assert groups_res.status_code == 200
    groups_data = groups_res.data["data"]
    years = {g["year"]: g["members_count"] for g in groups_data}
    assert years[2010] == 2
    assert years[2012] == 1

    # 2. Group detail for 2010
    detail_2010 = client.get("/api/v1/alumni/groups/2010/")
    assert detail_2010.status_code == 200
    assert detail_2010.data["group"]["total_members"] == 2
    assert len(detail_2010.data["data"]) == 2
    names_2010 = [m["full_name"] for m in detail_2010.data["data"]]
    assert "Alumni 2010 A" in names_2010
    assert "Alumni 2010 B" in names_2010
    assert "Alumni 2012 A" not in names_2010

@pytest.mark.django_db
def test_admin_approval_workflow(admin_user):
    from apps.alumni.admin import AlumniProfileAdmin
    from django.contrib.admin.sites import AdminSite

    profile = AlumniProfile.objects.create(
        full_name="Applicant",
        graduation_year=2016,
        contact_email="applicant@example.uz",
        approval_status=AlumniProfile.ApprovalStatus.PENDING,
        is_published=False,
    )

    admin_instance = AlumniProfileAdmin(AlumniProfile, AdminSite())
    admin_instance.message_user = lambda req, msg: None

    class MockRequest:
        user = admin_user
        def is_authenticated(self): return True

    mock_req = MockRequest()
    mock_req.user = admin_user

    # Approve action
    admin_instance.approve_selected_profiles(mock_req, AlumniProfile.objects.filter(id=profile.id))
    profile.refresh_from_db()
    assert profile.approval_status == AlumniProfile.ApprovalStatus.APPROVED
    assert profile.is_published is True
    assert profile.approved_at is not None
    assert profile.approved_by == admin_user

    # Feature action
    admin_instance.feature_selected_homepage(mock_req, AlumniProfile.objects.filter(id=profile.id))
    profile.refresh_from_db()
    assert profile.is_featured is True

    # Unfeature action
    admin_instance.unfeature_selected_homepage(mock_req, AlumniProfile.objects.filter(id=profile.id))
    profile.refresh_from_db()
    assert profile.is_featured is False

    # Reject action
    admin_instance.reject_selected_profiles(mock_req, AlumniProfile.objects.filter(id=profile.id))
    profile.refresh_from_db()
    assert profile.approval_status == AlumniProfile.ApprovalStatus.REJECTED
    assert profile.is_published is False

@pytest.mark.django_db
def test_submission_with_academic_credentials(client):
    _set_verified_join(client, "rustam.karimov@example.uz")
    payload = {
        "full_name": "Dr. Rustam Karimov",
        "graduation_year": 2005,
        "contact_email": "rustam.karimov@example.uz",
        "academic_degree": "phd",
        "academic_title": "docent",
        "current_activity": "QarshiDU kafedra mudiri",
        "bio": "Kuziyev Oybek Chuliyevich 1979-yil Qashqadaryo viloyati...",
        "consent_accepted": True,
    }
    response = client.post("/api/v1/alumni/submissions/", payload, format="json")
    assert response.status_code == 201
    profile = AlumniProfile.objects.get(id=response.data["data"]["id"])
    assert profile.academic_degree == "phd"
    assert profile.academic_title == "docent"
    assert profile.current_activity == "QarshiDU kafedra mudiri"
    assert profile.contact_email == "rustam.karimov@example.uz"

@pytest.mark.django_db
def test_submission_rejects_invalid_academic_credentials(client):
    payload = {
        "full_name": "Invalid Academic",
        "graduation_year": 2010,
        "contact_email": "invalid@example.uz",
        "academic_degree": "invalid_degree",
        "consent_accepted": True,
    }
    response = client.post("/api/v1/alumni/submissions/", payload, format="json")
    assert response.status_code == 400

@pytest.mark.django_db
def test_public_detail_includes_academic_fields_safely(client):
    profile = AlumniProfile.objects.create(
        full_name="Prof. Olim Fayzullayev",
        slug="olim-fayzullayev",
        graduation_year=1998,
        academic_degree="dsc",
        academic_title="professor",
        contact_email="secret@example.uz",
        approval_status=AlumniProfile.ApprovalStatus.APPROVED,
        is_published=True,
    )
    detail_res = client.get(f"/api/v1/alumni/{profile.slug}/")
    assert detail_res.status_code == 200
    assert detail_res.data["academic_degree"] == "dsc"
    assert detail_res.data["academic_title"] == "professor"
    assert "contact_email" not in detail_res.data

@pytest.mark.django_db
def test_submission_blank_academic_fields_accepted(client):
    _set_verified_join(client, "nodir@example.uz")
    payload = {
        "full_name": "Nodir Salimov",
        "graduation_year": 2012,
        "contact_email": "nodir@example.uz",
        "academic_degree": "",
        "academic_title": "",
        "current_activity": "O‘qituvchi",
        "bio": "2012-yilda tamomlaganman.",
        "consent_accepted": True,
    }
    response = client.post("/api/v1/alumni/submissions/", payload, format="json")
    assert response.status_code == 201
    profile = AlumniProfile.objects.get(id=response.data["data"]["id"])
    assert profile.academic_degree == ""
    assert profile.academic_title == ""

@pytest.mark.django_db
def test_submission_rejects_oversized_biography(client):
    payload = {
        "full_name": "Long Bio Person",
        "graduation_year": 2014,
        "contact_email": "long@example.uz",
        "bio": "A" * 2001,
        "consent_accepted": True,
    }
    response = client.post("/api/v1/alumni/submissions/", payload, format="json")
    assert response.status_code == 400

@pytest.mark.django_db
def test_submission_without_graduation_year_accepted(client):
    _set_verified_join(client, "yilsiz@example.uz")
    payload = {
        "full_name": "Bitiruvchi Yilsiz",
        "contact_email": "yilsiz@example.uz",
        "consent_accepted": True,
    }
    response = client.post("/api/v1/alumni/submissions/", payload, format="json")
    assert response.status_code == 201
    profile = AlumniProfile.objects.get(id=response.data["data"]["id"])
    assert profile.graduation_year is None
    assert profile.full_name == "Bitiruvchi Yilsiz"

@pytest.mark.django_db
def test_graduation_year_can_be_set_once_and_cannot_be_changed(client):
    user = User.objects.create_user(email="newgrad@example.uz", password="Pass123Password")
    profile = AlumniProfile.objects.create(
        user=user,
        full_name="Yangi Bitiruvchi",
        contact_email="newgrad@example.uz",
        graduation_year=None,
    )
    client.login(email="newgrad@example.uz", password="Pass123Password")

    # Initial MeView GET returns is_graduation_year_locked = False
    me_res = client.get("/api/v1/alumni/me/")
    assert me_res.status_code == 200
    assert me_res.data["data"]["graduation_year"] is None
    assert me_res.data["data"]["is_graduation_year_locked"] is False

    # First time: select graduation year 2020 -> succeeds
    patch_res1 = client.patch("/api/v1/alumni/me/", {"graduation_year": 2020}, format="json")
    assert patch_res1.status_code == 200
    assert patch_res1.data["data"]["graduation_year"] == 2020
    assert patch_res1.data["data"]["is_graduation_year_locked"] is True
    profile.refresh_from_db()
    assert profile.graduation_year == 2020

    # Second time: trying to change to 2021 -> fails with 400 validation error
    patch_res2 = client.patch("/api/v1/alumni/me/", {"graduation_year": 2021}, format="json")
    assert patch_res2.status_code == 400
    assert "graduation_year" in patch_res2.data["error"]["fields"]
    profile.refresh_from_db()
    assert profile.graduation_year == 2020

    # Repeating the same year 2020 -> allowed (does not alter)
    patch_res3 = client.patch("/api/v1/alumni/me/", {"graduation_year": 2020, "position": "Yetakchi mutaxassis"}, format="json")
    assert patch_res3.status_code == 200
    profile.refresh_from_db()
    assert profile.position == "Yetakchi mutaxassis"


@pytest.mark.django_db
def test_peer_confirmation_flow(client, alumni, monkeypatch):
    """Boshqa tasdiqlangan bitiruvchi yangi qo'shilgan kutilayotgan bitiruvchini tasdiqlay oladi."""
    telegram_calls = []
    email_calls = []

    monkeypatch.setattr(
        "apps.alumni.notifications.send_telegram_alumni_confirmed_post",
        lambda prof, approver: telegram_calls.append((prof.full_name, approver)),
    )
    monkeypatch.setattr(
        "apps.alumni.notifications.notify_existing_alumni_via_email",
        lambda prof, approver: email_calls.append((prof.full_name, approver)),
    )

    # Yangi kutilayotgan bitiruvchi
    new_user = User.objects.create_user(email="newguy@example.uz", password="Pass123Password")
    pending_profile = AlumniProfile.objects.create(
        user=new_user,
        full_name="Botir Qodirov",
        contact_email="botir@example.uz",
        graduation_year=2021,
        approval_status=AlumniProfile.ApprovalStatus.PENDING,
        is_published=False,
    )

    # 1. Unauthenticated request -> fails 401/403
    unauth_resp = client.post(f"/api/v1/alumni/{pending_profile.slug}/confirm/")
    assert unauth_resp.status_code in [401, 403]

    # 2. Authenticated as an unapproved user -> fails validation
    unapproved_user = User.objects.create_user(email="unapproved@example.uz", password="Pass123Password")
    AlumniProfile.objects.create(
        user=unapproved_user,
        full_name="Tasdiqlanmagan A'zo",
        contact_email="unapproved@example.uz",
        approval_status=AlumniProfile.ApprovalStatus.PENDING,
    )
    client.login(email="unapproved@example.uz", password="Pass123Password")
    fail_resp = client.post(f"/api/v1/alumni/{pending_profile.slug}/confirm/")
    assert fail_resp.status_code == 400

    # 3. Trying to confirm own profile -> fails
    client.login(email="newguy@example.uz", password="Pass123Password")
    self_confirm = client.post(f"/api/v1/alumni/{pending_profile.slug}/confirm/")
    assert self_confirm.status_code == 400

    # 4. Authenticated as approved alumnus -> SUCCESS
    client.login(email="alumni@example.com", password="StrongPass123")
    confirm_resp = client.post(f"/api/v1/alumni/{pending_profile.slug}/confirm/")
    assert confirm_resp.status_code == 200
    assert confirm_resp.data["success"] is True

    pending_profile.refresh_from_db()
    assert pending_profile.approval_status == AlumniProfile.ApprovalStatus.APPROVED
    assert pending_profile.is_published is True
    assert pending_profile.approved_by == alumni.user
    assert pending_profile.approved_at is not None

    # Verify both email and Telegram notification handlers were invoked
    assert len(telegram_calls) == 1
    assert telegram_calls[0][0] == "Botir Qodirov"
    assert telegram_calls[0][1] == "Aziz Rahmonov"

    assert len(email_calls) == 1
    assert email_calls[0][0] == "Botir Qodirov"


@pytest.mark.django_db
def test_telegram_webhook_and_bot_tasdiqlanganlar(client, alumni, monkeypatch):
    """Telegram webhook orqali /start va /tasdiqlanganlar buyruqlari to'g'ri ishlaydi."""
    sent_messages = []
    monkeypatch.setattr(
        "apps.alumni.telegram_bot.send_telegram_raw",
        lambda chat_id, text, markup=None: sent_messages.append((chat_id, text, markup)),
    )

    # 1. /start buyrug'i
    start_payload = {
        "update_id": 1001,
        "message": {
            "message_id": 1,
            "chat": {"id": 12345678},
            "text": "/start",
        },
    }
    resp1 = client.post("/api/v1/telegram/webhook/", start_payload, format="json")
    assert resp1.status_code == 200
    assert resp1.data == {"ok": True}
    assert len(sent_messages) >= 1
    assert "xush kelibsiz" in sent_messages[-1][1].lower()

    # 2. /tasdiqlanganlar buyrug'i
    tasdiqlangan_payload = {
        "update_id": 1002,
        "message": {
            "message_id": 2,
            "chat": {"id": 12345678},
            "text": "/tasdiqlanganlar",
        },
    }
    resp2 = client.post("/api/v1/telegram/webhook/", tasdiqlangan_payload, format="json")
    assert resp2.status_code == 200
    assert "Tasdiqlangan Bitiruvchilar" in sent_messages[-1][1]
    assert alumni.full_name in sent_messages[-1][1]

    # 3. Callback query 'list_approved'
    callback_payload = {
        "update_id": 1003,
        "callback_query": {
            "id": "cb_1",
            "data": "list_approved",
            "message": {"chat": {"id": 12345678}},
        },
    }
    resp3 = client.post("/api/v1/telegram/webhook/", callback_payload, format="json")
    assert resp3.status_code == 200
    assert "Tasdiqlangan Bitiruvchilar" in sent_messages[-1][1]


@pytest.mark.django_db
def test_own_profile_update_with_work_experiences(client, alumni):
    client.login(email="alumni@example.com", password="StrongPass123")

    payload = {
        "full_name": "Aziz Rahmonov Yangilangan",
        "faculty_name": "Matematika va kompyuter fanlari",
        "bio": "Tajribali dasturchi va arxitektor.",
        "industry": "Axborot texnologiyalari (IT)",
        "current_company": "EPAM Systems",
        "position": "Lead Software Engineer",
        "work_experiences": [
            {
                "region": "Toshkent shahri",
                "company": "EPAM Systems",
                "position": "Lead Software Engineer",
                "start_year": 2021,
                "end_year": None,
                "is_current": True,
            },
            {
                "region": "Qashqadaryo viloyati",
                "company": "QarshiDU IT Markazi",
                "position": "Katta dasturchi",
                "start_year": 2017,
                "end_year": 2021,
                "is_current": False,
            },
        ],
    }

    res = client.patch("/api/v1/alumni/me/", payload, format="json")
    assert res.status_code == 200
    assert res.data["data"]["full_name"] == "Aziz Rahmonov Yangilangan"
    assert res.data["data"]["faculty_name"] == "Matematika va kompyuter fanlari"
    assert len(res.data["data"]["work_experiences"]) == 2

    alumni.refresh_from_db()
    assert alumni.work_experiences.count() == 2
    first_exp = alumni.work_experiences.first()
    assert first_exp.company == "EPAM Systems"
    assert first_exp.region == "Toshkent shahri"
    assert first_exp.is_current is True


@pytest.mark.django_db
def test_graduation_year_change_request_workflow(client, alumni, admin_user):
    from apps.alumni.admin import GraduationYearChangeRequestAdmin
    from apps.alumni.models import GraduationYearChangeRequest
    from django.contrib.admin.sites import AdminSite

    client.login(email="alumni@example.com", password="StrongPass123")

    # 1. Submit graduation year change request
    req_payload = {
        "requested_year": 2017,
        "reason": "Diplomda bitirgan yilim 2017 deb ko‘rsatilgan, iltimos to‘g‘rilab bering.",
    }
    res = client.post("/api/v1/alumni/me/graduation-year-request/", req_payload, format="json")
    assert res.status_code == 201
    assert res.data["success"] is True
    assert res.data["data"]["requested_year"] == 2017
    assert res.data["data"]["status"] == "pending"

    # 2. Submitting again while pending -> rejects 400
    res2 = client.post("/api/v1/alumni/me/graduation-year-request/", req_payload, format="json")
    assert res2.status_code == 400

    # 3. Check me endpoint includes pending request
    me_res = client.get("/api/v1/alumni/me/")
    assert me_res.status_code == 200
    assert me_res.data["data"]["pending_graduation_request"] is not None
    assert me_res.data["data"]["pending_graduation_request"]["requested_year"] == 2017

    # 4. Admin approves request
    req_obj = GraduationYearChangeRequest.objects.get(alumnus=alumni)
    admin_inst = GraduationYearChangeRequestAdmin(GraduationYearChangeRequest, AdminSite())
    admin_inst.message_user = lambda req, msg: None

    class MockReq:
        user = admin_user
        def is_authenticated(self): return True

    admin_inst.approve_requests(MockReq(), GraduationYearChangeRequest.objects.filter(id=req_obj.id))

    req_obj.refresh_from_db()
    alumni.refresh_from_db()
    assert req_obj.status == GraduationYearChangeRequest.Status.APPROVED
    assert alumni.graduation_year == 2017


@pytest.mark.django_db
def test_alumni_education_experiences(client, alumni):
    client.login(email="alumni@example.com", password="StrongPass123")

    payload = {
        "full_name": "Aziz Rahmonov",
        "educations": [
            {
                "degree_level": "master",
                "institution": "Qarshi davlat universiteti",
                "faculty": "Axborot texnologiyalari",
                "specialty": "Dasturiy injiniring",
                "start_year": 2015,
                "graduation_year": 2017,
                "order": 1,
            },
            {
                "degree_level": "phd",
                "institution": "O‘zbekiston Fanlar akademiyasi",
                "faculty": "Matematika va kompyuter ilmlari",
                "specialty": "05.01.02 - Tizimli tahlil",
                "start_year": 2018,
                "graduation_year": 2021,
                "order": 2,
            }
        ]
    }

    res = client.patch("/api/v1/alumni/me/", payload, format="json")
    assert res.status_code == 200
    assert len(res.data["data"]["educations"]) == 2
    assert res.data["data"]["educations"][0]["degree_level"] == "master"
    assert res.data["data"]["educations"][1]["degree_level"] == "phd"

    # Check public detail view
    pub_res = client.get(f"/api/v1/alumni/{alumni.slug}/")
    assert pub_res.status_code == 200
    assert len(pub_res.data["educations"]) == 2
    assert pub_res.data["educations"][0]["institution"] == "Qarshi davlat universiteti"

@pytest.mark.django_db
def test_recognition_titles_endpoint_and_filtering(client, alumni):
    from apps.alumni.models import RecognitionTitle, AlumniRecognition

    title1 = RecognitionTitle.objects.create(name="Faxriy ustoz", slug="faxriy-ustoz", icon="🎖️", order=1, is_active=True)
    title2 = RecognitionTitle.objects.create(name="Innovatsiya yetakchisi", slug="innovatsiya-yetakchisi", icon="🚀", order=2, is_active=True)

    # 1. Test recognitions endpoint
    res = client.get("/api/v1/alumni/recognitions/")
    assert res.status_code == 200
    assert len(res.data) == 2
    assert res.data[0]["slug"] == "faxriy-ustoz"

    # 2. Attach recognition to alumni
    AlumniRecognition.objects.create(alumnus=alumni, title=title1, is_active=True)

    # 3. Filter by recognition slug
    match_res = client.get("/api/v1/alumni/?recognition=faxriy-ustoz")
    assert match_res.status_code == 200
    assert match_res.data["pagination"]["count"] == 1
    assert len(match_res.data["data"][0]["recognitions"]) == 1
    assert match_res.data["data"][0]["recognitions"][0]["slug"] == "faxriy-ustoz"

    # 4. Filter by non-matching recognition slug
    nomatch_res = client.get("/api/v1/alumni/?recognition=innovatsiya-yetakchisi")
    assert nomatch_res.status_code == 200
    assert nomatch_res.data["pagination"]["count"] == 0







