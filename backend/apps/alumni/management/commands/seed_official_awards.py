from django.core.management.base import BaseCommand
from seed_official_awards import seed_official_awards


class Command(BaseCommand):
    help = "Seed the 16 Official QarDU Recognition System award definitions and cleanup demo titles"

    def handle(self, *args, **options):
        seed_official_awards()
        self.stdout.write(self.style.SUCCESS("Successfully seeded official QarDU recognition catalog."))
