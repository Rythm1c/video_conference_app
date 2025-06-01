from django.urls import path
from .views import CreateRoomView, CanvasStateView, ListRoomsView, JoinRoomView

urlpatterns = [
    path("create/", CreateRoomView.as_view(), name="create_room"),
    path("list/", ListRoomsView.as_view(), name="list_rooms"),
    path("join/", JoinRoomView.as_view(), name="join_room"),
    path("<str:code>/canvas/", CanvasStateView.as_view(), name="canvas_state"),
]
