from django.core.management.base import BaseCommand
from django.db import transaction

from apps.alumni.models import AlumniProfile
from apps.editorial.models import SuccessStory, StorySection


class Command(BaseCommand):
    help = "Lokal ko‘rish uchun xavfsiz demo muvaffaqiyat hikoyasini yaratadi."

    @transaction.atomic
    def handle(self, *args, **options):
        alumnus, _ = AlumniProfile.objects.get_or_create(
            slug="qarshidu-bitiruvchisi",
            defaults={
                "full_name": "QarshiDU bitiruvchisi",
                "graduation_year": 2020,
                "degree": "Bakalavr",
                "position": "Yosh mutaxassis",
                "country": "O‘zbekiston",
                "bio": "QarshiDUda olgan bilimlarini kasbiy rivoj va jamiyat manfaatiga yo‘naltirayotgan bitiruvchi.",
                "is_published": True,
                "is_featured": True,
            },
        )
        if not alumnus.is_published:
            alumnus.is_published = True
            alumnus.save(update_fields=("is_published", "published_at", "updated_at"))

        story, created = SuccessStory.objects.get_or_create(
            slug="qarshidudan-professional-rivoj-sari",
            defaults={
                "alumnus": alumnus,
                "title_uz": "QarshiDUdan professional rivoj sari",
                "title_en": "From KarSU to professional growth",
                "summary_uz": "Universitetda shakllangan bilim, intizom va hamjamiyat kuchining kasbiy yo‘lga ta’siri haqida hikoya.",
                "summary_en": "A story about how university knowledge, discipline and community shape a professional journey.",
                "student_takeaway_uz": "Imkoniyatni kutmang: bilimni amaliyot bilan mustahkamlang va professional aloqalarni bugundan boshlang.",
                "student_takeaway_en": "Do not wait for opportunity: apply your knowledge and start building professional relationships today.",
                "is_published": True,
                "is_featured": True,
            },
        )

        sections = (
            ("university", "Universitetdagi poydevor", "QarshiDUdagi ta’lim jarayoni nazariy bilim bilan birga mustaqil fikrlash, mas’uliyat va jamoada ishlash ko‘nikmalarini shakllantirdi."),
            ("turning_point", "Burilish nuqtasi", "Kasbiy yo‘ldagi muhim qadam bilimni real vazifalarda sinab ko‘rish va tajribali mutaxassislar bilan aloqa o‘rnatishdan boshlandi."),
            ("reflection", "Talabalarga tavsiya", "Har bir loyiha, amaliyot va uchrashuvni o‘sish imkoniyati deb qabul qiling. Izchil harakat kichik qadamlarni katta natijaga aylantiradi."),
        )
        for order, (kind, heading, content) in enumerate(sections, start=1):
            StorySection.objects.update_or_create(
                story=story,
                order=order,
                defaults={"kind": kind, "heading_uz": heading, "content_uz": content},
            )

        action = "yaratildi" if created else "allaqachon mavjud"
        self.stdout.write(self.style.SUCCESS(f"Demo muvaffaqiyat hikoyasi {action}."))
