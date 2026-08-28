import os
import shutil
from pathlib import Path
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.alumni.models import AlumniProfile, FeaturedAlumni, Achievement, CareerTimelineItem
from apps.universities.models import Faculty, Specialty

# 1. Faculty and Specialty
faculty, _ = Faculty.objects.get_or_create(name="Kimyo-biologiya")
specialty, _ = Specialty.objects.get_or_create(
    faculty=faculty,
    name="Biologiya va kimyo fani o‘qituvchisi (Biologiya/qishloq xo‘jaligi fanlari doktori, professor)"
)

# 2. Find or create Allayev Dolli Hakimovich profile
profile = AlumniProfile.objects.filter(full_name__icontains="Allayev").first()
if not profile:
    profile = AlumniProfile()

profile.full_name = "Allayev Dolli Hakimovich"
profile.slug = "allayev-dolli-hakimovich"
profile.graduation_year = 1993
profile.faculty = faculty
profile.specialty = specialty
profile.degree = "Fan doktori (DSc), professor"
profile.position = "Oliy taʼlim tizimida pedagogik, ilmiy-tadqiqot va rahbarlik faoliyati (professor / rahbarlik lavozimlarida)"
profile.current_company = ""
profile.industry = "Oliy ta’lim va ilm-fan"
profile.city = "Qarshi"
profile.country = "O‘zbekiston"
profile.bio = "Biologiya va qishloq xo‘jaligi fanlari doktori, professor. Oliy taʼlim tizimida pedagogik, ilmiy-tadqiqot va rahbarlik faoliyati olib boruvchi yetuk olim."
profile.biography_uz = "Allayev Dolli Hakimovich 1993-yilda Qarshi davlat universitetini Biologiya va kimyo fani o‘qituvchisi mutaxassisligi bo‘yicha tamomlagan. Biologiya va qishloq xo‘jaligi fanlari doktori, professor. Ko‘p yillar davomida universitetda kafedra mudiri, fakultet dekani, ilmiy laboratoriyalar rahbari hamda oliy ta’lim tizimida prorektorlik va ilmiy rahbarlik lavozimlarida samarali faoliyat yuritib kelmoqda."
profile.biography_en = "Allayev Dolli Hakimovich graduated from Karshi State University in 1993 with a degree in Biology and Chemistry Teaching. He holds a DSc degree and Professor title, having served as department chair, dean, and university vice-rector."
profile.is_featured = True
profile.featured_order = 1
profile.is_published = True
profile.verification_status = AlumniProfile.Verification.VERIFIED
profile.visibility = AlumniProfile.Visibility.PUBLIC

# Setup avatar
avatar_src = Path("C:/Users/Omen/Desktop/KSU alumni/assetsss/Faxriylar/Allayev D..png")
media_target = Path("C:/Users/Omen/Desktop/KSU alumni/backend/media/alumni/allayev-dolli-hakimovich/allayev-dolli-hakimovich.png")
media_target.parent.mkdir(parents=True, exist_ok=True)
if avatar_src.exists():
    shutil.copyfile(avatar_src, media_target)
    profile.avatar = "alumni/allayev-dolli-hakimovich/allayev-dolli-hakimovich.png"
    # Also copy to frontend public
    frontend_target = Path("C:/Users/Omen/Desktop/KSU alumni/frontend/public/images/faxriylar/allayev-dolli-hakimovich.png")
    frontend_target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(avatar_src, frontend_target)

profile.save()

# Update FeaturedAlumni
FeaturedAlumni.objects.filter(alumni=profile).delete()
FeaturedAlumni.objects.create(
    alumni=profile,
    title="Faxriy bitiruvchi — Allayev Dolli Hakimovich",
    short_description="Biologiya va qishloq xo‘jaligi fanlari doktori, professor. QarDU 1993-yil bitiruvchisi.",
    display_order=1,
    is_active=True
)

# Setup timeline items
CareerTimelineItem.objects.filter(alumnus=profile).delete()
timeline_items = [
    {
        "year": 1993,
        "title": "1988 — 1993 yy. — Qarshi davlat universiteti talabasi",
        "organization": "Qarshi davlat universiteti",
        "order": 1
    },
    {
        "year": 1996,
        "title": "1993 — 1996 yy. — O‘zbekiston Respublikasi Fanlar akademiyasi tizimidagi ilmiy-tadqiqot institutida aspirant / kichik ilmiy xodim",
        "organization": "O‘zR Fanlar akademiyasi",
        "order": 2
    },
    {
        "year": 2005,
        "title": "1996 — 2005 yy. — Qarshi davlat universiteti biologiya yo‘nalishi kafedralarida o‘qituvchi, katta o‘qituvchi, dotsent",
        "organization": "Qarshi davlat universiteti",
        "order": 3
    },
    {
        "year": 2015,
        "title": "2005 — 2015 yy. — Kafedra mudiri, fakultet dekani o‘rinbosari va dekan lavozimlarida faoliyat",
        "organization": "Qarshi davlat universiteti",
        "order": 4
    },
    {
        "year": 2021,
        "title": "2015 — 2021 yy. — Ilmiy laboratoriyalar va amaliy tadqiqot loyihalari rahbari, kafedra mudiri",
        "organization": "Ilmiy-tadqiqot laboratoriyalari",
        "order": 5
    },
    {
        "year": 2024,
        "title": "2021-yildan hozirgacha — Oliy taʼlim va ilmiy-tadqiqot muassasalarida boshqaruv (prorektorlik/ilmiy rahbarlik) hamda professor sifatida ilmiy-pedagogik faoliyat",
        "organization": "Oliy taʼlim muassasalari",
        "order": 6
    },
]

for item in timeline_items:
    CareerTimelineItem.objects.create(
        alumnus=profile,
        year=item["year"],
        title=item["title"],
        organization="",
        order=item["order"]
    )

print("Allayev Dolli Hakimovich profile and timeline updated successfully!")

