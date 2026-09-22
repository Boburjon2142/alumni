import os
import django
import sys

sys.stdout.reconfigure(encoding='utf-8')
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.alumni.models import AlumniProfile
from apps.editorial.models import AlumniInterview, InterviewItem

alumnus = AlumniProfile.objects.filter(slug="panjiyev-maqsud-aliqulovich").first()
if not alumnus:
    alumnus = AlumniProfile.objects.filter(full_name__icontains="Panjiyev").first()

if not alumnus:
    print("Error: Panjiyev Maqsud Aliqulovich not found in AlumniProfile!")
    sys.exit(1)

interview, created = AlumniInterview.objects.update_or_create(
    slug="panjiyev-maqsud-aliqulovich-bilan-suhbat",
    defaults={
        "alumnus": alumnus,
        "title_uz": "Zamonaviy maktab taʼlimi, pedagogik innovatsiyalar va yosh avlod tarbiyasi",
        "title_en": "Modern School Education, Pedagogical Innovations, and Youth Development",
        "intro_uz": "Qashqadaryo viloyati Maktabgacha va maktab taʼlimi boshqarmasi boshlig‘i o‘rinbosari, pedagogika fanlari bo‘yicha falsafa doktori (PhD) Maqsud Panjiyev bilan umumiy o‘rta taʼlim sifatini oshirish, o‘qituvchilar salohiyati va zamonaviy darsliklar xususida eksklyuziv suhbat.",
        "intro_en": "An exclusive interview with Maqsud Panjiyev, Deputy Head of the Department of Preschool and School Education of Kashkadarya Region, discussing education quality, teacher skills, and innovative pedagogical approaches.",
        "pull_quote_uz": "Taʼlimga kiritilgan har bir investitsiya — millatimizning ertangi taraqqiyoti va ravnaqi uchun qo‘yilgan eng mustahkam poydevordir.",
        "pull_quote_en": "Every investment in education is the strongest foundation for our nation's future development and prosperity.",
        "video_url": "https://youtu.be/FfCZG9dGNlU",
        "video_duration": "24:10",
        "is_featured": True,
        "is_published": True,
    }
)

# Items
items_data = [
    {
        "order": 1,
        "question_uz": "Qarshi davlat universitetidagi tahsil davri sizda qanday kasbiy va insoniy ko‘nikmalarni shakllantirdi?",
        "question_en": "What professional and personal skills did your education at KarSU instill in you?",
        "answer_uz": "Matematika fakultetidagi yillar menga chuqur mantiqiy fikrlash, har qanday murakkab vaziyatda tizimli yechim topish va o‘z ustimda to‘xtovsiz ishlash ko‘nikmasini berdi. Ustozlarimizning saboqlari va talabchanligi keyinchalik ham ilmiy tadqiqotlarimda, ham rahbarlik faoliyatimda doimiy mayoq bo‘ldi.",
        "answer_en": "My years in the Faculty of Mathematics developed my deep analytical thinking, systematic problem-solving mindset, and dedication to continuous self-improvement.",
    },
    {
        "order": 2,
        "question_uz": "Bugungi kunda maktabgacha va maktab taʼlimi tizimida qanday asosiy islohotlar amalga oshirilmoqda?",
        "question_en": "What key reforms are currently being implemented in the preschool and school education system?",
        "answer_uz": "Bugungi kunda asosiy eʼtiborimiz darslarning amaliy yo‘naltirilganligini oshirish, zamonaviy axborot texnologiyalarini o‘quv jarayoniga integratsiya qilish hamda pedagog kadrlarimizning metodik mahoratini doimiy oshirishga qaratilgan.",
        "answer_en": "Our primary focus today is on increasing practical learning outcomes, integrating modern digital technologies into education, and consistently upgrading teachers' pedagogical expertise.",
    }
]

for item in items_data:
    InterviewItem.objects.update_or_create(
        interview=interview,
        order=item["order"],
        defaults={
            "question_uz": item["question_uz"],
            "question_en": item["question_en"],
            "answer_uz": item["answer_uz"],
            "answer_en": item["answer_en"],
        }
    )

print(f"Interview successfully created/updated: {interview.title_uz}")
print(f"Alumnus: {interview.alumnus.full_name}, Video: {interview.video_url}")
