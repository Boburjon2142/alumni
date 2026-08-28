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
faculty, _ = Faculty.objects.get_or_create(name="Iqtisodiyot")
specialty, _ = Specialty.objects.get_or_create(
    faculty=faculty,
    name="Iqtisodiyot / Sanoat boshqaruvi yo‘nalishi"
)

# 2. Find or create Qurbonov Oybek Abdusattorovich profile
profile = AlumniProfile.objects.filter(full_name__icontains="Qurbonov").first()
if not profile:
    profile = AlumniProfile()

profile.full_name = "Qurbonov Oybek Abdusattorovich"
profile.slug = "qurbonov-oybek-abdusattorovich"
profile.faculty = faculty
profile.specialty = specialty
profile.graduation_year = None
profile.degree = ""
profile.position = "Qashqadaryo viloyati hokimligi huzuridagi «Sanoatni rivojlantirish loyiha ofisi» rahbari (direktori)"
profile.current_company = "Qashqadaryo viloyati hokimligi"
profile.industry = "Sanoat va investitsiyalar"
profile.city = "Qarshi"
profile.country = "O‘zbekiston"
profile.bio = "Qashqadaryo viloyati hokimligi huzuridagi «Sanoatni rivojlantirish loyiha ofisi» rahbari (direktori)."
profile.biography_uz = "Qurbonov Oybek Abdusattorovich Qarshi davlat universiteti bitiruvchisi bo‘lib, iqtisodiyot va sanoat boshqaruvi yo‘nalishida yetuk mutaxassis hisoblanadi. U sanoat va kimyo sohasidagi yirik korxonalarda boshqaruv lavozimlarida, xususan «Dehqonobod kaliy zavodi» AJ boshqaruvi raisi hamda hozirda Qashqadaryo viloyati hokimligi huzuridagi «Sanoatni rivojlantirish loyiha ofisi» direktori sifatida viloyat sanoatini modernizatsiya qilishda faoliyat olib bormoqda."
profile.biography_en = "Qurbonov Oybek Abdusattorovich graduated from Karshi State University with a background in Economics and Industrial Management. He has led major industrial enterprises including Dehkanabad Potash Plant JSC and currently serves as Director of the Industrial Development Project Office under the Khokimiyat of Kashkadarya Region."
profile.is_featured = True
profile.featured_order = 4
profile.is_published = True
profile.verification_status = AlumniProfile.Verification.VERIFIED
profile.visibility = AlumniProfile.Visibility.PUBLIC

# Setup avatar
avatar_src = Path("C:/Users/Omen/Desktop/KSU alumni/assetsss/Faxriylar/O. Qurbonov.png")
media_target = Path("C:/Users/Omen/Desktop/KSU alumni/backend/media/alumni/qurbonov-oybek-abdusattorovich/qurbonov-oybek-abdusattorovich.png")
media_target.parent.mkdir(parents=True, exist_ok=True)
if avatar_src.exists():
    shutil.copyfile(avatar_src, media_target)
    profile.avatar = "alumni/qurbonov-oybek-abdusattorovich/qurbonov-oybek-abdusattorovich.png"
    # Also copy to frontend public
    frontend_target = Path("C:/Users/Omen/Desktop/KSU alumni/frontend/public/images/faxriylar/qurbonov-oybek-abdusattorovich.png")
    frontend_target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(avatar_src, frontend_target)

profile.save()

# Update FeaturedAlumni
FeaturedAlumni.objects.filter(alumni=profile).delete()
FeaturedAlumni.objects.create(
    alumni=profile,
    title="Faxriy bitiruvchi — Qurbonov Oybek Abdusattorovich",
    short_description="Qashqadaryo viloyati hokimligi huzuridagi «Sanoatni rivojlantirish loyiha ofisi» rahbari (direktori).",
    display_order=4,
    is_active=True
)

# Clean achievements
Achievement.objects.filter(alumnus=profile).delete()

# Setup timeline items
CareerTimelineItem.objects.filter(alumnus=profile).delete()
timeline_items = [
    {
        "year": 2018,
        "title": "Sanoat va kimyo sohasidagi yirik korxonalarda turli boshqaruv lavozimlarida faoliyat yuritgan",
        "organization": "Sanoat va kimyo korxonalari",
        "order": 1
    },
    {
        "year": 2022,
        "title": "2020 — 2022 yy. — «Dehqonobod kaliy zavodi» AJ boshqaruvi raisi",
        "organization": "«Dehqonobod kaliy zavodi» AJ",
        "order": 2
    },
    {
        "year": 2024,
        "title": "2022-yildan hozirgacha — Sanoatni rivojlantirish va investitsiya loyihalarini boshqarish tizimida (Qashqadaryo viloyati hokimligi «Sanoatni rivojlantirish loyiha ofisi» direktori)",
        "organization": "Qashqadaryo viloyati hokimligi",
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

# Setup advice
AlumniAdvice.objects.filter(alumnus=profile).delete()
AlumniAdvice.objects.create(
    alumnus=profile,
    content_uz="Sanoat va ishlab chiqarish sohasida muvaffaqiyat qozonish uchun aniq tahlil, zamonaviy texnologiyalarni o‘zlashtirish va jamoani to‘g‘ri boshqarish muhim.",
    content_en="To achieve success in industry and production, precise analytical thinking, modern technology adoption, and effective team leadership are vital.",
    category="career",
    is_published=True,
    is_featured=True
)

print("Qurbonov Oybek Abdusattorovich profile and timeline updated successfully!")

