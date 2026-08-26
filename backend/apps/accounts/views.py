from django.contrib.auth import login, logout
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import LoginSerializer, RegisterSerializer, UserSerializer

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        s = RegisterSerializer(data=request.data); s.is_valid(raise_exception=True); user = s.save(); login(request, user)
        return Response({"success": True, "data": UserSerializer(user).data}, status=status.HTTP_201_CREATED)
class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        s = LoginSerializer(data=request.data, context={"request": request}); s.is_valid(raise_exception=True); login(request, s.validated_data["user"])
        return Response({"success": True, "data": UserSerializer(s.validated_data["user"]).data})
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request): logout(request); return Response(status=status.HTTP_204_NO_CONTENT)

