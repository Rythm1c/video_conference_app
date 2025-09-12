from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework.exceptions import ValidationError
import os


class RegisterView(APIView):
    def post(self, request):
        data = request.data
        try:
            validate_password(data["password"])
            user = User.objects.create_user(
                username=data["username"],
                email=data.get("email", ""),
                password=data["password"],
            )
            return Response({"message": "User created"}, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response({"errors": e.detail}, status=status.HTTP_400_BAD_REQUEST)


from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser


@api_view(["POST"])
@permission_classes([AllowAny])
def google_login(request):
    token = request.data.get("token")
    if not token:
        return Response({"error": "Token is required"}, status=400)

    try:
        idinfo = id_token.verify_oauth2_token(
            token, requests.Request(), os.getenv("CLIENT_ID")
        )

        email = idinfo["email"]
        name = idinfo.get("name", "")
        picture = idinfo.get("picture", "")

        user, created = CustomUser.objects.get_or_create(
            email=email,
            defaults={
                "first_name": name.split(" ")[0] if name else "",
                "last_name": (
                    " ".join(name.split(" ")[1:])
                    if name and len(name.split()) > 1
                    else ""
                ),
                "profile_picture": picture,
            },
        )
        if not user.first_name and name:
            user.first_name = name.split(" ")[0]
        if not user.last_name and len(name.split()) > 1:
            user.last_name = " ".join(name.split()[1:])
        if picture and not user.profile_picture:
            user.profile_picture = picture
        user.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "profile_picture": user.profile_picture,
            },
        })
    except Exception as e:
        return Response({"error": str(e)}, status=400)


from django.contrib.auth import authenticate


@api_view(["POST"])
@permission_classes([AllowAny])
def email_password_login(request):
    email = request.data.get("email")
    password = request.data.get("password")
    user = authenticate(request, email=email, password=password)

    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": {"email": user.email, "name": user.first_name},
            }
        )
    return Response({"error": "Invalid credentials"}, status=400)
