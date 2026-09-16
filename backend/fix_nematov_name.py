import os
import shutil
from pathlib import Path
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.alumni.models import AlumniProfile, FeaturedAlumni

profile = AlumniProfile.objects.filter(full_name__icontains="Nematov").first()
if not profile:
    profile = AlumniProfile.objects.filter(full_name__icontains="Ne'matov").first()

if profile:
    profile.full_name = "Nematov Sherzod Qalandarovich"
    profile.slug = "nematov-sherzod-qalandarovich"
    profile.biography_uz = "Nematov Sherzod Qalandarovich 2005-yilda Qarshi davlat universiteti Fizika-texnika fakultetini tamomlagan. Texnika fanlari doktori (DSc), professor. QarshiDUda ilmiy-pedagogik faoliyatini boshlab, dotsent, kafedra mudiri, fakultet dekani hamda oliy ta’lim muassasalarida ilmiy ishlar va innovatsiyalar bo‘yicha prorektor vazifalarida xizmat qilgan. 2023-yildan buyon Qarshi davlat texnika universiteti (Qarshi muhandislik-iqtisodiyot instituti) rektori lavozimida samarali faoliyat yuritib kelmoqda."
    profile.biography_en = "Nematov Sherzod Qalandarovich graduated from the Faculty of Physics and Technology at Karshi State University in 2005. He holds a DSc degree and Professor title in Technical Sciences, and currently serves as Rector of Karshi State Technical University."

    # Update avatar paths
    avatar_src = Path("C:/Users/Omen/Desktop/KSU alumni/assetsss/Faxriylar/Ne'matov S..png")
    if not avatar_src.exists():
        avatar_src = Path("C:/Users/Omen/Desktop/KSU alumni/assetsss/Faxriylar/Nematov S..png")

    media_target = Path("C:/Users/Omen/Desktop/KSU alumni/backend/media/alumni/nematov-sherzod-qalandarovich/nematov-sherzod-qalandarovich.png")
    media_target.parent.mkdir(parents=True, exist_ok=True)
    if avatar_src.exists():
        shutil.copyfile(avatar_src, media_target)
        profile.avatar = "alumni/nematov-sherzod-qalandarovich/nematov-sherzod-qalandarovich.png"
        frontend_target = Path("C:/Users/Omen/Desktop/KSU alumni/frontend/public/images/faxriylar/nematov-sherzod-qalandarovich.png")
        frontend_target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(avatar_src, frontend_target)

    profile.save()

    # Update featured alumni title
    FeaturedAlumni.objects.filter(alumni=profile).update(
        title="Faxriy bitiruvchi — Nematov Sherzod Qalandarovich"
    )

    print("Profile full_name updated to Nematov Sherzod Qalandarovich successfully!")
else:
    print("Profile not found!")

