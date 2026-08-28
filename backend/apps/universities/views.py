from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import Faculty
from .serializers import FacultySerializer

class FacultyListView(generics.ListAPIView):
    permission_classes = (AllowAny,)
    serializer_class = FacultySerializer
    queryset = Faculty.objects.all().prefetch_related('specialties')
