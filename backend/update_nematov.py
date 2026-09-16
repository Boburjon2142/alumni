import os
import shutil
from pathlib import Path
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.alumni.models import AlumniProfile, FeaturedAlumni, Achievement, CareerTimelineItem
from apps.universities.models import Faculty, Specialty
from apps.editorial.models import AlumniAdvice

# 1. Faculty and Specialty
faculty, _ = Faculty.objects.get_or_create(name="Fizika-texnika")
specialty, _ = Specialty.objects.get_or_create(
    faculty=faculty,
    name="Fizika (Texnika fanlari doktori — DSc, professor)"
)

# 2. Find or create Nematov Sirojiddin profile
profile = AlumniProfile.objects.filter(full_name__icontains="Nematov").first()
if not profile:
    profile = AlumniProfile.objects.filter(full_name__icontains="Ne'matov").first()
if not profile:
    profile = AlumniProfile()

profile.full_name = "Sirojiddin Ne'matov"
profile.slug = "sirojiddin-nematov"
profile.faculty = faculty
profile.specialty = specialty
profile.graduation_year = 2005
profile.degree = "Texnika fanlari doktori (DSc), professor"
profile.position = "Qarshi davlat texnika universiteti (Qarshi muhandislik-iqtisodiyot instituti) rektori, professor"
profile.current_company = "Qarshi davlat texnika universiteti"
profile.industry = "Oliy taʼlim va texnika fanlari"
profile.city = "Qarshi"
profile.country = "O‘zbekiston"
profile.bio = "Texnika fanlari doktori (DSc), professor. Qarshi davlat texnika universiteti rektori."
profile.biography_uz = "Sirojiddin Ne'matov 2005-yilda Qarshi davlat universiteti Fizika-texnika fakultetini tamomlagan. Texnika fanlari doktori (DSc), professor. QarshiDUda ilmiy-pedagogik faoliyatini boshlab, dotsent, kafedra mudiri, fakultet dekani hamda oliy ta’lim muassasalarida ilmiy ishlar va innovatsiyalar bo‘yicha prorektor vazifalarida xizmat qilgan. 2023-yildan buyon Qarshi davlat texnika universiteti rektori lavozimida faoliyat yuritib kelmoqda."
profile.biography_en = "Sirojiddin Ne'matov graduated from the Faculty of Physics and Technology at Karshi State University in 2005. He holds a DSc degree and Professor title in Technical Sciences, and currently serves as Rector of Karshi State Technical University."
profile.is_featured = True
profile.featured_order = 10
profile.is_published = True
profile.verification_status = AlumniProfile.Verification.VERIFIED
profile.visibility = AlumniProfile.Visibility.PUBLIC

# Setup avatar
avatar_src = Path("C:/Users/Omen/Desktop/KSU alumni/assetsss/Faxriylar/Ne'matov S..png")
if not avatar_src.exists():
    avatar_src = Path("C:/Users/Omen/Desktop/KSU alumni/assetsss/Faxriylar/Nematov S..png")

media_target = Path("C:/Users/Omen/Desktop/KSU alumni/backend/media/alumni/sirojiddin-nematov/sirojiddin-nematov.png")
media_target.parent.mkdir(parents=True, exist_ok=True)
if avatar_src.exists():
    shutil.copyfile(avatar_src, media_target)
    profile.avatar = "alumni/sirojiddin-nematov/sirojiddin-nematov.png"
    # Also copy to frontend public
    frontend_target = Path("C:/Users/Omen/Desktop/KSU alumni/frontend/public/images/faxriylar/sirojiddin-nematov.png")
    frontend_target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(avatar_src, frontend_target)

profile.save()

# Update FeaturedAlumni
FeaturedAlumni.objects.filter(alumni=profile).delete()
FeaturedAlumni.objects.create(
    alumni=profile,
    title="Faxriy bitiruvchi — Sirojiddin Ne'matov",
    short_description="Qarshi davlat texnika universiteti rektori, DSc, professor.",
    display_order=10,
    is_active=True
)

# Clean old placeholder achievements
Achievement.objects.filter(alumnus=profile).delete()

# Setup timeline items
CareerTimelineItem.objects.filter(alumnus=profile).delete()
timeline_items = [
    {
        "year": 2005,
        "title": "2000 — 2005 yy. — Qarshi davlat universiteti Fizika-texnika fakulteti talabasi",
        "organization": "Qarshi davlat universiteti",
        "order": 1
    },
    {
        "year": 2012,
        "title": "2005 — 2012 yy. — Qarshi davlat universitetida o‘qituvchi, katta o‘qituvchi, ilmiy izlanuvchi",
        "organization": "Qarshi davlat universiteti",
        "order": 2
    },
    {
        "year": 2019,
        "title": "2012 — 2019 yy. — Dotsent, kafedra mudiri, fakultet dekani muovini va dekan vazifalarida boshqaruv hamda pedagogik faoliyat",
        "organization": "Qarshi davlat universiteti",
        "order": 3
    },
    {
        "year": 2023,
        "title": "2019 — 2023 yy. — Oliy taʼlim muassasalarida ilmiy ishlar va innovatsiyalar bo‘yicha prorektor, ilmiy kengashlar aʼzosi (DSc ilmiy darajasi va professor unvoni himoyasi)",
        "organization": "Oliy taʼlim muassasalari",
        "order": 4
    },
    {
        "year": 2024,
        "title": "2023-yildan hozirgacha — Qarshi davlat texnika universiteti rektori",
        "organization": "Qarshi davlat texnika universiteti",
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

# Setup advice
AlumniAdvice.objects.filter(alumnus=profile).delete()
AlumniAdvice.objects.create(
    alumnus=profile,
    content_uz="Muhandislik va zamonaviy texnologiyalar yurtimiz taraqqiyotining asosiy drayveridir. Amaliy ko‘nikma va ilmiy izlanishni uyg‘unlashtirgan mutaxassis har doim talabgir bo‘ladi.",
    content_en="Engineering and modern technologies are key drivers of development. Professionals who bridge hands-on skills with rigorous research will always be in high demand.",
    category="engineering",
    is_published=True,
    is_featured=True
)

print("Sirojiddin Ne'matov profile and timeline updated successfully!")

