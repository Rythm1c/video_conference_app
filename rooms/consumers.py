# rooms/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer

# In-memory store of active usernames per room.
# For production, consider using a shared store like Redis.
ROOM_USERS: dict[str, set[str]] = {}


class RoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_code = self.scope["url_route"]["kwargs"]["room_code"]
        self.group_name = f"room_{self.room_code}"

        # Ensure the attribute exists even before a "join" message arrives
        self.username = None

        # Join the channel layer group for this room
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Leave the channel layer group
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

        # If the user had joined, remove them and broadcast the updated list
        if self.username:
            users = ROOM_USERS.get(self.room_code, set())
            users.discard(self.username)
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "user_list",
                    "users": list(users),
                },
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        msg_type = data.get("type")

        if msg_type == "join":
            # Record this socket's username
            self.username = data["username"]
            users = ROOM_USERS.setdefault(self.room_code, set())
            users.add(self.username)

            if len(users) == 2:
                await self.channel_layer.group_send(
                    self.group_name, {"type": "start_call_event"}
                )

            # Broadcast the full updated user list
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "user_list",
                    "users": list(users),
                },
            )

        elif msg_type == "draw":
            # Broadcast drawing events to the room
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "draw_event",
                    "x": data["x"],
                    "y": data["y"],
                    "color": data.get("color", "#000000"),
                    "size": data.get("size", 4),
                },
            )
        elif msg_type == "chat":
            # broadcast chat message
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "chat_message",
                    "username": data["username"],
                    "text": data["text"],
                },
            )

        elif msg_type in ("webrtc_offer", "webrtc_answer", "webrtc_candidate"):
            # Relay WebRTC signaling messages
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "webrtc_signal",
                    "signal_type": msg_type,
                    "payload": data.get("payload"),
                    "sender": data.get("sender"),
                },
            )

    # Handlers for messages broadcast on the group:

    async def user_list(self, event):
        # Send the updated user list to the client
        await self.send(
            text_data=json.dumps(
                {
                    "type": "user_list",
                    "users": event["users"],
                }
            )
        )

    async def start_call_event(self, event):
        await self.send(text_data=json.dumps({"type": "start_call"}))

    async def draw_event(self, event):
        # Send drawing data to the client
        await self.send(
            text_data=json.dumps(
                {
                    "type": "draw",
                    "x": event["x"],
                    "y": event["y"],
                    "color": event["color"],
                    "size": event["size"],
                }
            )
        )

    async def chat_message(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "chat",
                    "username": event["username"],
                    "text": event["text"],
                }
            )
        )

    async def webrtc_signal(self, event):
        # Send WebRTC signaling data to the client
        await self.send(
            text_data=json.dumps(
                {
                    "type": event["signal_type"],
                    "payload": event["payload"],
                    "sender": event["sender"],
                }
            )
        )
