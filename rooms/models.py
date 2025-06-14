import uuid, secrets
from django.db import models
from django.contrib.auth.models import User


def generate_room_code():
    return uuid.uuid4().hex[:10].upper()


def generate_password():
    return secrets.token_urlsafe(6)  # ~8 chars


class Room(models.Model):
    code = models.CharField(max_length=10, unique=True, default=generate_room_code)
    name = models.CharField(max_length=100)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    is_private = models.BooleanField(default=False)
    password = models.CharField(max_length=64, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.is_private and not self.password:
            self.password = generate_password()
        else:
            self.password = ""  # clear any leftover value
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.code})"


class CanvasState(models.Model):
    room = models.OneToOneField(
        Room, on_delete=models.CASCADE, related_name="canvas_state"
    )
    data = models.JSONField(default=list)  # list of { x, y, color, size }
    updated_at = models.DateTimeField(auto_now=True)
