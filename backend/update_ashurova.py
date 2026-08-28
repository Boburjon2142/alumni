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
faculty, _ = Faculty.objects.get_or_create(name="O‘zbek filologiyasi")
specialty, _ = Specialty.objects.get_or_create(
    faculty=faculty,
    name="Filologiya / Adabiyotshunoslik (O‘zbek tili va adabiyoti mutaxassisi, yozuvchi va publitsist)"
)

# 2. Find or create Ashurova Sharofat Toshpo‘latovna profile
profile = AlumniProfile.objects.filter(full_name__icontains="Ashurova").first()
if not profile:
    profile = AlumniProfile()

profile.full_name = "Ashurova Sharofat Toshpo‘latovna"
profile.slug = "ashurova-sharofat-toshpolatovna"
profile.faculty = faculty
profile.specialty = specialty
profile.graduation_year = None
profile.degree = "Bakalavr"
profile.position = "Xalqaro “Oltin meros” fondi viloyat bo‘limi raisi, O‘zbekiston Yozuvchilar uyushmasi aʼzosi"
profile.current_company = "Xalqaro “Oltin meros” xayriya jamoat fondi"
profile.industry = "Madaniyat, adabiyot va meros"
profile.city = "Qarshi"
profile.country = "O‘zbekiston"
profile.bio = "Taniqli yozuvchi, publitsist. Xalqaro “Oltin meros” xayriya jamoat fondi Qashqadaryo viloyat bo‘limi boshqaruvi raisi, O‘zbekiston Yozuvchilar uyushmasi aʼzosi."
profile.biography_uz = "Ashurova Sharofat Toshpo‘latovna Qarshi davlat pedagogika institutida (hozirgi Qarshi davlat universiteti) filologiya yo‘nalishida tahsil olgan. O‘zbekiston Yozuvchilar uyushmasi a’zosi, bir qator badiiy va publitsistik kitoblar muallifi. Uzoq yillardan buyon Xalqaro “Oltin meros” xayriya jamoat fondining Qashqadaryo viloyati bo‘limi boshqaruvi raisi sifatida viloyatning boy madaniy merosi, tarixiy obidalari va adabiy muhitini rivojlantirishga munosib hissa qo‘shib kelmoqda."
profile.biography_en = "Ashurova Sharofat Toshpo'latovna graduated in philology from Karshi State Pedagogical Institute (now KarSU). A member of the Writers' Union of Uzbekistan and author of numerous literary and journalistic works, she serves as Chair of the Kashkadarya Regional Branch of the International 'Oltin Meros' Foundation."
profile.is_featured = True
profile.featured_order = 9
profile.is_published = True
profile.verification_status = AlumniProfile.Verification.VERIFIED
profile.visibility = AlumniProfile.Visibility.PUBLIC

# Setup avatar
avatar_src = Path("C:/Users/Omen/Desktop/KSU alumni/assetsss/Faxriylar/Ashurova Sh..png")
media_target = Path("C:/Users/Omen/Desktop/KSU alumni/backend/media/alumni/ashurova-sharofat-toshpolatovna/ashurova-sharofat-toshpolatovna.png")
media_target.parent.mkdir(parents=True, exist_ok=True)
if avatar_src.exists():
    shutil.copyfile(avatar_src, media_target)
    profile.avatar = "alumni/ashurova-sharofat-toshpolatovna/ashurova-sharofat-toshpolatovna.png"
    # Also copy to frontend public
    frontend_target = Path("C:/Users/Omen/Desktop/KSU alumni/frontend/public/images/faxriylar/ashurova-sharofat-toshpolatovna.png")
    frontend_target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(avatar_src, frontend_target)

profile.save()

# Update FeaturedAlumni
FeaturedAlumni.objects.filter(alumni=profile).delete()
FeaturedAlumni.objects.create(
    alumni=profile,
    title="Faxriy bitiruvchi — Ashurova Sharofat Toshpo‘latovna",
    short_description="Xalqaro “Oltin meros” fondi viloyat bo‘limi raisi, yozuvchi va publitsist.",
    display_order=9,
    is_active=True
)

# Clean old achievements
Achievement.objects.filter(alumnus=profile).delete()
Achievement.objects.create(
    alumnus=profile,
    title="O‘zbekiston Yozuvchilar uyushmasi aʼzosi",
    year=2015
)

# Setup timeline items
CareerTimelineItem.objects.filter(alumnus=profile).delete()
timeline_items = [
    {
        "year": 1990,
        "title": "Qarshi davlat pedagogika institutida (hozirgi Qarshi davlat universiteti) filologiya yo‘nalishida tahsil olgan",
        "organization": "Qarshi davlat pedagogika instituti",
        "order": 1
    },
    {
        "year": 2000,
        "title": "Matbuot, nashriyot, tahririyatlar hamda madaniyat-maʼrifat sohalarida ijodiy va boshqaruv faoliyati bilan shug‘ullangan",
        "organization": "Matbuot va nashriyot muassasalari",
        "order": 2
    },
    {
        "year": 2010,
        "title": "Bir qator badiiy, publitsistik kitoblar, tarixiy-madaniy merosga oid maqolalar va tadqiqotlar muallifi",
        "organization": "Ijodiy faoliyat",
        "order": 3
    },
    {
        "year": 2015,
        "title": "O‘zbekiston Yozuvchilar uyushmasi aʼzosi sifatida faol ijodiy faoliyat olib bormoqda",
        "organization": "O‘zbekiston Yozuvchilar uyushmasi",
        "order": 4
    },
    {
        "year": 2024,
        "title": "Uzoq yillardan buyon Xalqaro “Oltin meros” xayriya jamoat fondining Qashqadaryo viloyati bo‘limiga rahbarlik qilib, viloyatning madaniy merosi, tarixiy obidalari va ziyoratgohlarini targ‘ib etish loyihalariga boshchilik qilmoqda",
        "organization": "Xalqaro “Oltin meros” xayriya jamoat fondi",
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
    content_uz="Milliy qadriyatlarimiz, boy tariximiz va adabiyotimizni asrab-avaylash, yosh avlod qalbiga vatanparvarlik va ma’naviyat tuyg‘ularini singdirish har birimizning sharafli burchimizdir.",
    content_en="Preserving our cultural heritage, rich history, and literature, while inspiring patriotism and spirituality in future generations, is our noble responsibility.",
    category="culture",
    is_published=True,
    is_featured=True
)

print("Ashurova Sharofat Toshpo‘latovna profile and timeline updated successfully!")

