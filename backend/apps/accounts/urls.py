from django.urls import path
from .views import (
    GoogleAuthView,
    GoogleConfigView,
    SessionView,
    LoginView,
    LogoutView,
    RegisterView,
    SendVerificationCodeView,
    VerifyCodeView,
)

urlpatterns = [
    path("session/", SessionView.as_view(), name="auth-session"),
    path("google/config/", GoogleConfigView.as_view(), name="auth-google-config"),
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("send-code/", SendVerificationCodeView.as_view(), name="auth-send-code"),
    path("verify-code/", VerifyCodeView.as_view(), name="auth-verify-code"),
    path("google/", GoogleAuthView.as_view(), name="auth-google"),
]

