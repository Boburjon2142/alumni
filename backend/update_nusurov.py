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
faculty, _ = Faculty.objects.get_or_create(name="Filologiya")
specialty, _ = Specialty.objects.get_or_create(
    faculty=faculty,
    name="Jurnalist / Filolog (Matbuot va tahririyat ishi mutaxassisi)"
)

# 2. Find or create Nusurov Usmon Nusratovich profile
profile = AlumniProfile.objects.filter(full_name__icontains="Nusratov").first()
if not profile:
    profile = AlumniProfile.objects.filter(full_name__icontains="Nusurov").first()
if not profile:
    profile = AlumniProfile()

profile.full_name = "Nusurov Usmon Nusratovich"
profile.slug = "nusurov-usmon-nusratovich"
profile.faculty = faculty
profile.specialty = specialty
profile.graduation_year = None
profile.degree = "Bakalavr"
profile.position = "Jurnalistika va ommaviy axborot vositalari sohasida rahbarlik/ijodiy faoliyat"
profile.current_company = "Ommaviy axborot vositalari va matbuot xizmati"
profile.industry = "Jurnalistika va OAV"
profile.city = "Qarshi"
profile.country = "O‘zbekiston"
profile.bio = "Taniqli jurnalist va publitsist. Jurnalistika va ommaviy axborot vositalari sohasida rahbarlik/ijodiy faoliyat olib boruvchi yetuk mutaxassis."
profile.biography_uz = "Nusurov Usmon Nusratovich Qarshi davlat universitetida (Filologiya/Jurnalistika yo‘nalishida) tahsil olgan. Uzoq yillar davomida viloyat va respublika ommaviy axborot vositalarida muxbir, bo‘lim mudiri, mas’ul kotib, axborot xizmati rahbari hamda tahririyatlarda boshqaruv lavozimlarida faoliyat yuritgan. O‘zbekiston Jurnalistlar uyushmasi a’zosi sifatida faol publitsistik ijod bilan shug‘ullanadi."
profile.biography_en = "Nusurov Usmon Nusratovich graduated in Philology and Journalism from Karshi State University. He has had a distinguished career in media, journalism, and public relations, serving as editor, department head, and press office lead across regional and national media."
profile.is_featured = True
profile.featured_order = 11
profile.is_published = True
profile.verification_status = AlumniProfile.Verification.VERIFIED
profile.visibility = AlumniProfile.Visibility.PUBLIC

# Setup avatar
avatar_src = Path("C:/Users/Omen/Desktop/KSU alumni/assetsss/Faxriylar/Nusratov U..png")
if not avatar_src.exists():
    avatar_src = Path("C:/Users/Omen/Desktop/KSU alumni/assetsss/Faxriylar/Nusurov U..png")

media_target = Path("C:/Users/Omen/Desktop/KSU alumni/backend/media/alumni/nusurov-usmon-nusratovich/nusurov-usmon-nusratovich.png")
media_target.parent.mkdir(parents=True, exist_ok=True)
if avatar_src.exists():
    shutil.copyfile(avatar_src, media_target)
    profile.avatar = "alumni/nusurov-usmon-nusratovich/nusurov-usmon-nusratovich.png"
    # Also copy to frontend public
    frontend_target = Path("C:/Users/Omen/Desktop/KSU alumni/frontend/public/images/faxriylar/nusurov-usmon-nusratovich.png")
    frontend_target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(avatar_src, frontend_target)

profile.save()

# Update FeaturedAlumni
FeaturedAlumni.objects.filter(alumni=profile).delete()
FeaturedAlumni.objects.create(
    alumni=profile,
    title="Faxriy bitiruvchi — Nusurov Usmon Nusratovich",
    short_description="Jurnalistika va OAV sohasida masʼul rahbar va yetuk publitsist.",
    display_order=11,
    is_active=True
)

# Clean old placeholder achievements
Achievement.objects.filter(alumnus=profile).delete()
Achievement.objects.create(
    alumnus=profile,
    title="O‘zbekiston Jurnalistlar uyushmasi aʼzosi",
    year=2010
)

# Setup timeline items
CareerTimelineItem.objects.filter(alumnus=profile).delete()
timeline_items = [
    {
        "year": 1995,
        "title": "Qarshi davlat universitetida (Filologiya/Jurnalistika yo‘nalishida) tahsil olgan",
        "organization": "Qarshi davlat universiteti",
        "order": 1
    },
    {
        "year": 2005,
        "title": "Viloyat va respublika ommaviy axborot vositalarida (gazeta, jurnal yoki teleradiokompaniya tizimida) muxbir, bo‘lim mudiri, masʼul kotib",
        "organization": "OAV tizimi",
        "order": 2
    },
    {
        "year": 2015,
        "title": "Davlat yoki jamoat tuzilmalarida axborot xizmati rahbari (matbuot kotibi) hamda tahririyatlarda muharrir/boshqaruvchi lavozimlarida faoliyat yuritgan",
        "organization": "Axborot xizmati va tahririyatlar",
        "order": 3
    },
    {
        "year": 2024,
        "title": "O‘zbekiston Jurnalistlar uyushmasi doirasida ijodiy va publitsistik faoliyat olib borgan",
        "organization": "O‘zbekiston Jurnalistlar uyushmasi",
        "order": 4
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
    content_uz="Jurnalistika — xolislik, teran mushohada va so‘z mas’uliyatini talab qiluvchi kasbdir. Doimo haqqoniy va xalq dardi bilan yozing.",
    content_en="Journalism demands impartiality, deep reflection, and responsibility for the written word. Always remain truthful and devoted to public interest.",
    category="media",
    is_published=True,
    is_featured=True
)

print("Nusurov Usmon Nusratovich profile and timeline updated successfully!")

