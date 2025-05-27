from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework.exceptions import ValidationError

class RegisterView(APIView):
    def post(self, request):
        data = request.data
        try:
            validate_password(data["password"])
            user = User.objects.create_user(
                username=data["username"],
                email=data.get("email", ""),
                password=data["password"]
            )
            return Response({"message": "User created"}, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response({"errors": e.detail}, status=status.HTTP_400_BAD_REQUEST)
