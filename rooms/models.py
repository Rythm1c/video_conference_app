import uuid
from django.db import models
from django.contrib.auth.models import User


def generate_room_code():
    return uuid.uuid4().hex[:10].upper()


class Room(models.Model):
    code = models.CharField(max_length=10, unique=True, default=generate_room_code)
    name = models.CharField(max_length=100)
    is_private = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="created_rooms"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.code})"


class CanvasState(models.Model):
    room = models.OneToOneField(
        Room, on_delete=models.CASCADE, related_name="canvas_state"
    )
    data = models.JSONField(default=list)  # list of { x, y, color, size }
    updated_at = models.DateTimeField(auto_now=True)
