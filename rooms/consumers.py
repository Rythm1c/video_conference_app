import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

#use redis instead of this
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
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name,
        )

        # Remove user from room if they had joined
        if self.username:
            users = ROOM_USERS.get(self.room_code, set())
            users.discard(self.username)

            # Safely remove empty room
            if not users:
                ROOM_USERS.pop(self.room_code, None)

            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "user_list",
                    "users": list(users),
                },
            )

    @database_sync_to_async
    def get_room_max_members(self, room_code):
        from .models import Room

        try:
            return Room.objects.get(code=room_code).max_members
        except Room.DoesNotExist:
            return 0  # 0 = unlimited

    async def receive(self, text_data):
        try:
            print(f"Received data: {text_data}")

            # Parse JSON
            try:
                data = json.loads(text_data)
            except json.JSONDecodeError:
                await self.send(
                    text_data=json.dumps(
                        {
                            "type": "error",
                            "message": (
                                "Invalid JSON format. "
                                "Expected a JSON object."
                            ),
                        }
                    )
                )
                return

            # Ensure object/dict
            if not isinstance(data, dict):
                await self.send(
                    text_data=json.dumps(
                        {
                            "type": "error",
                            "message": (
                                f"Expected JSON object, got {type(data)}"
                            ),
                        }
                    )
                )
                return

            msg_type = data.get("type")

            if not msg_type:
                await self.send(
                    text_data=json.dumps(
                        {
                            "type": "error",
                            "message": "Message type is required",
                        }
                    )
                )
                return

            # =========================================================
            # JOIN
            # =========================================================
            if msg_type == "join":
                if "username" not in data:
                    await self.send(
                        text_data=json.dumps(
                            {
                                "type": "error",
                                "message": "Username is required for join",
                            }
                        )
                    )
                    return

                self.username = data["username"]

                users = ROOM_USERS.setdefault(
                    self.room_code,
                    set(),
                )

                # Enforce member limit
                max_members = await self.get_room_max_members(
                    self.room_code
                )

                if max_members > 0 and len(users) >= max_members:
                    await self.send(
                        text_data=json.dumps(
                            {
                                "type": "error",
                                "message": (
                                    f"Room is full "
                                    f"({max_members} member limit reached)."
                                ),
                                "code": "room_full",
                            }
                        )
                    )

                    await self.close()
                    return

                users.add(self.username)

                await self.channel_layer.group_send(
                    self.group_name,
                    {
                        "type": "user_list",
                        "users": list(users),
                    },
                )

            # =========================================================
            # DRAW
            # =========================================================
            elif msg_type == "draw":
                required_fields = ["from", "to"]

                if not all(field in data for field in required_fields):
                    await self.send(
                        text_data=json.dumps(
                            {
                                "type": "error",
                                "message": (
                                    "Missing required fields for draw: "
                                    f"{required_fields}"
                                ),
                            }
                        )
                    )
                    return

                await self.channel_layer.group_send(
                    self.group_name,
                    {
                        "type": "draw_line_event",
                        "from": data["from"],
                        "to": data["to"],
                        "color": data.get("color", "#000000"),
                        "size": data.get("size", 4),
                    },
                )

            # =========================================================
            # CHAT
            # =========================================================
            elif msg_type == "chat":
                if "text" not in data or "username" not in data:
                    await self.send(
                        text_data=json.dumps(
                            {
                                "type": "error",
                                "message": (
                                    "Chat messages require "
                                    "text and username"
                                ),
                            }
                        )
                    )
                    return

                await self.channel_layer.group_send(
                    self.group_name,
                    {
                        "type": "chat_message",
                        "username": data["username"],
                        "text": data["text"],
                    },
                )

            # =========================================================
            # WEBRTC SIGNALING
            # =========================================================
            elif msg_type in (
                "webrtc_offer",
                "webrtc_answer",
                "webrtc_candidate",
            ):
                if "payload" not in data or "sender" not in data:
                    await self.send(
                        text_data=json.dumps(
                            {
                                "type": "error",
                                "message": (
                                    f"Missing required fields "
                                    f"for {msg_type}"
                                ),
                            }
                        )
                    )
                    return

                await self.channel_layer.group_send(
                    self.group_name,
                    {
                        "type": "webrtc_signal",
                        "signal_type": msg_type,
                        "payload": data["payload"],
                        "sender": data["sender"],
                        "target": data.get("target"),
                    },
                )

            # =========================================================
            # UNKNOWN MESSAGE TYPE
            # =========================================================
            else:
                await self.send(
                    text_data=json.dumps(
                        {
                            "type": "error",
                            "message": (
                                f"Unknown message type: {msg_type}"
                            ),
                        }
                    )
                )

        except Exception as e:
            import traceback

            print(f"Error in consumer: {str(e)}")
            print(traceback.format_exc())

            await self.send(
                text_data=json.dumps(
                    {
                        "type": "error",
                        "message": f"Server error: {str(e)}",
                    }
                )
            )

    # =============================================================
    # GROUP EVENT HANDLERS
    # =============================================================

    async def user_list(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "user_list",
                    "users": event["users"],
                }
            )
        )

    async def start_call_event(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "start_call",
                }
            )
        )

    async def draw_line_event(self, event):
        print("Broadcasting draw event:", event)

        await self.send(
            text_data=json.dumps(
                {
                    "type": "draw",
                    "from": event["from"],
                    "to": event["to"],
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
        """
        Send WebRTC signaling data to the intended client.

        If target is None, broadcast to everyone.
        """

        target = event.get("target")

        # If targeted and not meant for this user -> ignore
        if target and target != self.username:
            return

        await self.send(
            text_data=json.dumps(
                {
                    "type": event["signal_type"],
                    "payload": event["payload"],
                    "sender": event["sender"],
                    "target": target,
                }
            )
        )