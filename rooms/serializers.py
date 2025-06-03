from rest_framework import serializers
from .models import Room, CanvasState


class RoomSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Room
        fields = ["code", "name", "is_private", "password", "created_by", "created_at"]
        read_only_fields = ["code", "created_by", "created_at"]

    def create(self, validated_data):
        pwd = validated_data.get("password")
        if not pwd:
            validated_data["password"] = ""  # or remove it completely
        return super().create(validated_data)


class CanvasStateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CanvasState
        fields = ["data", "updated_at"]
