import hashlib
import json
import shutil
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.core.serializers.json import DjangoJSONEncoder
from django.db import models, transaction

from apps.alumni.models import AlumniProfile, RecognitionTitle, AlumniRecognition
from apps.editorial.models import SuccessStory, AlumniInterview, AlumniAdvice, InterviewItem
from apps.universities.models import Faculty, Specialty


PRIVATE = {"phone", "contact_email", "user", "approved_by", "revoked_by"}
PROFILE_CHILDREN = ("achievements", "timeline", "educations", "work_experiences", "sources")


def scalars(obj):
    return {f.name: (str(getattr(obj, f.name)) if isinstance(f, models.FileField) else getattr(obj, f.name))
            for f in obj._meta.concrete_fields
            if not f.primary_key and not f.is_relation and f.name not in PRIVATE
            and not getattr(f, "auto_now", False) and not getattr(f, "auto_now_add", False)}


class Command(BaseCommand):
    help = "Export or explicitly apply the reviewed public alumni snapshot; import defaults to dry-run."

    def add_arguments(self, parser):
        parser.add_argument("--export", action="store_true")
        parser.add_argument("--apply", action="store_true")
        parser.add_argument("--path", default=str(Path(settings.BASE_DIR) / "public_snapshot/data.json"))

    def handle(self, *args, **options):
        path = Path(options["path"])
        if options["export"]:
            if not settings.DEBUG:
                raise CommandError("Export is limited to local DEBUG environments.")
            profiles = AlumniProfile.objects.filter(is_honorary=True, is_published=True, visibility="public").order_by("slug")
            data = {"version": 1, "profiles": [], "titles": [scalars(t) for t in RecognitionTitle.objects.filter(is_active=True)], "media": {}}
            for profile in profiles:
                row = {"fields": scalars(profile), "faculty": profile.faculty.name if profile.faculty else None,
                       "specialty": profile.specialty.name if profile.specialty else None,
                       "children": {name: [scalars(o) for o in getattr(profile, name).all()] for name in PROFILE_CHILDREN},
                       "recognitions": [{"title_slug": r.title.slug, "fields": scalars(r)} for r in profile.recognitions.filter(title__is_active=True, status="approved", is_active=True)],
                       "stories": [], "interviews": [],
                       "advice": [{"fields": scalars(a), "source": {"slug": a.source_interview_item.interview.slug, "order": a.source_interview_item.order} if a.source_interview_item_id else None} for a in profile.advice.all()]}
                for name, child in [("stories", "sections"), ("interviews", "items")]:
                    manager = profile.success_stories if name == "stories" else profile.interviews
                    row[name] = [{"fields": scalars(o), "children": [scalars(c) for c in getattr(o, child).all()]} for o in manager.all()]
                data["profiles"].append(row)
            def collect(value):
                if isinstance(value, dict):
                    for key, item in value.items():
                        if key in {"avatar", "hero_image", "cover_image"} and isinstance(item, str) and item:
                            source = (Path(settings.MEDIA_ROOT) / item).resolve()
                            if not source.is_relative_to(Path(settings.MEDIA_ROOT).resolve()) or not source.is_file():
                                raise CommandError("Missing or invalid public media: " + item)
                            target = path.parent / "media" / item
                            target.parent.mkdir(parents=True, exist_ok=True)
                            shutil.copy2(source, target)
                            data["media"][item] = hashlib.sha256(source.read_bytes()).hexdigest()
                        else:
                            collect(item)
                elif isinstance(value, list):
                    for item in value:
                        collect(item)
            collect(data["profiles"])
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(json.dumps(data, cls=DjangoJSONEncoder, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            self.stdout.write(f"Exported {len(data['profiles'])} public honorary profiles and {len(data['media'])} public media files.")
            return
        data = json.loads(path.read_text(encoding="utf-8"))
        if data.get("version") != 1:
            raise CommandError("Unsupported snapshot version.")
        for name, digest in data["media"].items():
            source = (path.parent / "media" / name).resolve()
            destination = (Path(settings.MEDIA_ROOT) / name).resolve()
            if not source.is_relative_to((path.parent / "media").resolve()) or not destination.is_relative_to(Path(settings.MEDIA_ROOT).resolve()):
                raise CommandError("Invalid media path.")
            if not source.is_file() or hashlib.sha256(source.read_bytes()).hexdigest() != digest:
                raise CommandError("Public media checksum mismatch: " + name)

        def upsert(model, lookup, fields):
            allowed = {f.name for f in model._meta.concrete_fields if not f.primary_key and not f.is_relation and f.name not in PRIVATE}
            if set(fields) - allowed:
                raise CommandError("Unexpected fields for " + model._meta.label)
            converted = {key: model._meta.get_field(key).to_python(value) for key, value in fields.items()}
            obj = model.objects.filter(**lookup).first()
            if obj:
                model.objects.filter(pk=obj.pk).update(**converted)
                obj.refresh_from_db()
            else:
                obj = model(**(converted | lookup))
                model.objects.bulk_create([obj])
            return obj

        with transaction.atomic():
            titles = {r["slug"]: upsert(RecognitionTitle, {"slug": r["slug"]}, r) for r in data["titles"]}
            RecognitionTitle.objects.exclude(slug__in=titles).update(is_active=False)
            for row in data["profiles"]:
                faculty = Faculty.objects.get_or_create(name=row["faculty"])[0] if row["faculty"] else None
                specialty = Specialty.objects.get_or_create(faculty=faculty, name=row["specialty"])[0] if faculty and row["specialty"] else None
                profile = upsert(AlumniProfile, {"slug": row["fields"]["slug"]}, row["fields"])
                AlumniProfile.objects.filter(pk=profile.pk).update(faculty=faculty, specialty=specialty)
                for name, rows in row["children"].items():
                    if name not in PROFILE_CHILDREN:
                        raise CommandError("Unexpected profile relation.")
                    manager = getattr(profile, name)
                    for child in rows:
                        key = next(k for k in ["order", "url", "title", "company", "institution"] if k in child)
                        upsert(manager.model, {"alumnus": profile, key: child[key]}, child)
                for award in row["recognitions"]:
                    title = titles[award["title_slug"]]
                    upsert(AlumniRecognition, {"alumnus": profile, "title": title, "status": "approved", "is_active": True}, award["fields"])
                for name, model, child_name, fk in [("stories", SuccessStory, "sections", "story"), ("interviews", AlumniInterview, "items", "interview")]:
                    for entry in row[name]:
                        obj = upsert(model, {"slug": entry["fields"]["slug"], "alumnus": profile}, entry["fields"])
                        for child in entry["children"]:
                            upsert(getattr(obj, child_name).model, {fk: obj, "order": child["order"]}, child)
                for advice in row.get("advice", []):
                    source = advice["source"]
                    item = InterviewItem.objects.get(interview__slug=source["slug"], order=source["order"]) if source else None
                    fields = advice["fields"]
                    obj = upsert(AlumniAdvice, {"alumnus": profile, "category": fields["category"], "title_uz": fields["title_uz"]}, fields)
                    AlumniAdvice.objects.filter(pk=obj.pk).update(source_interview_item=item)
            if not options["apply"]:
                transaction.set_rollback(True)
        if options["apply"]:
            for name in data["media"]:
                destination = Path(settings.MEDIA_ROOT) / name
                destination.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(path.parent / "media" / name, destination)
            from django.core.cache import cache
            cache.clear()
        self.stdout.write(f"{'APPLIED' if options['apply'] else 'DRY RUN'}: {len(data['profiles'])} profiles. Accounts and contacts preserved.")
