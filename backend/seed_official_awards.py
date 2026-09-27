import os
import sys
import django

# Setup django environment if executed standalone
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
if __name__ == "__main__":
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    django.setup()

from apps.alumni.models import RecognitionTitle, AlumniRecognition

OFFICIAL_AWARDS = [
    {
        "slug": "qardu-iftixori",
        "name": "QarDU iftixori",
        "category": RecognitionTitle.Category.SUPREME_HONOR,
        "recognition_type": RecognitionTitle.RecognitionType.SUPREME_HONOR,
        "description": "Universitetning bitiruvchiga beradigan eng oliy e’tirofi va faxriy unvoni.",
        "eligibility_summary": "Bitirganiga kamida 15 yil to‘lgan, respublika yoki xalqaro miqyosda yuksak e’tirof etilgan yutuqlarga ega, universitet rivojiga ulkan hissa qo‘shgan bitiruvchilar uchun (marhum bitiruvchilarga ham berilishi mumkin).",
        "symbol_name": "crown",
        "icon": "crown",
        "has_levels": False,
        "annual_quota": 3,
        "term_years": None,
        "order": 1,
        "is_active": True,
    },
    {
        "slug": "ilm-fan-fidoyisi",
        "name": "Ilm-fan fidoyisi",
        "category": RecognitionTitle.Category.ACHIEVEMENT_NOMINATION,
        "recognition_type": RecognitionTitle.RecognitionType.NOMINATION,
        "description": "Ilmiy faoliyat va ilm-fanga qo‘shilgan katta hissa uchun beriladigan e’tirof.",
        "eligibility_summary": "Ilmiy tadqiqotlar, monografiyalar, xalqaro e’tirof etilgan ilmiy jurnallardagi maqolalar, ilmiy kashfiyotlar va yangi ilmiy maktab yaratganlik uchun.",
        "symbol_name": "astrolabe",
        "icon": "compass",
        "has_levels": False,
        "annual_quota": 3,
        "term_years": None,
        "order": 2,
        "is_active": True,
    },
    {
        "slug": "ziyo-mashali",
        "name": "Ziyo mash’ali",
        "category": RecognitionTitle.Category.ACHIEVEMENT_NOMINATION,
        "recognition_type": RecognitionTitle.RecognitionType.NOMINATION,
        "description": "Ta’lim, pedagogika va shogird tarbiyalashdagi yuksak natijalar uchun.",
        "eligibility_summary": "Samarali pedagogik faoliyat, zamonaviy darslik va qo‘llanmalar yaratish hamda respublika va xalqaro miqyosdagi shogirdlarni tarbiyalash uchun.",
        "symbol_name": "torch",
        "icon": "flame",
        "has_levels": False,
        "annual_quota": 3,
        "term_years": None,
        "order": 3,
        "is_active": True,
    },
    {
        "slug": "yuksak-parvoz",
        "name": "Yuksak parvoz",
        "category": RecognitionTitle.Category.ACHIEVEMENT_NOMINATION,
        "recognition_type": RecognitionTitle.RecognitionType.NOMINATION,
        "description": "Kasbiy faoliyatda yuksak natijalarga erishgan bitiruvchilar uchun.",
        "eligibility_summary": "Davlat xizmati, biznes, ishlab chiqarish yoki xalqaro tashkilotlarda erishgan e’tirofga loyiq aniq natijalar uchun (lavozimning o‘zi emas, natija baholanadi).",
        "symbol_name": "wing",
        "icon": "trending-up",
        "has_levels": False,
        "annual_quota": 3,
        "term_years": None,
        "order": 4,
        "is_active": True,
    },
    {
        "slug": "ibrat",
        "name": "Ibrat",
        "category": RecognitionTitle.Category.ACHIEVEMENT_NOMINATION,
        "recognition_type": RecognitionTitle.RecognitionType.NOMINATION,
        "description": "Hayot yo‘li, halolligi, mehnatsevarligi, jamoatchilik faolligi va yoshlarga o‘rnak bo‘lishi uchun.",
        "eligibility_summary": "Universitet talabalari va jamoatchilik orasida o‘tkaziladigan so‘rovnoma va ovoz berish asosida aniqlanadigan ibratli faoliyat.",
        "symbol_name": "example",
        "icon": "heart-handshake",
        "has_levels": False,
        "annual_quota": 3,
        "term_years": None,
        "order": 5,
        "is_active": True,
    },
    {
        "slug": "istiqbol-yoshlari",
        "name": "Istiqbol yoshlari",
        "category": RecognitionTitle.Category.ACHIEVEMENT_NOMINATION,
        "recognition_type": RecognitionTitle.RecognitionType.NOMINATION,
        "description": "35 yoshgacha bo‘lgan va qisqa vaqt ichida sezilarli natijaga erishgan yosh bitiruvchilar uchun.",
        "eligibility_summary": "Ilm-fan, biznes, madaniyat, axborot texnologiyalari yoki davlat boshqaruvida yorqin yutuqlarga erishgan yosh bitiruvchilar.",
        "symbol_name": "rocket",
        "icon": "rocket",
        "has_levels": False,
        "annual_quota": 3,
        "term_years": None,
        "order": 6,
        "is_active": True,
    },
    {
        "slug": "ezgulik",
        "name": "Ezgulik",
        "category": RecognitionTitle.Category.ACHIEVEMENT_NOMINATION,
        "recognition_type": RecognitionTitle.RecognitionType.NOMINATION,
        "description": "Xayriya, volontyorlik va ijtimoiy loyihalar orqali jamiyatga foyda keltirayotgan bitiruvchilar uchun.",
        "eligibility_summary": "Ijtimoiy himoyaga muhtoj qatlamlarga beg‘araz yordam, muruvvat tadbirlari va muhim ijtimoiy tashabbuslarni amalga oshirganlik uchun.",
        "symbol_name": "heart",
        "icon": "heart",
        "has_levels": False,
        "annual_quota": 3,
        "term_years": None,
        "order": 7,
        "is_active": True,
    },
    {
        "slug": "oliyhimmat",
        "name": "Oliyhimmat",
        "category": RecognitionTitle.Category.UNIVERSITY_CONTRIBUTION,
        "recognition_type": RecognitionTitle.RecognitionType.NOMINATION,
        "description": "Universitetga rasmiy homiylik qilgan bitiruvchilar yoki ular rahbarlik qiladigan tashkilotlar uchun.",
        "eligibility_summary": "Universitet moddiy-texnik bazasi, infratuzilmasi va ta’lim sifatini oshirishga yo‘naltirilgan rasmiy homiylik ko‘magi (Bronza, Kumush va Oltin darajalari).",
        "symbol_name": "coins",
        "icon": "coins",
        "has_levels": True,
        "annual_quota": None,
        "term_years": None,
        "order": 8,
        "is_active": True,
    },
    {
        "slug": "istedodlar-tayanchi",
        "name": "Iste’dodlar tayanchi",
        "category": RecognitionTitle.Category.UNIVERSITY_CONTRIBUTION,
        "recognition_type": RecognitionTitle.RecognitionType.NOMINATION,
        "description": "Talabalarga grant, stipendiya, kontrakt yoki xorijiy stajirovka imkoniyatlarini moliyalashtirgan bitiruvchilar uchun.",
        "eligibility_summary": "QarDU talabalarini moddiy va ma’naviy qo‘llab-quvvatlash, ularning ta’lim olishi va xalqaro tajriba orttirishiga investitsiya kiritganlik uchun.",
        "symbol_name": "seedling",
        "icon": "sprout",
        "has_levels": False,
        "annual_quota": None,
        "term_years": None,
        "order": 9,
        "is_active": True,
    },
    {
        "slug": "marifat-hadyasi",
        "name": "Ma’rifat hadyasi",
        "category": RecognitionTitle.Category.UNIVERSITY_CONTRIBUTION,
        "recognition_type": RecognitionTitle.RecognitionType.NOMINATION,
        "description": "Universitet Axborot-resurs markazi fondiga muhim hissa qo‘shgan bitiruvchilar uchun.",
        "eligibility_summary": "Kutubxona fondiga qimmatli ilmiy adabiyotlar, darsliklar, elektron ma’lumotlar bazalariga obunalar taqdim etganlik uchun.",
        "symbol_name": "book",
        "icon": "book-open",
        "has_levels": False,
        "annual_quota": None,
        "term_years": None,
        "order": 10,
        "is_active": True,
    },
    {
        "slug": "yolchiroq",
        "name": "Yo‘lchiroq",
        "category": RecognitionTitle.Category.UNIVERSITY_CONTRIBUTION,
        "recognition_type": RecognitionTitle.RecognitionType.NOMINATION,
        "description": "Talabalarni kasbga yo‘naltirish va mentorlik faoliyati uchun.",
        "eligibility_summary": "Universitet talabalariga muntazam mentorlik qilish, mahorat darslari, seminar-treninglar o‘tish va karyera bo‘yicha yo‘l-yo‘riq ko‘rsatish.",
        "symbol_name": "lamp",
        "icon": "lightbulb",
        "has_levels": False,
        "annual_quota": None,
        "term_years": None,
        "order": 11,
        "is_active": True,
    },
    {
        "slug": "kelajakka-koprik",
        "name": "Kelajakka ko‘prik",
        "category": RecognitionTitle.Category.UNIVERSITY_CONTRIBUTION,
        "recognition_type": RecognitionTitle.RecognitionType.NOMINATION,
        "description": "QarDU bitiruvchilarini ish bilan ta’minlashga yordam bergan bitiruvchilar uchun.",
        "eligibility_summary": "Bitiruvchilarni o‘z tashkilotiga ishga qabul qilish, amaliyot o‘tash bazalarini yaratish va hamkorlik shartnomalari tuzishdagi faollik.",
        "symbol_name": "bridge",
        "icon": "briefcase",
        "has_levels": False,
        "annual_quota": None,
        "term_years": None,
        "order": 12,
        "is_active": True,
    },
    {
        "slug": "ona-dargoh-qadrdoni",
        "name": "Ona dargoh qadrdoni",
        "category": RecognitionTitle.Category.UNIVERSITY_CONTRIBUTION,
        "recognition_type": RecognitionTitle.RecognitionType.NOMINATION,
        "description": "Universitet hayotidagi muntazam ishtirok uchun.",
        "eligibility_summary": "Universitet tadbirlarida muntazam qatnashish, ma’ruza qilish yoki hakamlik vazifalarini bajarish (2 yil ichida 15 ball).",
        "symbol_name": "building",
        "icon": "building-2",
        "has_levels": False,
        "annual_quota": None,
        "term_years": None,
        "order": 13,
        "is_active": True,
    },
    {
        "slug": "qardu-elchisi",
        "name": "QarDU elchisi",
        "category": RecognitionTitle.Category.UNIVERSITY_CONTRIBUTION,
        "recognition_type": RecognitionTitle.RecognitionType.TERM_STATUS,
        "description": "Universitet nufuzini respublika va xalqaro miqyosda munosib targ‘ib qiluvchi elchi maqomi.",
        "eligibility_summary": "O‘z sohasi va xalqaro doiralarda QarDU brendi va bitiruvchilar salohiyatini faol namoyon etish (2 yillik muddatli maqom).",
        "symbol_name": "globe",
        "icon": "globe",
        "has_levels": False,
        "annual_quota": None,
        "term_years": 2,
        "order": 14,
        "is_active": True,
    },
    {
        "slug": "kumush-bitiruvchi",
        "name": "Kumush bitiruvchi",
        "category": RecognitionTitle.Category.TRADITIONAL_STATUS,
        "recognition_type": RecognitionTitle.RecognitionType.TRADITIONAL_STATUS,
        "description": "Bitirganiga 25 yil to‘lgan bitiruvchilar uchun an’anaviy maqom.",
        "eligibility_summary": "Qarshi davlat universitetini tamomlaganiga 25 yil to‘lgan va o‘z sohasida hurmat qozongan bitiruvchilar.",
        "symbol_name": "medal-silver",
        "icon": "medal",
        "has_levels": False,
        "annual_quota": None,
        "term_years": None,
        "order": 15,
        "is_active": True,
    },
    {
        "slug": "oltin-bitiruvchi",
        "name": "Oltin bitiruvchi",
        "category": RecognitionTitle.Category.TRADITIONAL_STATUS,
        "recognition_type": RecognitionTitle.RecognitionType.TRADITIONAL_STATUS,
        "description": "Bitirganiga 50 yil to‘lgan bitiruvchilar uchun an’anaviy faxriy maqom.",
        "eligibility_summary": "Qarshi davlat universitetini tamomlaganiga 50 yil to‘lgan, universitet tarixi va an’analarining jonli xazinasi bo‘lgan faxriy bitiruvchilar.",
        "symbol_name": "medal-gold",
        "icon": "trophy",
        "has_levels": False,
        "annual_quota": None,
        "term_years": None,
        "order": 16,
        "is_active": True,
    },
    {
        "slug": "qardu-sulolasi",
        "name": "QarDU sulolasi",
        "category": RecognitionTitle.Category.TRADITIONAL_STATUS,
        "recognition_type": RecognitionTitle.RecognitionType.TRADITIONAL_STATUS,
        "description": "Bir nechta avlodi QarDUni tamomlagan ilmli oilalar va sulolalar e’tirofi.",
        "eligibility_summary": "Bir oiladan kamida 2 avlod yoki kamida 3 nafar oila a’zosi Qarshi davlat universitetini muvaffaqiyatli tamomlagan bo‘lishi lozim.",
        "symbol_name": "users",
        "icon": "users",
        "has_levels": False,
        "annual_quota": None,
        "term_years": None,
        "order": 17,
        "is_active": True,
    },
]

DEMO_SLUGS_TO_REMOVE = {
    "faxriy-ustoz",
    "karyera-koprigi",
    "faol-bitiruvchi",
    "universitet-fidoyisi",
    "innovatsiya-yetakchisi",
    "tadbirkor-bitiruvchi",
    "yil-bitiruvchisi",
}

def seed_official_awards():
    print("--- QarDU Official Recognition System Seed ---")
    
    # 1. Clean up demo assignments and demo titles that are no longer part of regulation
    # Remove assignments linked to legacy demo titles
    demo_titles = RecognitionTitle.objects.filter(slug__in=DEMO_SLUGS_TO_REMOVE)
    demo_title_count = demo_titles.count()
    if demo_title_count > 0:
        demo_assignments = AlumniRecognition.objects.filter(title__in=demo_titles)
        demo_assign_count = demo_assignments.count()
        demo_assignments.delete()
        demo_titles.delete()
        print(f"Removed {demo_title_count} demo titles and {demo_assign_count} unapproved demo assignments.")

    # 2. Also clear placeholder demo assignments on remaining titles (e.g., ilm-fan-fidoyisi) if any
    # (Per rule: real awards exist, but no fake laureates)
    demo_remaining_assignments = AlumniRecognition.objects.filter(justification="", approved_by__isnull=True)
    if demo_remaining_assignments.exists():
        c = demo_remaining_assignments.count()
        demo_remaining_assignments.delete()
        print(f"Removed {c} unapproved demo assignment records.")

    # 3. Create or update official recognition titles (idempotent)
    created_count = 0
    updated_count = 0
    for data in OFFICIAL_AWARDS:
        slug = data["slug"]
        title_obj, created = RecognitionTitle.objects.update_or_create(
            slug=slug,
            defaults={
                "name": data["name"],
                "category": data["category"],
                "recognition_type": data["recognition_type"],
                "description": data["description"],
                "eligibility_summary": data["eligibility_summary"],
                "symbol_name": data["symbol_name"],
                "icon": data["icon"],
                "has_levels": data["has_levels"],
                "annual_quota": data["annual_quota"],
                "term_years": data["term_years"],
                "order": data["order"],
                "is_active": data["is_active"],
            }
        )
        if created:
            created_count += 1
        else:
            updated_count += 1

    total_titles = RecognitionTitle.objects.count()
    print(f"Seeded official awards: {created_count} created, {updated_count} updated. Total active titles: {total_titles}.")
    
    # Invalidate cache
    from common.cache_utils import invalidate_cache_prefix
    invalidate_cache_prefix("api:recognition_titles")
    invalidate_cache_prefix("api:alumni")
    invalidate_cache_prefix("api:impact")

if __name__ == "__main__":
    seed_official_awards()
