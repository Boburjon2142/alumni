from django.db.models import Q
from rest_framework import generics
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import AlumniProfile, FeaturedAlumni
from .serializers import FeaturedSerializer, OwnAlumniSerializer, PublicAlumniDetailSerializer, PublicAlumniListSerializer

def visible_profiles(request):
    return AlumniProfile.objects.filter(is_published=True).select_related("faculty", "specialty").distinct()

class AlumniListView(generics.ListAPIView):
    permission_classes = [AllowAny]; serializer_class = PublicAlumniListSerializer
    filterset_fields = {"graduation_year": ["exact"]}
    search_fields = ["full_name", "current_company", "position", "city", "country", "specialty__name", "faculty__name"]
    def get_queryset(self):
        qs = visible_profiles(self.request)
        search = self.request.query_params.get("search", "").strip()
        if len(search) > 100: raise ValidationError({"search": "Qidiruv matni 100 belgidan oshmasligi kerak."})
        faculty = self.request.query_params.get("faculty"); specialty = self.request.query_params.get("specialty")
        industry = self.request.query_params.get("industry")
        company = self.request.query_params.get("company"); location = self.request.query_params.get("location")
        if faculty: qs = qs.filter(faculty__name__icontains=faculty)
        if specialty: qs = qs.filter(specialty__name__icontains=specialty)
        if industry: qs = qs.filter(industry__icontains=industry)
        if company: qs = qs.filter(current_company__icontains=company)
        if location: qs = qs.filter(Q(city__icontains=location) | Q(country__icontains=location))
        ordering = self.request.query_params.get("ordering", "featured")
        allowed = {"name": ("full_name",), "graduation_year": ("-graduation_year", "full_name"), "newest": ("-published_at", "full_name"), "featured": ("-is_featured", "featured_order", "full_name")}
        return qs.order_by(*allowed.get(ordering, allowed["featured"]))

class AlumniDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]; serializer_class = PublicAlumniDetailSerializer; lookup_field = "slug"
    def get_queryset(self): return visible_profiles(self.request).prefetch_related("achievements", "timeline", "sources")

class MeView(APIView):
    permission_classes = [IsAuthenticated]
    def get_object(self, request):
        try: return request.user.alumni_profile
        except AlumniProfile.DoesNotExist: raise NotFound("Bitiruvchi profili topilmadi.")
    def get(self, request): return Response({"success": True, "data": OwnAlumniSerializer(self.get_object(request)).data})
    def patch(self, request):
        serializer = OwnAlumniSerializer(self.get_object(request), data=request.data, partial=True)
        serializer.is_valid(raise_exception=True); serializer.save()
        return Response({"success": True, "data": serializer.data})

class FeaturedListView(generics.ListAPIView):
    permission_classes = [AllowAny]; serializer_class = FeaturedSerializer; pagination_class = None
    def get_queryset(self):
        return FeaturedAlumni.objects.filter(is_active=True, alumni__is_published=True, alumni__is_featured=True).select_related("alumni", "alumni__faculty", "alumni__specialty")[:6]
