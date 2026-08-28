import os
import shutil
from pathlib import Path
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.alumni.models import AlumniProfile, FeaturedAlumni

profile = AlumniProfile.objects.filter(full_name__icontains="Makayev").first()
if not profile:
    profile = AlumniProfile.objects.filter(full_name__icontains="Markayev").first()

if profile:
    profile.full_name = "Markayev Zafar Aliqulovich"
    profile.slug = "markayev-zafar-aliqulovich"
    profile.biography_uz = "Markayev Zafar Aliqulovich Qarshi davlat universiteti Jismoniy madaniyat fakultetini tamomlagan. O‘zbekiston Respublikasi Ichki ishlar organlari tizimida uzoq yillik namunali xizmat faoliyatini olib borib, Ichki ishlar vazirligi vazir o‘rinbosarining boshqaruv apparati bo‘limi boshlig‘i (podpolkovnik) lavozimida mas’uliyatli xizmat qilib kelmoqda."
    profile.biography_en = "Markayev Zafar Aliqulovich graduated from the Faculty of Physical Culture at Karshi State University. He serves with distinction in the Ministry of Internal Affairs of the Republic of Uzbekistan as Head of Department in the Deputy Minister's Executive Office with the rank of Lieutenant Colonel."

    # Update avatar paths
    avatar_src = Path("C:/Users/Omen/Desktop/KSU alumni/assetsss/Faxriylar/Makayev Z..png")
    media_target = Path("C:/Users/Omen/Desktop/KSU alumni/backend/media/alumni/markayev-zafar-aliqulovich/markayev-zafar-aliqulovich.png")
    media_target.parent.mkdir(parents=True, exist_ok=True)
    if avatar_src.exists():
        shutil.copyfile(avatar_src, media_target)
        profile.avatar = "alumni/markayev-zafar-aliqulovich/markayev-zafar-aliqulovich.png"
        frontend_target = Path("C:/Users/Omen/Desktop/KSU alumni/frontend/public/images/faxriylar/markayev-zafar-aliqulovich.png")
        frontend_target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(avatar_src, frontend_target)

    profile.save()

    # Update featured alumni title
    FeaturedAlumni.objects.filter(alumni=profile).update(
        title="Faxriy bitiruvchi — Markayev Zafar Aliqulovich"
    )

    print("Profile full_name updated to Markayev Zafar Aliqulovich successfully!")
else:
    print("Profile not found!")

