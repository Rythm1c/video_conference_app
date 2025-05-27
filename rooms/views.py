from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import RetrieveAPIView, UpdateAPIView
from rest_framework import status
from .models import Room, CanvasState
from .serializers import RoomSerializer, CanvasStateSerializer


class CreateRoomView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = RoomSerializer(data=request.data)
        if serializer.is_valid():
            room = serializer.save(created_by=request.user)
            return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CanvasStateView(RetrieveAPIView, UpdateAPIView):
    serializer_class = CanvasStateSerializer
    permission_classes = [IsAuthenticated]
    lookup_url_kwarg = "code"

    def get_object(self):
        room = Room.objects.get(code=self.kwargs["code"])
        return CanvasState.objects.get_or_create(room=room)[0]
