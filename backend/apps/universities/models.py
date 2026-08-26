from django.db import models
class Faculty(models.Model):
    name = models.CharField(max_length=160, unique=True)
    def __str__(self): return self.name
    class Meta: verbose_name_plural = "Faculties"
class Specialty(models.Model):
    faculty = models.ForeignKey(Faculty, on_delete=models.PROTECT, related_name="specialties")
    name = models.CharField(max_length=160)
    def __str__(self): return self.name
    class Meta: unique_together = ("faculty", "name"); verbose_name_plural = "Specialties"

