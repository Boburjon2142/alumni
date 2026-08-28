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
    name="Filologiya (Teleradiojurnalist / Filolog)"
)

# 2. Find or create Temirov profile
profile = AlumniProfile.objects.filter(full_name__icontains="Temirov").first()
if not profile:
    profile = AlumniProfile()

profile.full_name = "Xusan Temirov"
profile.slug = "xusan-temirov"
profile.faculty = faculty
profile.specialty = specialty
profile.graduation_year = 1982
profile.degree = "Bakalavr"
profile.position = "Taniqli teleradiojurnalist, faxriy media sohasi namoyandasi va publitsist"
profile.current_company = "O‘zbekiston milliy teleradiokompaniyasi tizimi"
profile.industry = "Jurnalistika va Teleradio"
profile.city = "Qarshi"
profile.country = "O‘zbekiston"
profile.bio = "Taniqli teleradiojurnalist, faxriy media sohasi namoyandasi va publitsist. Yosh jurnalistlar ustozi."
profile.biography_uz = "Xusan Temirov 1982-yilda Qarshi davlat pedagogika instituti (hozirgi Qarshi davlat universiteti) Filologiya fakultetini tamomlagan. 1982-yildan buyon Qashqadaryo viloyati va O‘zbekiston milliy teleradiokompaniyasi tizimida teleradiojurnalist, muharrir, ko‘rsatuv va eshittirishlar muallifi sifatida samarali faoliyat yuritgan. O‘zbekiston teleradiojurnalistikasi va viloyat media sohasiga ulkan hissa qo‘shgan faxriy ustoz."
profile.biography_en = "Xusan Temirov graduated from the Faculty of Philology at Karshi State Pedagogical Institute (now KarSU) in 1982. Since 1982, he has served with great acclaim as a TV/radio journalist, editor, and broadcast author across national and regional broadcasting networks."
profile.is_featured = True
profile.featured_order = 12
profile.is_published = True
profile.verification_status = AlumniProfile.Verification.VERIFIED
profile.visibility = AlumniProfile.Visibility.PUBLIC

# Setup avatar
avatar_src = Path("C:/Users/Omen/Desktop/KSU alumni/assetsss/Faxriylar/Temirov X..png")
media_target = Path("C:/Users/Omen/Desktop/KSU alumni/backend/media/alumni/xusan-temirov/xusan-temirov.png")
media_target.parent.mkdir(parents=True, exist_ok=True)
if avatar_src.exists():
    shutil.copyfile(avatar_src, media_target)
    profile.avatar = "alumni/xusan-temirov/xusan-temirov.png"
    # Also copy to frontend public
    frontend_target = Path("C:/Users/Omen/Desktop/KSU alumni/frontend/public/images/faxriylar/xusan-temirov.png")
    frontend_target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(avatar_src, frontend_target)

profile.save()

# Update FeaturedAlumni
FeaturedAlumni.objects.filter(alumni=profile).delete()
FeaturedAlumni.objects.create(
    alumni=profile,
    title="Faxriy bitiruvchi — Xusan Temirov",
    short_description="Taniqli teleradiojurnalist, faxriy media namoyandasi va publitsist.",
    display_order=12,
    is_active=True
)

# Clean achievements
Achievement.objects.filter(alumnus=profile).delete()
Achievement.objects.create(
    alumnus=profile,
    title="Faxriy teleradiojurnalist, viloyat teleradio sohasiga qo‘shgan munosib hissasi uchun",
    year=2020
)

# Setup timeline items
CareerTimelineItem.objects.filter(alumnus=profile).delete()
timeline_items = [
    {
        "year": 1982,
        "title": "1977 — 1982 yy. — Qarshi davlat pedagogika instituti (hozirgi Qarshi davlat universiteti) Filologiya fakulteti talabasi",
        "organization": "Qarshi davlat pedagogika instituti",
        "order": 1
    },
    {
        "year": 1982,
        "title": "1982-yildan boshlab — Qashqadaryo viloyati va O‘zbekiston milliy teleradiokompaniyasi tizimida teleradiojurnalist, muharrir, ko‘rsatuv va eshittirishlar muallifi",
        "organization": "MTRK tizimi",
        "order": 2
    },
    {
        "year": 2010,
        "title": "Faoliyati davomida — Viloyat teleradiokanalida ko‘p yillik samarali mehnati, tahliliy-publitsistik dasturlari hamda viloyat media sohasiga qo‘shgan hissasi orqali tanilgan teleradiojurnalist",
        "organization": "Viloyat teleradiokanali",
        "order": 3
    },
    {
        "year": 2024,
        "title": "Hozirda — Faxriy teleradiojurnalist, yosh jurnalistlar ustozi",
        "organization": "Media sohasi",
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
    content_uz="Efir madaniyati, samimiyat va so‘z qudratini his etish — jurnalistikaning jon tomiridir. Tinglovchi va tomoshabin mehrini qozonish uchun doimo fidoyi bo‘ling.",
    content_en="Broadcasting culture, sincerity, and mastering the power of language are the lifeblood of journalism. Dedicated service wins the audience's lasting trust.",
    category="media",
    is_published=True,
    is_featured=True
)

print("Xusan Temirov profile and timeline updated successfully!")

