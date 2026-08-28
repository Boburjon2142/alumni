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
faculty, _ = Faculty.objects.get_or_create(name="Huquqshunoslik")
specialty, _ = Specialty.objects.get_or_create(
    faculty=faculty,
    name="Yurist / Huquqshunoslik (Huquq-tartibot organlari sohasidagi mutaxassis)"
)

# 2. Find or create Rajabov Alisher Hazratovich profile
profile = AlumniProfile.objects.filter(full_name__icontains="Rajabov").first()
if not profile:
    profile = AlumniProfile()

profile.full_name = "Rajabov Alisher Hazratovich"
profile.slug = "rajabov-alisher-hazratovich"
profile.faculty = faculty
profile.specialty = specialty
profile.graduation_year = None
profile.degree = "Bakalavr"
profile.position = "O‘zbekiston Respublikasi huquq-tartibot (prokuratura / adliya) organlari tizimida masʼul rahbarlik faoliyati"
profile.current_company = "O‘zbekiston Respublikasi huquq-tartibot organlari"
profile.industry = "Huquq-tartibot va adliya"
profile.city = "Toshkent"
profile.country = "O‘zbekiston"
profile.bio = "O‘zbekiston Respublikasi huquq-tartibot (prokuratura / adliya) organlari tizimida masʼul rahbarlik faoliyati."
profile.biography_uz = "Rajabov Alisher Hazratovich Qarshi davlat universitetida oliy ma’lumot olgan yetuk huquqshunos. Prokuratura va adliya tizimi organlarida tergovchi, bo‘lim prokurori va tuman/shahar miqyosidagi mas’ul lavozimlarda faoliyat yuritgan. Hozirda O‘zbekiston Respublikasi huquq-tartibot tizimining mas’ul rahbarlik hamda nazorat lavozimlarida samarali xizmat qilib kelmoqda."
profile.biography_en = "Rajabov Alisher Hazratovich graduated in law from Karshi State University. He has served with distinction across the prosecution and justice system in investigative, prosecutorial, and regional leadership capacities."
profile.is_featured = True
profile.featured_order = 5
profile.is_published = True
profile.verification_status = AlumniProfile.Verification.VERIFIED
profile.visibility = AlumniProfile.Visibility.PUBLIC

# Setup avatar
avatar_src = Path("C:/Users/Omen/Desktop/KSU alumni/assetsss/Faxriylar/A. Rajabov.png")
media_target = Path("C:/Users/Omen/Desktop/KSU alumni/backend/media/alumni/rajabov-alisher-hazratovich/rajabov-alisher-hazratovich.png")
media_target.parent.mkdir(parents=True, exist_ok=True)
if avatar_src.exists():
    shutil.copyfile(avatar_src, media_target)
    profile.avatar = "alumni/rajabov-alisher-hazratovich/rajabov-alisher-hazratovich.png"
    # Also copy to frontend public
    frontend_target = Path("C:/Users/Omen/Desktop/KSU alumni/frontend/public/images/faxriylar/rajabov-alisher-hazratovich.png")
    frontend_target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(avatar_src, frontend_target)

profile.save()

# Update FeaturedAlumni
FeaturedAlumni.objects.filter(alumni=profile).delete()
FeaturedAlumni.objects.create(
    alumni=profile,
    title="Faxriy bitiruvchi — Rajabov Alisher Hazratovich",
    short_description="Huquq-tartibot organlari tizimi masʼul rahbar xodimi.",
    display_order=5,
    is_active=True
)

# Clean old placeholder achievements
Achievement.objects.filter(alumnus=profile).delete()

# Setup timeline items
CareerTimelineItem.objects.filter(alumnus=profile).delete()
timeline_items = [
    {
        "year": 2010,
        "title": "Qarshi davlat universitetida oliy taʼlim olgan",
        "organization": "Qarshi davlat universiteti",
        "order": 1
    },
    {
        "year": 2016,
        "title": "Prokuratura va adliya tizimi organlarida tergovchi, bo‘lim prokurori va tuman/shahar miqyosidagi masʼul lavozimlarda faoliyat yuritgan",
        "organization": "Huquq-tartibot organlari",
        "order": 2
    },
    {
        "year": 2024,
        "title": "O‘zbekiston Respublikasi huquq-tartibot tizimining hududiy va respublika bo‘linmalarida rahbarlik hamda nazorat lavozimlarida xizmat qilgan",
        "organization": "O‘zbekiston Respublikasi huquq-tartibot tizimi",
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
    content_uz="Qonun ustuvorligi, adolat va xalq manfaatlari yo‘lida sidqidildan xizmat qilish — har bir huquqshunosning eng oliy burchidir.",
    content_en="Upholding the rule of law, justice, and sincere dedication to the people is the supreme duty of every legal professional.",
    category="law",
    is_published=True,
    is_featured=True
)

print("Rajabov Alisher Hazratovich profile and timeline updated successfully!")

