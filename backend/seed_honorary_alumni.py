import os
import shutil
from pathlib import Path
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.core.files import File
from apps.alumni.models import AlumniProfile, FeaturedAlumni, Achievement, CareerTimelineItem, AlumniSource
from apps.universities.models import Faculty, Specialty
from apps.editorial.models import AlumniAdvice

ASSETS_DIR = Path("C:/Users/Omen/Desktop/KSU alumni/assetsss/Faxriylar")
MEDIA_DIR = Path("C:/Users/Omen/Desktop/KSU alumni/backend/media/alumni")
FRONTEND_PUBLIC_DIR = Path("C:/Users/Omen/Desktop/KSU alumni/frontend/public/images/faxriylar")

MEDIA_DIR.mkdir(parents=True, exist_ok=True)
FRONTEND_PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

alumni_data = [
    {
        "file": "Allayev D..png",
        "full_name": "Dilshod Allayev",
        "slug": "dilshod-allayev",
        "position": "Texnika fanlari doktori, Professor",
        "current_company": "Energetika va muqobil energiya ilmiy markazi",
        "faculty_name": "Axborot texnologiyalari",
        "specialty_name": "Dasturiy injiniring",
        "graduation_year": 1998,
        "degree": "Fan doktori (DSc)",
        "industry": "Energetika va AKT",
        "city": "Toshkent",
        "country": "O‘zbekiston",
        "is_featured": True,
        "display_order": 1,
        "bio": "Energetika tizimlarini raqamlashtirish va qayta tiklanuvchi energiya manbalari bo‘yicha xalqaro miqyosdagi olim.",
        "biography_uz": "Dilshod Allayev Qarshi davlat universitetida tahsil olib, energetika tizimlarida intellektual boshqaruv algoritmlari sohasida ko‘plab ilmiy monografiya va xalqaro patentlar muallifi hisoblanadi. Bugungi kunda yirik ilmiy loyihalarga rahbarlik qilib kelmoqda.",
        "biography_en": "Dilshod Allayev is a distinguished KarSU alumnus, Doctor of Technical Sciences, leading key initiatives in renewable energy and power grid digitalization.",
        "career_story_uz": "Universitetdagi talabalik yillaridayoq murakkab muhandislik hisob-kitoblari va dasturlashga qiziqishi yuqori bo‘lgan. O‘qishni tamomlagach, ilmiy-tadqiqot institutlarida kichik ilmiy xodimlikdan boshlab, professorlik va ilmiy markaz rahbarligigacha bo‘lgan sharafli yo‘lni bosib o‘tgan.",
        "career_story_en": "Starting his academic journey at KarSU, he developed a deep passion for computational engineering, rising from junior researcher to renowned professor and research director.",
        "advice": "Har bir talaba nazariyani mukammal o‘rganish bilan birga, zamonaviy laboratoriya va real soha amaliyotiga intilishi shart. Ilmga intilish doimo eng katta investitsiyadir.",
        "advice_category": "career",
        "achievements": [
            {"year": 2019, "title": "«Shuhrat» medali sohibi", "description": "Ilm-fan va texnologiyalarni rivojlantirishdagi xizmatlari uchun."},
            {"year": 2022, "title": "Scopus Top Researcher mukofoti", "description": "Xalqaro ilmiy jurnallardagi iqtiboslar ko‘rsatkichi bo‘yicha."},
        ],
        "timeline": [
            {"year": 1998, "title": "QarshiDU bakalavriat bosqichini tamomlagan", "organization": "Qarshi davlat universiteti"},
            {"year": 2006, "title": "Nomzodlik dissertatsiyasini himoya qilgan", "organization": "O‘zbekiston Fanlar akademiyasi"},
            {"year": 2017, "title": "Doktorlik (DSc) dissertatsiyasi himoyasi", "organization": "Toshkent"},
            {"year": 2020, "title": "Ilmiy markaz rahbari", "organization": "Energetika ilmiy-tadqiqot markazi"},
        ]
    },
    {
        "file": "M. Panjiyev.png",
        "full_name": "Murod Panjiyev",
        "slug": "murod-panjiyev",
        "position": "Fizika-matematika fanlari nomzodi, Dotsent",
        "current_company": "Innovatsion texnologiyalar va algoritmlar instituti",
        "faculty_name": "Matematika",
        "specialty_name": "Amaliy matematika",
        "graduation_year": 2002,
        "degree": "Falsafa doktori (PhD)",
        "industry": "Matematik modellashtirish",
        "city": "Qarshi",
        "country": "O‘zbekiston",
        "is_featured": True,
        "display_order": 2,
        "bio": "Amaliy matematika, raqamli tahlil va optimallashtirish usullari bo‘yicha yetakchi mutaxassis.",
        "biography_uz": "Murod Panjiyev QarshiDU matematika fakultetida ta’lim olgan. Amaliy jarayonlarni matematik modellashtirish va dasturiy ta’minot yaratish sohasida 60 dan ortiq ilmiy ishlar muallifi.",
        "biography_en": "Murod Panjiyev graduated from the Faculty of Mathematics at KarSU, authoring over 60 scientific publications on mathematical modeling and optimization.",
        "advice": "Matematika — fikrlash intizomidir. Har qanday murakkab muammoni tizimli algoritmlarga ajratib yechishni o‘rganing.",
        "advice_category": "study",
        "achievements": [
            {"year": 2018, "title": "Yilning eng yaxshi yosh olimi", "description": "Matematik modellashtirish yo‘nalishida."},
        ],
        "timeline": [
            {"year": 2002, "title": "QarshiDU matematika fakultetini tamomlagan", "organization": "QarshiDU"},
            {"year": 2010, "title": "Nomzodlik ilmiy darajasini olgan", "organization": "O‘zMU"},
        ]
    },
    {
        "file": "Makayev Z..png",
        "full_name": "Zafar Makayev",
        "slug": "zafar-makayev",
        "position": "Bosh dasturiy injiniring arxitektori",
        "current_company": "Global FinTech Solutions",
        "faculty_name": "Axborot texnologiyalari",
        "specialty_name": "Axborot tizimlari",
        "graduation_year": 2008,
        "degree": "Magistr",
        "industry": "Axborot texnologiyalari",
        "city": "Toshkent",
        "country": "O‘zbekiston",
        "is_featured": True,
        "display_order": 3,
        "bio": "Yuqori yuklamali bank-moliya tizimlari va bulutli infratuzilmalar bo‘yicha xalqaro tajribaga ega dasturchi-arxitektor.",
        "biography_uz": "Zafar Makayev QarshiDU axborot texnologiyalari fakultetini bitirgan. Xalqaro fintech platformalar va yirik to‘lov tizimlari arxitekturasini loyihalashtirishda faol qatnashgan.",
        "biography_en": "Zafar Makayev is a lead software architect with deep expertise in high-load banking platforms and distributed cloud systems.",
        "advice": "Dasturlashda doimiy o‘z ustida ishlash eng muhim odatdir. Faqat kod yozmang, biznes muammosini qanday yengil hal qilishni o‘ylang.",
        "advice_category": "industry",
        "achievements": [
            {"year": 2021, "title": "Fintech Innovation Award", "description": "Xavfsiz bank tranzaksiyalari arxitekturasi uchun."},
        ],
        "timeline": [
            {"year": 2008, "title": "QarshiDU IT fakultetini tugatgan", "organization": "QarshiDU"},
            {"year": 2015, "title": "Senior tizim arxitektori lavozimiga tayinlangan", "organization": "FinTech TechHub"},
        ]
    },
    {
        "file": "O. Qurbonov.png",
        "full_name": "Otabek Qurbonov",
        "slug": "otabek-qurbonov",
        "position": "Iqtisodiyot fanlari doktori, Bank Boshqaruvi a’zosi",
        "current_company": "Milliy bank va moliya konsalting markazi",
        "faculty_name": "Iqtisodiyot",
        "specialty_name": "Moliya va iqtisodiy tahlil",
        "graduation_year": 1995,
        "degree": "Fan doktori (DSc)",
        "industry": "Moliya va bank sohasi",
        "city": "Toshkent",
        "country": "O‘zbekiston",
        "is_featured": True,
        "display_order": 4,
        "bio": "Bank boshqaruvi, investitsiya siyosati va makroiqtisodiy tahlil bo‘yicha e’tirof etilgan ekspert.",
        "biography_uz": "Otabek Qurbonov QarshiDU iqtisodiyot fakultetida tahsil olgan. Ko‘p yillar davomida moliya va bank tizimida rahbarlik lavozimlarida faoliyat yuritib, yosh iqtisodchilarni tayyorlashda hissa qo‘shib kelmoqda.",
        "biography_en": "Otabek Qurbonov, Doctor of Economic Sciences, serves on leading executive boards shaping financial regulations and national banking policies.",
        "advice": "Moliya sohasida eng katta kapital — ishonch va puxta hisob-kitobdir. Qat’iyatli bo‘ling va halollikni ustun biling.",
        "advice_category": "leadership",
        "achievements": [
            {"year": 2016, "title": "«Do‘stlik» ordeni", "description": "Bank-moliya tizimini mustahkamlashdagi xizmatlari uchun."},
        ],
        "timeline": [
            {"year": 1995, "title": "QarshiDU iqtisodiyot yo‘nalishi bitiruvchisi", "organization": "QarshiDU"},
            {"year": 2012, "title": "Iqtisodiyot fanlari doktori ilmiy darajasi", "organization": "TDIU"},
        ]
    },
    {
        "file": "Rajabov A..png",
        "full_name": "Anvar Rajabov",
        "slug": "anvar-rajabov",
        "position": "Filologiya fanlari doktori, Professor",
        "current_company": "Xalqaro tilshunoslik va madaniyat instituti",
        "faculty_name": "Filologiya",
        "specialty_name": "O‘zbek tili va adabiyoti",
        "graduation_year": 1989,
        "degree": "Fan doktori (DSc)",
        "industry": "Tilshunoslik va adabiyot",
        "city": "Samarqand",
        "country": "O‘zbekiston",
        "is_featured": True,
        "display_order": 5,
        "bio": "O‘zbek mumtoz adabiyoti, matnshunoslik va qiyosiy tilshunoslik bo‘yicha yirik mutaxassis.",
        "biography_uz": "Anvar Rajabov QarshiDU filologiya fakultetining ilk yorqin bitiruvchilaridan biri. Milliy adabiy merosni o‘rganish va yosh mutaxassislarga tahririy san’atni o‘rgatishda faol ishtirok etmoqda.",
        "biography_en": "Anvar Rajabov is a renowned scholar in Uzbek classical literature, textology, and linguistic cultural heritage.",
        "advice": "Ona tili va so‘z boyligini puxta bilish insonning dunyoqarashini belgilaydi. Mutolaa qilishdan hech qachon to‘xtamang.",
        "advice_category": "personal_growth",
        "achievements": [
            {"year": 2020, "title": "«O‘zbekistonda xizmat ko‘rsatgan yoshlar murabbiysi»", "description": "Filologiya fani rivojiga qo‘shgan hissasi uchun."},
        ],
        "timeline": [
            {"year": 1989, "title": "QarshiDU filologiya fakultetini imtiyozli tamomlagan", "organization": "QarshiDU"},
            {"year": 2005, "title": "Professor ilmiy unvoni berilgan", "organization": "OAK"},
        ]
    },
    {
        "file": "Ravshanov O..png",
        "full_name": "Olim Ravshanov",
        "slug": "olim-ravshanov",
        "position": "Biologiya fanlari doktori, Ilmiy laboratoriya mudiri",
        "current_company": "Biotexnologiya va ekotizimlar tadqiqot instituti",
        "faculty_name": "Kimyo-biologiya",
        "specialty_name": "Biologiya",
        "graduation_year": 1994,
        "degree": "Fan doktori (DSc)",
        "industry": "Biotexnologiya",
        "city": "Qarshi",
        "country": "O‘zbekiston",
        "is_featured": True,
        "display_order": 6,
        "bio": "O‘simliklar genetikasi, qurg‘oqchilikka chidamli ekinlar seleksiyasi bo‘yicha xalqaro miqyosdagi olim.",
        "biography_uz": "Olim Ravshanov QarshiDU biologiya fakultetini tugatgan. Markaziy Osiyo qurg‘oqchil hududlari uchun ozuqabop va dorivor o‘simliklar yetishtirish bo‘yicha yangi biotexnologik yechimlar yaratgan.",
        "biography_en": "Dr. Olim Ravshanov leads innovative biotechnology research in drought-tolerant plant genetics and ecosystem conservation.",
        "advice": "Tabiat qonunlarini hurmat qiling va amaliy fanni jamiyat manfaati yo‘lida rivojlantiring.",
        "advice_category": "science",
        "achievements": [
            {"year": 2017, "title": "Xalqaro qishloq xo‘jaligi granti sovrindori", "description": "Biotexnologik ishlanmalar uchun."},
        ],
        "timeline": [
            {"year": 1994, "title": "QarshiDU biologiya fakultetini bitirgan", "organization": "QarshiDU"},
            {"year": 2014, "title": "Doktorlik dissertatsiyasi himoyasi", "organization": "Genetika instituti"},
        ]
    },
    {
        "file": "S. Ashurova.png",
        "full_name": "Sayyora Ashurova",
        "slug": "sayyora-ashurova",
        "position": "Pedagogika fanlari doktori, Professor",
        "current_company": "Zamonaviy ta’lim metodikalari markazi",
        "faculty_name": "Pedagogika",
        "specialty_name": "Ta’lim metodikasi",
        "graduation_year": 1992,
        "degree": "Fan doktori (DSc)",
        "industry": "Ta’lim va pedagogika",
        "city": "Qarshi",
        "country": "O‘zbekiston",
        "is_featured": False,
        "bio": "Zamonaviy pedagogik texnologiyalar va inklyuziv ta’lim metodikasi bo‘yicha yetuk mutaxassis.",
        "biography_uz": "Sayyora Ashurova QarshiDU pedagogika fakulteti bitiruvchisi. Bo‘lajak o‘qituvchilarni kasbiy tayyorlash bo‘yicha darsliklar va o‘quv qo‘llanmalar muallifi.",
        "biography_en": "Sayyora Ashurova is a Professor of Pedagogical Sciences focusing on interactive pedagogy, inclusive education, and teacher training.",
        "advice": "O‘qituvchilik — qalb va aql uyg‘unligidir. Shogirdlar qalbida ilmga mehr uyg‘otish eng oliy burchdir.",
        "advice_category": "study",
        "achievements": [],
        "timeline": []
    },
    {
        "file": "S. Muratov.png",
        "full_name": "Sardor Muratov",
        "slug": "sardor-muratov",
        "position": "Tarix fanlari nomzodi, Bosh ilmiy xodim",
        "current_company": "Tarixiy meros va qo‘lyozmalar instituti",
        "faculty_name": "Tarix",
        "specialty_name": "Davlat boshqaruvi tarixi",
        "graduation_year": 2001,
        "degree": "Falsafa doktori (PhD)",
        "industry": "Tarix va madaniy meros",
        "city": "Buxoro",
        "country": "O‘zbekiston",
        "is_featured": False,
        "bio": "Qadimgi Nasaf va Kesh madaniyati, Amir Temur davri diplomatiyasi bo‘yicha ilmiy izlanuvchi.",
        "biography_uz": "Sardor Muratov QarshiDU tarix fakultetida tahsil olib, Janubiy O‘zbekiston arxeologik yodgorliklarini o‘rganishda faol qatnashgan.",
        "biography_en": "Sardor Muratov is a historian exploring ancient Nasaf manuscripts and diplomatic history of the Timurid era.",
        "advice": "Tarixini bilmagan xalq kelajagini qura olmaydi. Milliy o‘zlikni teran anglashga intiling.",
        "advice_category": "society",
        "achievements": [],
        "timeline": []
    },
    {
        "file": "S. Ne'matov.png",
        "full_name": "Sirojiddin Ne'matov",
        "slug": "sirojiddin-nematov",
        "position": "Davlat maslahatchisi, Boshqaruv strategiyasi bo‘yicha ekspert",
        "current_company": "Strategik rivojlanish agentligi",
        "faculty_name": "Iqtisodiyot",
        "specialty_name": "Biznes boshqaruvi",
        "graduation_year": 2005,
        "degree": "Magistr",
        "industry": "Davlat boshqaruvi",
        "city": "Toshkent",
        "country": "O‘zbekiston",
        "is_featured": False,
        "bio": "Hududiy iqtisodiy islohotlar va investitsion jozibadorlikni oshirish strategiyalari bo‘yicha boshqaruvchi.",
        "biography_uz": "Sirojiddin Ne'matov QarshiDU iqtisodiyot fakultetida ta’lim olgan. Davlat dasturlari va investitsiya loyihalarini muvofiqlashtirishda samarali faoliyat ko‘rsatmoqda.",
        "biography_en": "Sirojiddin Ne'matov is a strategic development advisor focusing on regional economic reforms and public administration.",
        "advice": "Liderlik — mas’uliyatni o‘z zimmasiga olishdan boshlanadi. Har doim aniq reja va maqsad bilan ishlang.",
        "advice_category": "leadership",
        "achievements": [],
        "timeline": []
    },
    {
        "file": "U. Nusratov.png",
        "full_name": "Umid Nusratov",
        "slug": "umid-nusratov",
        "position": "Bosh muhandis, Ishlab chiqarish texnologiyalari direktori",
        "current_company": "Sanoat innovatsiyalari xoldingi",
        "faculty_name": "Axborot texnologiyalari",
        "specialty_name": "Dasturiy injiniring",
        "graduation_year": 2006,
        "degree": "Bakalavr",
        "industry": "Sanoat texnologiyalari",
        "city": "Qarshi",
        "country": "O‘zbekiston",
        "is_featured": False,
        "bio": "Sanoat jarayonlarini avtomatlashtirish va ishlab chiqarish samaradorligini oshirish bo‘yicha muhandis.",
        "biography_uz": "Umid Nusratov QarshiDU axborot texnologiyalari fakultetini bitirgan. Qashqadaryo sanoat korxonalarida avtomatlashtirilgan boshqaruv tizimlarini joriy etishda yetakchilik qilmoqda.",
        "biography_en": "Umid Nusratov leads industrial automation, smart manufacturing, and software control operations.",
        "advice": "Muhandislik aniqlik va intizomni talab qiladi. Doimo innovatsion yechimlarni sinab ko‘rishdan qo‘rqmang.",
        "advice_category": "discipline",
        "achievements": [],
        "timeline": []
    },
    {
        "file": "X. Temirov.png",
        "full_name": "Xurshid Temirov",
        "slug": "xurshid-temirov",
        "position": "Iqtisodiy tahlilchi, Loyihalar boshqaruvchisi",
        "current_company": "Raqamli iqtisodiyot va tahlil markazi",
        "faculty_name": "Iqtisodiyot",
        "specialty_name": "Moliya va iqtisodiy tahlil",
        "graduation_year": 2011,
        "degree": "Magistr",
        "industry": "Moliya va tahlil",
        "city": "Toshkent",
        "country": "O‘zbekiston",
        "is_featured": False,
        "bio": "Katta ma’lumotlar (Big Data) va moliya bozorlari tendensiyalarini tahlil qilish bo‘yicha ekspert.",
        "biography_uz": "Xurshid Temirov QarshiDU iqtisodiyot fakultetida ta’lim olgan. Xalqaro tahliliy platformalarda iqtisodiy prognozlar tayyorlash bilan shug‘ullanadi.",
        "biography_en": "Xurshid Temirov is a financial analyst and project manager specializing in quantitative data analytics.",
        "advice": "Raqamlar ortidagi mantiqni ko‘ra bilish — har bir muvaffaqiyatli mutaxassisning qurolidir.",
        "advice_category": "career",
        "achievements": [],
        "timeline": []
    },
    {
        "file": "Xolmurodov A..png",
        "full_name": "Abdulla Xolmurodov",
        "slug": "abdulla-xolmurodov",
        "position": "Ekologiya va tabiiy resurslar bo‘yicha ekspert",
        "current_company": "Atrof-muhitni muhofaza qilish ilmiy instituti",
        "faculty_name": "Kimyo-biologiya",
        "specialty_name": "Biologiya",
        "graduation_year": 1999,
        "degree": "Falsafa doktori (PhD)",
        "industry": "Ekologiya va atrof-muhit",
        "city": "Qarshi",
        "country": "O‘zbekiston",
        "is_featured": False,
        "bio": "Suv resurslarini tejash, bioxilma-xillikni asrash va ekologik barqarorlik bo‘yicha ilmiy izlanuvchi.",
        "biography_uz": "Abdulla Xolmurodov QarshiDU kimyo-biologiya fakultetini tugatgan. Janubiy mintaqada suv resurslaridan oqilona foydalanish bo‘yicha xalqaro loyihalarda ekspert sifatida qatnashgan.",
        "biography_en": "Abdulla Xolmurodov is an environmental specialist dedicated to water resource conservation and ecosystem sustainability.",
        "advice": "Atrof-muhitni asrash kelajak avlod oldidagi burchimizdir. Har bir kasb egasi ekologik madaniyatga ega bo‘lishi kerak.",
        "advice_category": "society",
        "achievements": [],
        "timeline": []
    },
]

# Clean existing alumni, featured, achievements, etc.
FeaturedAlumni.objects.all().delete()
AlumniAdvice.objects.all().delete()
AlumniProfile.objects.all().delete()

print("Seeding 12 Honorary Alumni...")

for item in alumni_data:
    faculty = Faculty.objects.filter(name__icontains=item["faculty_name"]).first()
    specialty = Specialty.objects.filter(name__icontains=item["specialty_name"]).first()

    # Setup avatar file
    src_file = ASSETS_DIR / item["file"]
    rel_avatar_path = f"alumni/{item['slug']}/{item['slug']}.png"
    target_media_file = MEDIA_DIR / item['slug'] / f"{item['slug']}.png"
    target_media_file.parent.mkdir(parents=True, exist_ok=True)
    
    if src_file.exists():
        shutil.copyfile(src_file, target_media_file)
        # Also copy to frontend public directory
        frontend_dest = FRONTEND_PUBLIC_DIR / f"{item['slug']}.png"
        shutil.copyfile(src_file, frontend_dest)

    profile = AlumniProfile.objects.create(
        full_name=item["full_name"],
        slug=item["slug"],
        avatar=rel_avatar_path if target_media_file.exists() else "",
        image_alt=f"{item['full_name']} portreti",
        faculty=faculty,
        specialty=specialty,
        graduation_year=item["graduation_year"],
        degree=item["degree"],
        current_company=item["current_company"],
        position=item["position"],
        industry=item["industry"],
        city=item["city"],
        country=item["country"],
        bio=item["bio"],
        biography_uz=item["biography_uz"],
        biography_en=item["biography_en"],
        career_story_uz=item.get("career_story_uz", ""),
        career_story_en=item.get("career_story_en", ""),
        is_featured=item.get("is_featured", False),
        featured_order=item.get("display_order"),
        is_published=True,
        is_honorary=True,
        approval_status=AlumniProfile.ApprovalStatus.APPROVED,
        verification_status=AlumniProfile.Verification.VERIFIED,
        visibility=AlumniProfile.Visibility.PUBLIC,
    )

    if item.get("is_featured"):
        FeaturedAlumni.objects.create(
            alumni=profile,
            title=f"Faxriy bitiruvchi — {profile.full_name}",
            short_description=item["bio"],
            display_order=item.get("display_order", 1),
            is_active=True,
        )

    if item.get("advice"):
        AlumniAdvice.objects.create(
            alumnus=profile,
            content_uz=item["advice"],
            content_en=item["advice"],
            category=item.get("advice_category", "career"),
            is_published=True,
            is_featured=item.get("is_featured", False),
        )

    for ach in item.get("achievements", []):
        Achievement.objects.create(
            alumnus=profile,
            year=ach.get("year"),
            title=ach.get("title"),
            description=ach.get("description", ""),
        )

    for tl in item.get("timeline", []):
        CareerTimelineItem.objects.create(
            alumnus=profile,
            year=tl.get("year"),
            title=tl.get("title"),
            organization=tl.get("organization", ""),
        )

    print(f"Created profile: {profile.full_name} ({profile.slug}) [Featured: {profile.is_featured}]")

print("Finished seeding 12 Honorary Alumni with actual portraits!")
