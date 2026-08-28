import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

import json
from pathlib import Path
from apps.universities.models import Faculty, Specialty
from apps.alumni.models import AlumniProfile, Achievement, CareerTimelineItem, AlumniSource, FeaturedAlumni
from apps.editorial.models import SuccessStory, StorySection, AlumniAdvice

def seed_all():
    print("=== SEEDING PRODUCTION DATA VIA DJANGO ORM ===")
    fixture_path = Path(__file__).resolve().parent / "fixtures" / "initial_data.json"
    
    if not fixture_path.exists():
        print(f"Fixture not found at {fixture_path}")
        return

    with open(fixture_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # 1. Faculties
    for item in data:
        if item["model"] == "universities.faculty":
            Faculty.objects.update_or_create(
                id=item["pk"],
                defaults={"name": item["fields"]["name"]}
            )
    print(f"[OK] Faculties: {Faculty.objects.count()}")

    # 2. Specialties
    for item in data:
        if item["model"] == "universities.specialty":
            Specialty.objects.update_or_create(
                id=item["pk"],
                defaults={
                    "faculty_id": item["fields"]["faculty"],
                    "name": item["fields"]["name"]
                }
            )
    print(f"[OK] Specialties: {Specialty.objects.count()}")

    # 3. Alumni Profiles
    for item in data:
        if item["model"] == "alumni.alumniprofile":
            fields = item["fields"]
            slug = fields.get("slug", "")
            img_url = fields.get("image_url", "")
            if not img_url and slug:
                img_url = f"/images/faxriylar/{slug}.png"

            AlumniProfile.objects.update_or_create(
                id=item["pk"],
                defaults={
                    "full_name": fields.get("full_name", ""),
                    "slug": slug,
                    "avatar": fields.get("avatar", ""),
                    "image_url": img_url,
                    "image_alt": fields.get("image_alt", ""),
                    "degree": fields.get("degree", ""),
                    "faculty_id": fields.get("faculty"),
                    "specialty_id": fields.get("specialty"),
                    "graduation_year": fields.get("graduation_year"),
                    "current_company": fields.get("current_company", ""),
                    "position": fields.get("position", ""),
                    "industry": fields.get("industry", ""),
                    "city": fields.get("city", ""),
                    "country": fields.get("country", "O‘zbekiston"),
                    "bio": fields.get("bio", ""),
                    "biography_uz": fields.get("biography_uz", ""),
                    "career_story_uz": fields.get("career_story_uz", ""),
                    "verification_status": fields.get("verification_status", "verified"),
                    "visibility": fields.get("visibility", "public"),
                    "is_published": True,
                    "is_featured": True,
                    "featured_order": fields.get("featured_order") or item["pk"],
                    "published_at": fields.get("published_at"),
                }
            )
    print(f"[OK] Alumni Profiles: {AlumniProfile.objects.count()}")

    # 4. Achievements
    for item in data:
        if item["model"] == "alumni.achievement":
            fields = item["fields"]
            Achievement.objects.update_or_create(
                id=item["pk"],
                defaults={
                    "alumnus_id": fields.get("alumnus"),
                    "title": fields.get("title", "")[:490],
                    "description": fields.get("description", ""),
                    "year": fields.get("year"),
                    "category": fields.get("category", "professional"),
                    "order": fields.get("order", 0),
                }
            )

    # 5. Career Timeline Items
    for item in data:
        if item["model"] == "alumni.careertimelineitem":
            fields = item["fields"]
            CareerTimelineItem.objects.update_or_create(
                id=item["pk"],
                defaults={
                    "alumnus_id": fields.get("alumnus"),
                    "year": fields.get("year", 2020),
                    "title": fields.get("title", "")[:490],
                    "organization": fields.get("organization", ""),
                    "description": fields.get("description", ""),
                    "type": fields.get("type", "career"),
                    "order": fields.get("order", 0),
                }
            )

    # 6. Featured Alumni
    for item in data:
        if item["model"] == "alumni.featuredalumni":
            fields = item["fields"]
            FeaturedAlumni.objects.update_or_create(
                id=item["pk"],
                defaults={
                    "alumni_id": fields.get("alumni"),
                    "title": fields.get("title", ""),
                    "short_description": fields.get("short_description", ""),
                    "display_order": fields.get("display_order", 0),
                    "is_active": fields.get("is_active", True),
                }
            )
    print(f"[OK] Featured Alumni: {FeaturedAlumni.objects.count()}")

    # 7. Success Stories
    for item in data:
        if item["model"] == "editorial.successstory":
            fields = item["fields"]
            SuccessStory.objects.update_or_create(
                id=item["pk"],
                defaults={
                    "alumnus_id": fields.get("alumnus"),
                    "slug": fields.get("slug", ""),
                    "title_uz": fields.get("title_uz", ""),
                    "title_en": fields.get("title_en", ""),
                    "summary_uz": fields.get("summary_uz", ""),
                    "summary_en": fields.get("summary_en", ""),
                    "hero_image": fields.get("hero_image", ""),
                    "hero_image_url": fields.get("hero_image_url", ""),
                    "hero_image_alt": fields.get("hero_image_alt", ""),
                    "student_takeaway_uz": fields.get("student_takeaway_uz", ""),
                    "student_takeaway_en": fields.get("student_takeaway_en", ""),
                    "is_featured": fields.get("is_featured", True),
                    "is_published": fields.get("is_published", True),
                    "published_at": fields.get("published_at"),
                }
            )
    print(f"[OK] Success Stories: {SuccessStory.objects.count()}")

    # 8. Story Sections
    for item in data:
        if item["model"] == "editorial.storysection":
            fields = item["fields"]
            StorySection.objects.update_or_create(
                id=item["pk"],
                defaults={
                    "story_id": fields.get("story"),
                    "kind": fields.get("kind", "introduction"),
                    "heading_uz": fields.get("heading_uz", ""),
                    "heading_en": fields.get("heading_en", ""),
                    "content_uz": fields.get("content_uz", ""),
                    "content_en": fields.get("content_en", ""),
                    "order": fields.get("order", 0),
                }
            )

    # 9. Alumni Advice
    for item in data:
        if item["model"] == "editorial.alumniadvice":
            fields = item["fields"]
            AlumniAdvice.objects.update_or_create(
                id=item["pk"],
                defaults={
                    "alumnus_id": fields.get("alumnus"),
                    "category": fields.get("category", "career"),
                    "title_uz": fields.get("title_uz", ""),
                    "title_ru": fields.get("title_ru", ""),
                    "title_en": fields.get("title_en", ""),
                    "content_uz": fields.get("content_uz", ""),
                    "content_ru": fields.get("content_ru", ""),
                    "content_en": fields.get("content_en", ""),
                    "source_type": fields.get("source_type", "manual"),
                    "is_featured": fields.get("is_featured", True),
                    "is_published": fields.get("is_published", True),
                    "published_at": fields.get("published_at"),
                }
            )
    print(f"[OK] Alumni Advice: {AlumniAdvice.objects.count()}")

    # Guarantee all seeded profiles are published and active
    AlumniProfile.objects.update(is_published=True, is_featured=True, visibility="public")
    SuccessStory.objects.update(is_published=True)
    AlumniAdvice.objects.update(is_published=True)
    FeaturedAlumni.objects.update(is_active=True)

    print("=== SEEDING COMPLETED SUCCESSFULLY! ===")

if __name__ == "__main__":
    seed_all()
