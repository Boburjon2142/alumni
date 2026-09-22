from __future__ import annotations

import io
import os
from pathlib import Path
from PIL import Image, ImageOps
from django.core.files.base import ContentFile
from django.db.models.fields.files import FieldFile, ImageFieldFile

def optimize_image_field(
    image_field: FieldFile | ImageFieldFile | None,
    max_dimension: int = 1920,
    quality: int = 82,
) -> bool:
    """
    Optimizes a Django model ImageFieldFile/FieldFile in-memory before save:
    - Resizes dimensions down to max_dimension preserving aspect ratio.
    - Corrects EXIF rotation.
    - Converts format to WebP with lossy compression (quality=82).
    - Preserves alpha channel transparency if present.
    Returns True if the image was converted/optimized, False otherwise.
    """
    if not image_field or not hasattr(image_field, "file"):
        return False

    try:
        # Seek to start
        if hasattr(image_field, "seek"):
            image_field.seek(0)

        img = Image.open(image_field)
        
        # Auto-orient based on EXIF tags
        try:
            img = ImageOps.exif_transpose(img)
        except Exception:
            pass

        # Maintain alpha or convert mode
        if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
            img = img.convert("RGBA")
        elif img.mode != "RGB":
            img = img.convert("RGB")

        # Resize if exceeds max_dimension
        width, height = img.size
        if width > max_dimension or height > max_dimension:
            img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)

        # Export to WebP
        buffer = io.BytesIO()
        img.save(buffer, format="WEBP", quality=quality, method=4)
        buffer.seek(0)

        # Form new filename
        current_name = image_field.name or "image.jpg"
        base_name = os.path.splitext(current_name)[0]
        webp_name = f"{base_name}.webp"

        image_field.save(webp_name, ContentFile(buffer.getvalue()), save=False)
        return True
    except Exception as exc:
        # If optimization fails (e.g. invalid image format), gracefully retain original
        return False


def optimize_file_path(
    file_path: str | Path,
    max_dimension: int = 1920,
    quality: int = 82,
    delete_original: bool = True,
) -> str | None:
    """
    Converts a physical image file on disk to an optimized WebP file.
    Returns the new relative or absolute path, or None if failed.
    """
    path = Path(file_path)
    if not path.exists() or not path.is_file():
        return None

    try:
        with Image.open(path) as img:
            try:
                img = ImageOps.exif_transpose(img)
            except Exception:
                pass

            if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
                img = img.convert("RGBA")
            elif img.mode != "RGB":
                img = img.convert("RGB")

            width, height = img.size
            if width > max_dimension or height > max_dimension:
                img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)

            new_path = path.with_suffix(".webp")
            img.save(new_path, format="WEBP", quality=quality, method=4)

        if delete_original and path.suffix.lower() != ".webp" and new_path.exists():
            try:
                path.unlink()
            except Exception:
                pass

        return str(new_path)
    except Exception:
        return None
