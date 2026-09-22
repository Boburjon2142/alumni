from __future__ import annotations

import os
from pathlib import Path
from django.conf import settings
from django.core.management.base import BaseCommand
from common.image_optimizer import optimize_file_path
from apps.alumni.models import AlumniProfile
from apps.editorial.models import News, SuccessStory, Event

class Command(BaseCommand):
    help = "Converts all existing images in media/ and database models to optimized WebP format"

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Rasmlarni WebP formatiga optimizatsiya qilish boshlandi..."))
        total_converted = 0
        total_saved_bytes = 0

        media_root = Path(settings.MEDIA_ROOT)
        if not media_root.exists():
            self.stdout.write(self.style.WARNING("Media papkasi topilmadi."))
            return

        # 1. Update AlumniProfile avatars
        for alumnus in AlumniProfile.objects.exclude(avatar="").exclude(avatar__isnull=True):
            if alumnus.avatar and alumnus.avatar.name and not alumnus.avatar.name.lower().endswith(".webp"):
                old_path = media_root / alumnus.avatar.name
                if old_path.exists():
                    old_size = old_path.stat().st_size
                    new_path_str = optimize_file_path(old_path, max_dimension=800, quality=82)
                    if new_path_str:
                        new_path = Path(new_path_str)
                        new_size = new_path.stat().st_size
                        saved = max(0, old_size - new_size)
                        total_saved_bytes += saved
                        total_converted += 1
                        # Update DB reference
                        rel_name = os.path.relpath(new_path_str, settings.MEDIA_ROOT).replace("\\", "/")
                        alumnus.avatar.name = rel_name
                        alumnus.save(update_fields=["avatar"])
                        self.stdout.write(f"Alumnus {alumnus.pk} avatar WebP qilindi (-{saved // 1024} KB)")

        # 2. Update News cover images
        for news in News.objects.exclude(cover_image="").exclude(cover_image__isnull=True):
            if news.cover_image and news.cover_image.name and not news.cover_image.name.lower().endswith(".webp"):
                old_path = media_root / news.cover_image.name
                if old_path.exists():
                    old_size = old_path.stat().st_size
                    new_path_str = optimize_file_path(old_path, max_dimension=1920, quality=82)
                    if new_path_str:
                        new_path = Path(new_path_str)
                        new_size = new_path.stat().st_size
                        saved = max(0, old_size - new_size)
                        total_saved_bytes += saved
                        total_converted += 1
                        rel_name = os.path.relpath(new_path_str, settings.MEDIA_ROOT).replace("\\", "/")
                        news.cover_image.name = rel_name
                        news.save(update_fields=["cover_image"])
                        self.stdout.write(f"News ID {news.pk} rasmi WebP qilindi (-{saved // 1024} KB)")

        # 3. Update SuccessStory hero images
        for story in SuccessStory.objects.exclude(hero_image="").exclude(hero_image__isnull=True):
            if story.hero_image and story.hero_image.name and not story.hero_image.name.lower().endswith(".webp"):
                old_path = media_root / story.hero_image.name
                if old_path.exists():
                    old_size = old_path.stat().st_size
                    new_path_str = optimize_file_path(old_path, max_dimension=1920, quality=82)
                    if new_path_str:
                        new_path = Path(new_path_str)
                        new_size = new_path.stat().st_size
                        saved = max(0, old_size - new_size)
                        total_saved_bytes += saved
                        total_converted += 1
                        rel_name = os.path.relpath(new_path_str, settings.MEDIA_ROOT).replace("\\", "/")
                        story.hero_image.name = rel_name
                        story.save(update_fields=["hero_image"])
                        self.stdout.write(f"Story ID {story.pk} rasmi WebP qilindi (-{saved // 1024} KB)")

        # 4. Update Event cover images
        for event in Event.objects.exclude(cover_image="").exclude(cover_image__isnull=True):
            if event.cover_image and event.cover_image.name and not event.cover_image.name.lower().endswith(".webp"):
                old_path = media_root / event.cover_image.name
                if old_path.exists():
                    old_size = old_path.stat().st_size
                    new_path_str = optimize_file_path(old_path, max_dimension=1920, quality=82)
                    if new_path_str:
                        new_path = Path(new_path_str)
                        new_size = new_path.stat().st_size
                        saved = max(0, old_size - new_size)
                        total_saved_bytes += saved
                        total_converted += 1
                        rel_name = os.path.relpath(new_path_str, settings.MEDIA_ROOT).replace("\\", "/")
                        event.cover_image.name = rel_name
                        event.save(update_fields=["cover_image"])
                        self.stdout.write(f"Event ID {event.pk} rasmi WebP qilindi (-{saved // 1024} KB)")


        # 5. Sweep remaining unreferenced images in media directory
        for img_path in list(media_root.rglob("*.*")):
            if img_path.is_file() and img_path.suffix.lower() in [".jpg", ".jpeg", ".png"]:
                old_size = img_path.stat().st_size
                new_path_str = optimize_file_path(img_path, max_dimension=1920, quality=82)
                if new_path_str:
                    new_size = Path(new_path_str).stat().st_size
                    total_saved_bytes += max(0, old_size - new_size)
                    total_converted += 1

        saved_mb = round(total_saved_bytes / (1024 * 1024), 2)
        self.stdout.write(self.style.SUCCESS(
            f"Muvaffaqiyatli yakunlandi! Jami {total_converted} ta rasm WebP formatiga o'tkazildi. "
            f"Tejalgan hajm: {saved_mb} MB"
        ))
