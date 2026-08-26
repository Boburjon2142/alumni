from django.urls import path
from .views import AlumniDetailView, AlumniListView, FeaturedListView, MeView
urlpatterns = [path("alumni/", AlumniListView.as_view()), path("alumni/me/", MeView.as_view()), path("alumni/<slug:slug>/", AlumniDetailView.as_view()), path("featured-alumni/", FeaturedListView.as_view())]
