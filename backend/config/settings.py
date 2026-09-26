import os
import sys
from pathlib import Path
from dotenv import load_dotenv

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR.parent / ".env")
load_dotenv(BASE_DIR / ".env", override=True)

from django.core.exceptions import ImproperlyConfigured

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "")
DEBUG = os.getenv("DJANGO_DEBUG", "True").lower() == "true"

if not SECRET_KEY or SECRET_KEY == "dev-only-change-me":
    if not DEBUG:
        raise ImproperlyConfigured("DJANGO_SECRET_KEY is required in production")
    SECRET_KEY = "dev-only-change-me"

ALLOWED_HOSTS = [host.strip() for host in os.getenv("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1,backend,testserver").split(",") if host.strip()]

INSTALLED_APPS = [
    "django.contrib.admin", "django.contrib.auth", "django.contrib.contenttypes",
    "django.contrib.sessions", "django.contrib.messages", "django.contrib.staticfiles",
    "rest_framework", "django_filters", "apps.accounts", "apps.universities", "apps.alumni", "apps.editorial",
    "apps.feedback", "apps.impact",
]
MIDDLEWARE = [
    "django.middleware.gzip.GZipMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.middleware.http.ConditionalGetMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]
ROOT_URLCONF = "config.urls"
TEMPLATES = [{"BACKEND": "django.template.backends.django.DjangoTemplates", "DIRS": [], "APP_DIRS": True,
              "OPTIONS": {"context_processors": ["django.template.context_processors.request", "django.contrib.auth.context_processors.auth", "django.contrib.messages.context_processors.messages"]}}]
WSGI_APPLICATION = "config.wsgi.application"

if os.getenv("USE_POSTGRES", "false").lower() == "true" and os.getenv("POSTGRES_DB"):
    DATABASES = {"default": {"ENGINE": "django.db.backends.postgresql", "NAME": os.getenv("POSTGRES_DB"),
        "USER": os.getenv("POSTGRES_USER"), "PASSWORD": os.getenv("POSTGRES_PASSWORD"),
        "HOST": os.getenv("POSTGRES_HOST", "localhost"), "PORT": os.getenv("POSTGRES_PORT", "5432"),
        "CONN_MAX_AGE": 600}}
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
            "CONN_MAX_AGE": 600,
            "OPTIONS": {
                "timeout": 20,
            },
        }
    }

# Optimize SQLite performance with WAL mode and memory cache
from django.db.backends.signals import connection_created
def _configure_sqlite_db(sender, connection, **kwargs):
    if connection.vendor == "sqlite":
        with connection.cursor() as cursor:
            cursor.execute("PRAGMA journal_mode = WAL;")
            cursor.execute("PRAGMA synchronous = NORMAL;")
            cursor.execute("PRAGMA cache_size = -64000;")
            cursor.execute("PRAGMA temp_store = MEMORY;")

connection_created.connect(_configure_sqlite_db)

AUTH_USER_MODEL = "accounts.User"
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]
LANGUAGE_CODE = "uz"; TIME_ZONE = "Asia/Tashkent"; USE_I18N = True; USE_TZ = True
# --- Caching Configuration (Redis with LocMem fallback) ---
REDIS_URL = os.getenv("REDIS_URL", "redis://127.0.0.1:6379/1")
USE_REDIS = os.getenv("USE_REDIS", "false").lower() in ("true", "1", "yes")

if USE_REDIS or not DEBUG:
    CACHES = {
        "default": {
            "BACKEND": "django_redis.cache.RedisCache",
            "LOCATION": REDIS_URL,
            "OPTIONS": {
                "CLIENT_CLASS": "django_redis.client.DefaultClient",
                "IGNORE_EXCEPTIONS": True,
                "SOCKET_CONNECT_TIMEOUT": 3,
                "SOCKET_TIMEOUT": 3,
            },
            "KEY_PREFIX": "alumni",
            "TIMEOUT": 600,
        }
    }
else:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "alumni_locmem_cache",
            "TIMEOUT": 600,
            "KEY_PREFIX": "alumni",
        }
    }

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "static"
STATICFILES_STORAGE = "whitenoise.storage.CompressedStaticFilesStorage"
WHITENOISE_USE_FINDERS = True
WHITENOISE_AUTOREFRESH = True
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": ["rest_framework.authentication.SessionAuthentication"],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
    "DEFAULT_FILTER_BACKENDS": ["django_filters.rest_framework.DjangoFilterBackend", "rest_framework.filters.SearchFilter"],
    "DEFAULT_PAGINATION_CLASS": "common.pagination.StandardPagination", "PAGE_SIZE": 12,
    "EXCEPTION_HANDLER": "common.exceptions.api_exception_handler",
}
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = os.getenv("SESSION_COOKIE_SECURE", "false").lower() == "true"
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SECURE = os.getenv("CSRF_COOKIE_SECURE", "false").lower() == "true"
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

raw_csrf = os.getenv("CSRF_TRUSTED_ORIGINS", "http://89.39.95.153,http://localhost:3000,http://127.0.0.1:3000,http://backend:8000,https://89.39.95.153").split(",")
CSRF_TRUSTED_ORIGINS = [h.strip() for h in raw_csrf if h.strip()]

# --- Production Security ---
if not DEBUG and os.getenv("SECURE_SSL_REDIRECT", "false").lower() == "true":
    SECURE_SSL_REDIRECT = True
    SECURE_HSTS_SECONDS = int(os.getenv("SECURE_HSTS_SECONDS", "31536000"))
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# --- Email Configuration (Free Gmail SMTP with Console fallback in dev) ---
EMAIL_HOST = os.getenv("EMAIL_HOST", "mail.qarshidu.uz")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USE_SSL = os.getenv("EMAIL_USE_SSL", "false").lower() in ("true", "1", "yes")
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "true").lower() in ("true", "1", "yes") and not EMAIL_USE_SSL
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "QarshiDU Alumni <alumni@qarshidu.uz>")

if EMAIL_HOST_USER and EMAIL_HOST_PASSWORD:
    EMAIL_BACKEND = os.getenv("EMAIL_BACKEND", "django.core.mail.backends.smtp.EmailBackend")
else:
    EMAIL_BACKEND = os.getenv("EMAIL_BACKEND", "django.core.mail.backends.console.EmailBackend")

# --- Frontend & Telegram Bot Integration ---
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_ADMIN_CHAT_ID = os.getenv("TELEGRAM_ADMIN_CHAT_ID", "")
TELEGRAM_BOT_USERNAME = os.getenv("TELEGRAM_BOT_USERNAME", "qarshidu_alumni_bot")



GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "").strip()
EMAIL_TIMEOUT = 15
