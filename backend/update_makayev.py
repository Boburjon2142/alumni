import os
import shutil
from pathlib import Path
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.alumni.models import AlumniProfile, FeaturedAlumni, CareerTimelineItem
from apps.universities.models import Faculty, Specialty

# 1. Faculty and Specialty
faculty, _ = Faculty.objects.get_or_create(name="Jismoniy madaniyat")
specialty, _ = Specialty.objects.get_or_create(
    faculty=faculty,
    name="Jismoniy madaniyat o‘qituvchisi (Jismoniy madaniyat fakulteti bitiruvchisi)"
)

# 2. Find or create Makayev Zafar profile
profile = AlumniProfile.objects.filter(full_name__icontains="Makayev").first()
if not profile:
    profile = AlumniProfile()

profile.full_name = "Zafar Makayev"
profile.slug = "zafar-makayev"
profile.faculty = faculty
profile.specialty = specialty
profile.graduation_year = None
profile.degree = ""
profile.position = "O‘zbekiston Respublikasi Ichki ishlar vazirligi tizimida masʼul rahbarlik faoliyati (podpolkovnik unvonida)"
profile.current_company = ""
profile.industry = "Davlat xizmati va xavfsizlik"
profile.city = "Toshkent"
profile.country = "O‘zbekiston"
profile.bio = "O‘zbekiston Respublikasi Ichki ishlar vazirligi tizimida masʼul rahbarlik faoliyati (podpolkovnik unvonida)."
profile.biography_uz = "Zafar Makayev Qarshi davlat universiteti Jismoniy madaniyat fakultetini tamomlagan. O‘zbekiston Respublikasi Ichki ishlar organlari tizimida uzoq yillik namunali xizmat faoliyatini olib borib, Ichki ishlar vazirligi vazir o‘rinbosarining boshqaruv apparati bo‘limi boshlig‘i (podpolkovnik) lavozimida mas’uliyatli xizmat qilib kelmoqda."
profile.biography_en = "Zafar Makayev graduated from the Faculty of Physical Culture at Karshi State University. He serves with distinction in the Ministry of Internal Affairs of the Republic of Uzbekistan as Head of Department in the Deputy Minister's Executive Office with the rank of Lieutenant Colonel."
profile.is_featured = True
profile.featured_order = 3
profile.is_published = True
profile.verification_status = AlumniProfile.Verification.VERIFIED
profile.visibility = AlumniProfile.Visibility.PUBLIC

# Setup avatar
avatar_src = Path("C:/Users/Omen/Desktop/KSU alumni/assetsss/Faxriylar/Makayev Z..png")
media_target = Path("C:/Users/Omen/Desktop/KSU alumni/backend/media/alumni/zafar-makayev/zafar-makayev.png")
media_target.parent.mkdir(parents=True, exist_ok=True)
if avatar_src.exists():
    shutil.copyfile(avatar_src, media_target)
    profile.avatar = "alumni/zafar-makayev/zafar-makayev.png"
    # Also copy to frontend public
    frontend_target = Path("C:/Users/Omen/Desktop/KSU alumni/frontend/public/images/faxriylar/zafar-makayev.png")
    frontend_target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(avatar_src, frontend_target)

profile.save()

# Update FeaturedAlumni
FeaturedAlumni.objects.filter(alumni=profile).delete()
FeaturedAlumni.objects.create(
    alumni=profile,
    title="Faxriy bitiruvchi — Zafar Makayev",
    short_description="O‘zbekiston Respublikasi Ichki ishlar vazirligi masʼul xodimi (podpolkovnik).",
    display_order=3,
    is_active=True
)

# Setup timeline items
CareerTimelineItem.objects.filter(alumnus=profile).delete()
timeline_items = [
    {
        "year": 2005,
        "title": "Qarshi davlat universiteti Jismoniy madaniyat fakulteti talabasi (o‘qishni tamomlagan)",
        "organization": "Qarshi davlat universiteti",
        "order": 1
    },
    {
        "year": 2012,
        "title": "O‘zbekiston Respublikasi Ichki ishlar organlari tizimida xizmat",
        "organization": "O‘zbekiston Respublikasi Ichki ishlar organlari",
        "order": 2
    },
    {
        "year": 2024,
        "title": "O‘zbekiston Respublikasi Ichki ishlar vazirligi vazir o‘rinbosarining boshqaruv apparati bo‘limi boshlig‘i (podpolkovnik)",
        "organization": "O‘zbekiston Respublikasi Ichki ishlar vazirligi",
        "order": 3
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

from apps.editorial.models import AlumniAdvice
AlumniAdvice.objects.filter(alumnus=profile).delete()
AlumniAdvice.objects.create(
    alumnus=profile,
    content_uz="Vatanga va xalqqa sadoqat bilan xizmat qilish, har bir sohada yuksak intizom va mas'uliyatni his etish — muvaffaqiyatning asosiy poydevoridir.",
    content_en="Serving the motherland with dedication, discipline, and high responsibility is the cornerstone of lasting success.",
    category="leadership",
    is_published=True,
    is_featured=True
)

print("Zafar Makayev profile, timeline and advice updated successfully!")
