from rest_framework import serializers
from .models import Faculty, Specialty

class SpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialty
        fields = ('id', 'name')

class FacultySerializer(serializers.ModelSerializer):
    specialties = SpecialtySerializer(many=True, read_only=True)
    class Meta:
        model = Faculty
        fields = ('id', 'name', 'specialties')
