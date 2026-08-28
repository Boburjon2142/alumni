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
faculty, _ = Faculty.objects.get_or_create(name="Matematika")
specialty, _ = Specialty.objects.get_or_create(
    faculty=faculty,
    name="Matematika (Matematika fani mutaxassisi / o‘qituvchisi)"
)

# 2. Find or create Muratov Shuxrat Kaxarovich profile
profile = AlumniProfile.objects.filter(full_name__icontains="Muratov").first()
if not profile:
    profile = AlumniProfile()

profile.full_name = "Muratov Shuxrat Kaxarovich"
profile.slug = "muratov-shuxrat-kaxarovich"
profile.faculty = faculty
profile.specialty = specialty
profile.graduation_year = None
profile.degree = "Bakalavr"
profile.position = "Yirik tadbirkor va ishlab chiqaruvchi, “Alp Texno Servis” XK rahbari / asoschisi"
profile.current_company = "“Alp Texno Servis” XK"
profile.industry = "Ishlab chiqarish va elektrotexnika"
profile.city = "Qarshi"
profile.country = "O‘zbekiston"
profile.bio = "Yirik tadbirkor va ishlab chiqaruvchi, “Alp Texno Servis” XK rahbari / asoschisi."
profile.biography_uz = "Muratov Shuxrat Kaxarovich Qarshi davlat universiteti Matematika fakultetida tahsil olgan. 2005-yilda Qarshi shahrida maishiy elektronika va texnika jihozlari ishlab chiqarishga ixtisoslashgan “Alp Texno Servis” korxonasiga asos solgan. Ko‘p yillardan buyon viloyatda zamonaviy elektrotexnika ishlab chiqarishni rivojlantirib kelmoqda. 2023-yilda tadbirkorlik sohasidagi alohida yutuqlari uchun Prezident farmoni bilan davlat mukofoti bilan taqdirlangan."
profile.biography_en = "Muratov Shuxrat Kaxarovich graduated in Mathematics from Karshi State University. In 2005, he founded 'Alp Texno Servis' private enterprise in Karshi, specializing in consumer electronics manufacturing. In 2023, he was honored with a State Award by Presidential Decree for outstanding entrepreneurial contributions."
profile.is_featured = True
profile.featured_order = 8
profile.is_published = True
profile.verification_status = AlumniProfile.Verification.VERIFIED
profile.visibility = AlumniProfile.Visibility.PUBLIC

# Setup avatar
avatar_src = Path("C:/Users/Omen/Desktop/KSU alumni/assetsss/Faxriylar/Muratov Sh..png")
media_target = Path("C:/Users/Omen/Desktop/KSU alumni/backend/media/alumni/muratov-shuxrat-kaxarovich/muratov-shuxrat-kaxarovich.png")
media_target.parent.mkdir(parents=True, exist_ok=True)
if avatar_src.exists():
    shutil.copyfile(avatar_src, media_target)
    profile.avatar = "alumni/muratov-shuxrat-kaxarovich/muratov-shuxrat-kaxarovich.png"
    # Also copy to frontend public
    frontend_target = Path("C:/Users/Omen/Desktop/KSU alumni/frontend/public/images/faxriylar/muratov-shuxrat-kaxarovich.png")
    frontend_target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(avatar_src, frontend_target)

profile.save()

# Update FeaturedAlumni
FeaturedAlumni.objects.filter(alumni=profile).delete()
FeaturedAlumni.objects.create(
    alumni=profile,
    title="Faxriy bitiruvchi — Muratov Shuxrat Kaxarovich",
    short_description="“Alp Texno Servis” XK rahbari va asoschisi, yirik ishlab chiqaruvchi.",
    display_order=8,
    is_active=True
)

# Achievements
Achievement.objects.filter(alumnus=profile).delete()
Achievement.objects.create(
    alumnus=profile,
    title="O‘zbekiston Respublikasi davlat mukofoti (2023-yil — Tadbirkorlik va ishlab chiqarish sohasidagi yutuqlari uchun)",
    year=2023
)

# Setup timeline items
CareerTimelineItem.objects.filter(alumnus=profile).delete()
timeline_items = [
    {
        "year": 2000,
        "title": "Qarshi davlat universiteti Matematika fakultetida oliy maʼlumot olgan",
        "organization": "Qarshi davlat universiteti",
        "order": 1
    },
    {
        "year": 2005,
        "title": "2005-yil — Qarshi shahrida maishiy elektronika va texnika jihozlari ishlab chiqarishga ixtisoslashgan “Alp Texno Servis” korxonasiga asos solgan",
        "organization": "“Alp Texno Servis” XK",
        "order": 2
    },
    {
        "year": 2023,
        "title": "2005-yildan hozirgacha — “Alp Texno Servis” xususiy korxonasi rahbari sifatida Qashqadaryo viloyatida ishlab chiqarish, elektrotexnika va tadbirkorlik sohasida faoliyat yuritib kelmoqda",
        "organization": "“Alp Texno Servis” XK",
        "order": 3
    },
    {
        "year": 2023,
        "title": "2023-yil — Tadbirkorlik va ishlab chiqarish sohasidagi yutuqlari uchun O‘zbekiston Respublikasi Prezidentining farmoni bilan davlat mukofoti bilan taqdirlangan",
        "organization": "Davlat mukofoti",
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
    content_uz="Tadbirkorlikda aniq hisob-kitob, yangilikka intilish va sifat eng muhim omildir. O‘z biznesingizda qat’iyatli bo‘ling.",
    content_en="In entrepreneurship, precise calculation, striving for innovation, and quality are key factors. Be persistent in your vision.",
    category="business",
    is_published=True,
    is_featured=True
)

print("Muratov Shuxrat Kaxarovich profile and timeline updated successfully!")

