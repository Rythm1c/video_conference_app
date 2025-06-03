from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import RetrieveAPIView, UpdateAPIView, ListAPIView
from rest_framework import status
from .models import Room, CanvasState
from .serializers import RoomSerializer, CanvasStateSerializer


class CreateRoomView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data.copy()
        data["created_by"] = request.user.id
        serializer = RoomSerializer(data=data)
        if serializer.is_valid():
            room = serializer.save(created_by=request.user)
            resp = RoomSerializer(room).data
            # include password in response for private rooms
            if room.is_private:
                resp["password"] = room.password
            return Response(resp, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ListRoomsView(ListAPIView):
    queryset = Room.objects.all().order_by("-created_at")
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]

class JoinRoomView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code = request.data.get("code")
        pwd = request.data.get("password", "")
        try:
            room = Room.objects.get(code=code)
        except Room.DoesNotExist:
            return Response(
                {"detail": "Room not found."}, status=status.HTTP_404_NOT_FOUND
            )

        if room.is_private:
            if pwd != room.password:
                return Response(
                    {"detail": "Invalid password."}, status=status.HTTP_400_BAD_REQUEST
                )
        return Response({"detail": "Joined"}, status=status.HTTP_200_OK)


class CanvasStateView(RetrieveAPIView, UpdateAPIView):
    serializer_class = CanvasStateSerializer
    permission_classes = [IsAuthenticated]
    lookup_url_kwarg = "code"

    def get_object(self):
        room = Room.objects.get(code=self.kwargs["code"])
        return CanvasState.objects.get_or_create(room=room)[0]
