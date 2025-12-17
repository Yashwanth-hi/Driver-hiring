import json
from channels.generic.websocket import AsyncWebsocketConsumer


class DriverRideConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        try:
            print("WS CONNECT attempt")
            self.driver_id = self.scope["url_route"]["kwargs"]["driver_id"]
            self.group_name = f"driver_{self.driver_id}"

            print(f"Driver #{self.driver_id} connecting")
            await self.channel_layer.group_add(self.group_name, self.channel_name)

            await self.accept()
            print(f"WS ACCEPTED for {self.group_name}")

            # Optional welcome message
            await self.send(json.dumps({
                "event": "CONNECTED",
                "driver_id": self.driver_id,
                "message": "WebSocket connected successfully."
            }))

        except Exception as e:
            print("WS connection error:", e)
            await self.close()

    async def disconnect(self, close_code):
        print(f"WS DISCONNECTED for driver {getattr(self, 'driver_id', 'UNKNOWN')}")
        try:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
        except:
            pass  # already disconnected safely

    async def receive(self, text_data=None, bytes_data=None):
        """Handle messages sent FROM the driver app (optional)."""
        try:
            if text_data:
                data = json.loads(text_data)
                print("Message from driver:", data)

                # Example: driver sends current location
                if data.get("event") == "PING":
                    await self.send(json.dumps({"event": "PONG"}))

        except Exception as e:
            print("Error receiving driver message:", e)

    async def new_ride(self, event):
        """Send ride assignment to driver."""
        print("Sending ride event:", event)

        # Remove internal 'type' field
        event.pop("type", None)

        await self.send(text_data=json.dumps(event))
