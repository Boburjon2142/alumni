from __future__ import annotations

import hashlib
import json
from functools import wraps
from typing import Any, Callable
from django.core.cache import cache
from rest_framework.response import Response

def get_cache_key(prefix: str, *args, **kwargs) -> str:
    """Generates a deterministic MD5 hash key based on arguments."""
    payload = json.dumps({"args": args, "kwargs": kwargs}, sort_keys=True, default=str)
    hashed = hashlib.md5(payload.encode("utf-8")).hexdigest()
    return f"{prefix}:{hashed}"


def cache_api_response(prefix: str, timeout: int = 300) -> Callable:
    """
    Decorator for DRF API ViewSet methods or APIViews (list, retrieve, stats).
    Caches the Response data dictionary and re-creates Response on hit.
    """
    def decorator(view_func: Callable) -> Callable:
        @wraps(view_func)
        def wrapper(self, request, *args, **kwargs) -> Response:
            # Only cache safe GET requests
            if request.method != "GET":
                return view_func(self, request, *args, **kwargs)

            # Query params dict
            query_params = dict(request.query_params.lists())
            cache_key = get_cache_key(f"api:{prefix}", path=request.path, query=query_params, **kwargs)

            cached_data = cache.get(cache_key)
            if cached_data is not None:
                response = Response(cached_data)
                response["X-Cache-Lookup"] = "HIT"
                return response

            response = view_func(self, request, *args, **kwargs)
            if response.status_code == 200 and hasattr(response, "data"):
                cache.set(cache_key, response.data, timeout=timeout)
                response["X-Cache-Lookup"] = "MISS"

            return response
        return wrapper
    return decorator


def invalidate_cache_prefix(prefix: str) -> None:
    """
    Invalidates keys by pattern if supported by backend (django-redis),
    or clears version/keys gracefully.
    """
    try:
        if hasattr(cache, "delete_pattern"):
            cache.delete_pattern(f"*{prefix}*")
        else:
            cache.clear()
    except Exception:
        pass
