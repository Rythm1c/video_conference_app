from django.urls import path
from .views import RegisterView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import google_login, email_password_login


urlpatterns = [
    path("login/", email_password_login, name="email_password_login"),
    path("auth/google/", google_login, name="google_login"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("register/", RegisterView.as_view(), name="register"),
]
