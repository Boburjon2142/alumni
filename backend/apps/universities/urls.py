from django.urls import path
from .views import FacultyListView

urlpatterns = [
    path('faculties/', FacultyListView.as_view(), name='faculty-list'),
]
