from datetime import date

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.alumni.models import AlumniProfile, AlumniRecognition, RecognitionTitle


class Command(BaseCommand):
    help = "Add 2–5 document awards to local honorary cards for demonstration only."

    def add_arguments(self, parser):
        parser.add_argument("--apply", action="store_true")

    def handle(self, *args, **options):
        if not settings.DEBUG or settings.DATABASES["default"]["ENGINE"] != "django.db.backends.sqlite3":
            raise CommandError("This demonstration command requires local DEBUG SQLite.")
        slugs = ["qardu-iftixori", "ilm-fan-fidoyisi", "ziyo-mashali", "yuksak-parvoz", "ibrat",
                 "istiqbol-yoshlari", "ezgulik", "oliyhimmat", "marifat-hadyasi"]
        titles = {t.slug: t for t in RecognitionTitle.objects.filter(slug__in=slugs, is_active=True)}
        if len(titles) != len(slugs):
            raise CommandError("Run seed_official_awards first.")
        created = 0
        with transaction.atomic():
            profiles = AlumniProfile.objects.filter(is_honorary=True, is_published=True).order_by("graduation_year", "pk")
            for index, profile in enumerate(profiles):
                target = 5 if profile.slug == "xolmurodov-abdulhamid-erkinovich" else 2 + index % 4
                active = profile.recognitions.filter(status="approved", is_active=True, title__is_active=True)
                current = set(active.values_list("title__slug", flat=True))
                assigned = set(profile.recognitions.exclude(status="revoked").values_list("title__slug", flat=True))
                year = 2026 - index
                for offset in range(len(slugs)):
                    if len(current) >= target:
                        break
                    slug = slugs[(index + offset) % len(slugs)]
                    title = titles[slug]
                    if slug in assigned:
                        continue
                    if title.annual_quota and AlumniRecognition.objects.filter(title=title, year=year, status="approved").count() >= title.annual_quota:
                        continue
                    AlumniRecognition.objects.create(
                        alumnus=profile, title=title, status="approved", year=year,
                        awarded_at=date(year, 10, 14), level="bronze" if title.has_levels else None,
                        justification="LOKAL NAMUNA: interfeysni namoyish qilish uchun; haqiqiy taqdirlash emas.",
                    )
                    current.add(slug)
                    assigned.add(slug)
                    created += 1
                if len(current) < 2:
                    raise CommandError("Could not prepare at least two titles for " + profile.slug)
                self.stdout.write(f"{profile.slug}: {min(len(current), 5)} visible awards")
            if not options["apply"]:
                transaction.set_rollback(True)
        self.stdout.write(f"{'APPLIED' if options['apply'] else 'DRY RUN'}: {created} local sample assignments")
