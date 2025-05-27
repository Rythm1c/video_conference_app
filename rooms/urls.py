from django.urls import path
from .views import CreateRoomView, CanvasStateView, ListPublicRoomsView

urlpatterns = [
    path("create/", CreateRoomView.as_view()),
]
urlpatterns += [
    path("public/", ListPublicRoomsView.as_view(), name="list_public_rooms"),
]


urlpatterns += [
    path("<str:code>/canvas/", CanvasStateView.as_view(), name="canvas_state"),
]
