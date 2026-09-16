import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.utils import timezone
from apps.accounts.models import User
from apps.alumni.models import AlumniProfile
from apps.impact.models import Achievement, Contribution, ScoreTransaction
from apps.impact.services.scoring import verify_contribution

ACHIEVEMENTS_DATA = [
    {
        "code": "career-builder",
        "name_uz": "Karyera homiysi (Career Builder)",
        "name_en": "Career Builder",
        "name_ru": "Наставник карьеры",
        "description_uz": "Bitiruvchilarni ishga qabul qilgan yoki amaliyot bilan ta’minlagan e’tirofli bitiruvchi.",
        "description_en": "Recognized for providing job placements or internships to fellow alumni.",
        "description_ru": "За вклад в трудоустройство и стажировку выпускников.",
        "category": Contribution.Category.CAREER,
        "threshold": 1,
        "icon_key": "briefcase",
    },
    {
        "code": "mentor-of-honor",
        "name_uz": "Faxriy mentor (Distinguished Mentor)",
        "name_en": "Distinguished Mentor",
        "name_ru": "Почётный ментор",
        "description_uz": "Talabalar va yosh mutaxassislarga tasdiqlangan ustozlik ko‘rsatgan bitiruvchi.",
        "description_en": "Recognized for verified mentoring and guiding next-generation talents.",
        "description_ru": "За наставничество и передачу опыта молодому поколению.",
        "category": Contribution.Category.MENTORSHIP,
        "threshold": 1,
        "icon_key": "users",
    },
    {
        "code": "university-patron",
        "name_uz": "Universitet homiysi (University Patron)",
        "name_en": "University Patron",
        "name_ru": "Покровитель университета",
        "description_uz": "QarshiDU ta’limi, ilmiy laboratoriyalari va infratuzilmasiga hissa qo‘shgan bitiruvchi.",
        "description_en": "Recognized for supporting university projects, laboratories, or scholarships.",
        "description_ru": "За поддержку проектов, лабораторий и стипендий университета.",
        "category": Contribution.Category.UNIVERSITY,
        "threshold": 1,
        "icon_key": "building",
    },
    {
        "code": "community-leader",
        "name_uz": "Hamjamiyat yetakchisi (Community Leader)",
        "name_en": "Community Leader",
        "name_ru": "Лидер сообщества",
        "description_uz": "Alumni tadbirlari, mahorat darslari va ochiq ma’ruzalarda faol ishtirok etgan bitiruvchi.",
        "description_en": "Recognized for organizing community events and delivering masterclasses.",
        "description_ru": "За проведение мастер-классов и активное участие в жизни сообщества.",
        "category": Contribution.Category.COMMUNITY,
        "threshold": 1,
        "icon_key": "sparkles",
    },
]

DEMO_CONTRIBUTIONS = [
    {
        "alumnus_slug": "allayev-dolli-hakimovich",
        "category": Contribution.Category.UNIVERSITY,
        "action_type": Contribution.ActionType.EQUIPMENT_SUPPORT,
        "title": "Kimyo-biologiya fakultetiga zamonaviy ilmiy uskunalar taqdim etildi",
        "description": "Talabalar va yosh tadqiqotchilarning tajribalari uchun maxsus laboratoriya o‘lchov uskunalari ajratildi.",
        "metadata": {"equipment_type": "Laboratoriya spektrometri"},
    },
    {
        "alumnus_slug": "allayev-dolli-hakimovich",
        "category": Contribution.Category.MENTORSHIP,
        "action_type": Contribution.ActionType.MENTEE_OUTCOME_VERIFIED,
        "title": "2 nafar yosh tadqiqotchiga ilmiy rahbarlik va natija",
        "description": "Energetika yo‘nalishidagi yosh olimlarning dissertatsiya ishlariga ilmiy maslahat va qo‘llab-quvvatlash ko‘rsatildi.",
        "metadata": {"mentees_count": 2},
    },
    {
        "alumnus_slug": "muratov-shuxrat-kaxarovich",
        "category": Contribution.Category.CAREER,
        "action_type": Contribution.ActionType.ALUMNI_HIRED,
        "title": "“Alp Texno Servis” korxonasiga 3 nafar QarshiDU bitiruvchisi ishga qabul qilindi",
        "description": "Axborot texnologiyalari va muhandislik yo‘nalishi bitiruvchilari muhandis-dasturchi lavozimiga joylashtirildi.",
        "metadata": {"hired_count": 3},
    },
    {
        "alumnus_slug": "muratov-shuxrat-kaxarovich",
        "category": Contribution.Category.UNIVERSITY,
        "action_type": Contribution.ActionType.FINANCIAL_SUPPORT,
        "title": "Iqtidorli talabalar uchun grant va maxsus stipendiya dasturi",
        "description": "Universitetning a’lochi va ijtimoiy himoyaga muhtoj talabalariga moddiy stipendiya ajratildi.",
        "metadata": {"amount": 25000000},
    },
    {
        "alumnus_slug": "nematov-sherzod-qalandarovich",
        "category": Contribution.Category.COMMUNITY,
        "action_type": Contribution.ActionType.MASTERCLASS_DELIVERED,
        "title": "Muhandislik va oliy ta’lim transformatsiyasi bo‘yicha ochiq seminar",
        "description": "Universitet talabalari uchun zamonaviy muhandislik kasblari va karyera rejalashtirish mavzusida mahorat darsi o‘tkazildi.",
        "metadata": {"attendees_estimate": 120},
    },
    {
        "alumnus_slug": "panjiyev-maqsud-aliqulovich",
        "category": Contribution.Category.CAREER,
        "action_type": Contribution.ActionType.STUDENT_INTERNSHIP,
        "title": "Viloyat ta’lim tizimida 15 nafar pedagogika talabasi uchun amaliyot tashkil etildi",
        "description": "Bitiruvchi kurs talabalariga yetakchi maktablarda real dars o‘tish amaliyoti yo‘lga qo‘yildi.",
        "metadata": {"interns_count": 15},
    },
    {
        "alumnus_slug": "panjiyev-maqsud-aliqulovich",
        "category": Contribution.Category.COMMUNITY,
        "action_type": Contribution.ActionType.EVENT_ORGANIZED,
        "title": "Yosh o‘qituvchilar forumi va metodik mahorat anjumani",
        "description": "Maktabgacha va maktab ta’limi boshqarmasi bilan hamkorlikda 200+ bitiruvchi uchun konferensiya tashkil qilindi.",
        "metadata": {"event_scale": "regional"},
    },
    {
        "alumnus_slug": "xusan-temirov",
        "category": Contribution.Category.COMMUNITY,
        "action_type": Contribution.ActionType.MASTERCLASS_DELIVERED,
        "title": "Jurnalistika va teleradio mahorati bo‘yicha amaliy mashg‘ulot",
        "description": "Filologiya va jurnalistika yo‘nalishi talabalariga nutq madaniyati va reportaj tayyorlash sirlari o‘rgatildi.",
        "metadata": {"duration_hours": 3},
    },
    {
        "alumnus_slug": "ravshanov-olim-poyonovich",
        "category": Contribution.Category.COMMUNITY,
        "action_type": Contribution.ActionType.COMMUNITY_INITIATIVE,
        "title": "Mahallalarda yoshlar bandligi va kitobxonlik loyihasi",
        "description": "Qarshi shahridagi mahallalarda talaba-yoshlar uchun ochiq kutubxona va kasbiy suhbatlar tashkil etildi.",
        "metadata": {"initiative_type": "public_library"},
    },
]

def seed_impact():
    admin_user = User.objects.filter(is_superuser=True).first()
    if not admin_user:
        admin_user, _ = User.objects.get_or_create(
            email="admin@qarshidu.uz",
            defaults={"role": User.Role.ADMIN, "is_staff": True, "is_superuser": True}
        )

    # Seed Achievements
    for ach in ACHIEVEMENTS_DATA:
        Achievement.objects.update_or_create(
            code=ach["code"],
            defaults=ach,
        )
    print(f"Achievements seeded: {Achievement.objects.count()}")

    # Seed Contributions & Verify
    for item in DEMO_CONTRIBUTIONS:
        alumnus = AlumniProfile.objects.filter(slug=item["alumnus_slug"]).first()
        if not alumnus:
            continue

        contrib, created = Contribution.objects.update_or_create(
            alumni=alumnus,
            title=item["title"],
            defaults={
                "category": item["category"],
                "action_type": item["action_type"],
                "source_type": Contribution.SourceType.STAFF_ENTRY,
                "description": item["description"],
                "metadata": item["metadata"],
                "status": Contribution.Status.PENDING,
            }
        )

        verify_contribution(
            contribution_id=contrib.id,
            verified_by_user=admin_user,
            verification_note="Tahririyat va universitet ma’muriyati tomonidan tasdiqlandi.",
        )

    print(f"Contributions seeded: {Contribution.objects.count()}, Score Transactions: {ScoreTransaction.objects.count()}")

if __name__ == "__main__":
    seed_impact()
