from django.urls import path
from .views import CreateRoomView, CanvasStateView

urlpatterns = [
    path("create/", CreateRoomView.as_view()),
]

urlpatterns += [
    path("<str:code>/canvas/", CanvasStateView.as_view(), name="canvas_state"),
]
