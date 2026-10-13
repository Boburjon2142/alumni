import json
from datetime import date, datetime
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.alumni.models import AlumniProfile, AlumniRecognition, RecognitionTitle
from common.cache_utils import invalidate_cache_prefix


class Command(BaseCommand):
    help = "Import the reviewed local recognition snapshot by slug; default is dry-run."

    def add_arguments(self, parser):
        parser.add_argument("--apply", action="store_true")

    def handle(self, *args, **options):
        path = Path(settings.BASE_DIR) / "fixtures/local_recognitions_2026-10-13.json"
        payload = json.loads(path.read_text(encoding="utf-8"))
        rows = payload["assignments"]
        slugs = {row["alumnus_slug"] for row in rows}
        profiles = {p.slug: p for p in AlumniProfile.objects.filter(slug__in=slugs)}
        missing = slugs - profiles.keys()
        if missing:
            raise CommandError("Missing profile slugs: " + ", ".join(sorted(missing)))
        created = skipped = 0
        try:
            with transaction.atomic():
                titles = {}
                for data in payload["titles"]:
                    defaults = {key: value for key, value in data.items() if key != "slug"}
                    title, _ = RecognitionTitle.objects.get_or_create(slug=data["slug"], defaults=defaults)
                    if not title.is_active:
                        raise CommandError("Inactive server title: " + title.slug)
                    titles[title.slug] = title
                for row in rows:
                    profile = profiles[row["alumnus_slug"]]
                    title = titles[row["title_slug"]]
                    existing = list(AlumniRecognition.objects.filter(alumnus=profile, title=title))
                    values = {key: row[key] for key in ("level", "year", "awarded_at", "valid_from", "valid_until", "approved_at")}
                    for key in ("awarded_at", "valid_from", "valid_until"):
                        if values[key]:
                            values[key] = date.fromisoformat(values[key])
                    if values["approved_at"]:
                        values["approved_at"] = datetime.fromisoformat(values["approved_at"])
                    if existing:
                        matches = [r for r in existing if r.status == "approved" and r.is_active
                                   and all(getattr(r, key) == values[key] for key in ("level", "year", "awarded_at", "valid_from", "valid_until"))]
                        if matches:
                            skipped += 1
                            continue
                        raise CommandError("Existing assignment conflicts: " + profile.slug + " / " + title.slug)
                    AlumniRecognition.objects.create(alumnus=profile, title=title, status="approved", is_active=True, **values)
                    created += 1
                if not options["apply"]:
                    transaction.set_rollback(True)
        except CommandError:
            raise
        except Exception as exc:
            raise CommandError("Import rolled back: " + str(exc)) from exc
        if options["apply"]:
            invalidate_cache_prefix("api:")
        mode = "APPLIED" if options["apply"] else "DRY RUN (no database changes)"
        self.stdout.write(self.style.SUCCESS("%s: %s new, %s already present, %s profiles" % (mode, created, skipped, len(profiles))))
