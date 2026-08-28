from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/", include("apps.alumni.urls")),
    path("api/v1/editorial/", include("apps.editorial.urls")),
    path("api/v1/", include("apps.editorial.urls")),
    path("api/v1/", include("apps.feedback.urls")),
    path("api/feedback/", include("apps.feedback.urls")),
    path("api/", include("apps.feedback.urls")),
    path("api/v1/", include("apps.universities.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
