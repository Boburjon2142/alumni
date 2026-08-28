import os
import shutil
from pathlib import Path
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.alumni.models import AlumniProfile, FeaturedAlumni, CareerTimelineItem
from apps.universities.models import Faculty, Specialty

# 1. Faculty and Specialty
faculty, _ = Faculty.objects.get_or_create(name="Matematika")
specialty, _ = Specialty.objects.get_or_create(
    faculty=faculty,
    name="Matematika va informatika o‘qituvchisi (pedagogika fanlari bo‘yicha falsafa doktori — PhD)"
)

# 2. Find or create Panjiyev Maqsud Aliqulovich profile
profile = AlumniProfile.objects.filter(full_name__icontains="Panjiyev").first()
if not profile:
    profile = AlumniProfile()

profile.full_name = "Panjiyev Maqsud Aliqulovich"
profile.slug = "panjiyev-maqsud-aliqulovich"
profile.graduation_year = 2003
profile.faculty = faculty
profile.specialty = specialty
profile.degree = "Pedagogika fanlari bo‘yicha falsafa doktori (PhD)"
profile.position = "Qashqadaryo viloyati Maktabgacha va maktab taʼlimi boshqarmasi boshlig‘i o‘rinbosari"
profile.current_company = "Qashqadaryo viloyati Maktabgacha va maktab taʼlimi boshqarmasi"
profile.industry = "Maktabgacha va maktab taʼlimi"
profile.city = "Qarshi"
profile.country = "O‘zbekiston"
profile.bio = "Pedagogika fanlari bo‘yicha falsafa doktori (PhD). Qashqadaryo viloyati Maktabgacha va maktab taʼlimi boshqarmasi boshlig‘i o‘rinbosari."
profile.biography_uz = "Panjiyev Maqsud Aliqulovich 2003-yilda Qarshi davlat universitetini Matematika va informatika o‘qituvchisi mutaxassisligi bo‘yicha tamomlagan. Keyinchalik axborot-kommunikatsiya texnologiyalari yo‘nalishida tahsil olgan, pedagogika fanlari bo‘yicha falsafa doktori (PhD). Ta’lim tizimida o‘qituvchilikdan boshlab, tuman hokimi o‘rinbosari hamda viloyat maktabgacha va maktab ta’limi boshqarmasi boshlig‘i o‘rinbosari darajasigacha bo‘lgan mas’uliyatli boshqaruv yo‘lini bosib o‘tgan."
profile.biography_en = "Panjiyev Maqsud Aliqulovich graduated from Karshi State University in 2003 with a degree in Mathematics and Computer Science Teaching. He holds a PhD in Pedagogical Sciences and serves as Deputy Head of the Kashkadarya Regional Preschool and School Education Department."
profile.is_featured = True
profile.featured_order = 2
profile.is_published = True
profile.verification_status = AlumniProfile.Verification.VERIFIED
profile.visibility = AlumniProfile.Visibility.PUBLIC

# Setup avatar
avatar_src = Path("C:/Users/Omen/Desktop/KSU alumni/assetsss/Faxriylar/M. Panjiyev.png")
media_target = Path("C:/Users/Omen/Desktop/KSU alumni/backend/media/alumni/panjiyev-maqsud-aliqulovich/panjiyev-maqsud-aliqulovich.png")
media_target.parent.mkdir(parents=True, exist_ok=True)
if avatar_src.exists():
    shutil.copyfile(avatar_src, media_target)
    profile.avatar = "alumni/panjiyev-maqsud-aliqulovich/panjiyev-maqsud-aliqulovich.png"
    # Also copy to frontend public
    frontend_target = Path("C:/Users/Omen/Desktop/KSU alumni/frontend/public/images/faxriylar/panjiyev-maqsud-aliqulovich.png")
    frontend_target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(avatar_src, frontend_target)

profile.save()

# Update FeaturedAlumni
FeaturedAlumni.objects.filter(alumni=profile).delete()
FeaturedAlumni.objects.create(
    alumni=profile,
    title="Faxriy bitiruvchi — Panjiyev Maqsud Aliqulovich",
    short_description="Qashqadaryo viloyati Maktabgacha va maktab taʼlimi boshqarmasi boshlig‘i o‘rinbosari. QarDU 2003-yil bitiruvchisi.",
    display_order=2,
    is_active=True
)

# Setup timeline items
CareerTimelineItem.objects.filter(alumnus=profile).delete()
timeline_items = [
    {
        "year": 2003,
        "title": "1999 — 2003 yy. — Qarshi davlat universiteti talabasi",
        "organization": "Qarshi davlat universiteti",
        "order": 1
    },
    {
        "year": 2012,
        "title": "2003 — 2012 yy. — Maktab va kasb-hunar taʼlimi muassasalarida o‘qituvchi, axborot texnologiyalari bo‘yicha masʼul xodim",
        "organization": "Maktab va kasb-hunar taʼlimi muassasalari",
        "order": 2
    },
    {
        "year": 2018,
        "title": "2012 — 2018 yy. — Qashqadaryo viloyati xalq taʼlimi boshqaruvi tizimida bo‘lim boshlig‘i va masʼul mutaxassis",
        "organization": "Qashqadaryo viloyati xalq taʼlimi boshqarmasi",
        "order": 3
    },
    {
        "year": 2021,
        "title": "2018 — 2021 yy. — G‘uzor tumani hokimining yoshlar siyosati, ijtimoiy rivojlantirish va maʼnaviy-maʼrifiy ishlar bo‘yicha o‘rinbosari",
        "organization": "G‘uzor tumani hokimligi",
        "order": 4
    },
    {
        "year": 2024,
        "title": "2021-yildan hozirgacha — Qashqadaryo viloyati Xalq taʼlimi (hozirgi Maktabgacha va maktab taʼlimi) boshqarmasi boshlig‘i o‘rinbosari",
        "organization": "Maktabgacha va maktab taʼlimi boshqarmasi",
        "order": 5
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

print("Panjiyev Maqsud Aliqulovich profile and timeline updated successfully!")

