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
    path("session", SessionView.as_view()),
    path("google/config/", GoogleConfigView.as_view(), name="auth-google-config"),
    path("google/config", GoogleConfigView.as_view()),
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("register", RegisterView.as_view()),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("login", LoginView.as_view()),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("logout", LogoutView.as_view()),
    path("send-code/", SendVerificationCodeView.as_view(), name="auth-send-code"),
    path("send-code", SendVerificationCodeView.as_view()),
    path("verify-code/", VerifyCodeView.as_view(), name="auth-verify-code"),
    path("verify-code", VerifyCodeView.as_view()),
    path("google/", GoogleAuthView.as_view(), name="auth-google"),
    path("google", GoogleAuthView.as_view()),
]

