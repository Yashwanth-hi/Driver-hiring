from django.urls import re_path
from api.consumers import DriverRideConsumer

websocket_urlpatterns = [
    re_path(r"ws/driver/(?P<driver_id>\d+)/$", DriverRideConsumer.as_asgi()),
]
