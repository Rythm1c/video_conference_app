from rest_framework import serializers
from .models import Room, CanvasState


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ["code", "name", "created_by", "created_at"]
        read_only_fields = ["code", "created_by", "created_at"]


class CanvasStateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CanvasState
        fields = ["data", "updated_at"]
