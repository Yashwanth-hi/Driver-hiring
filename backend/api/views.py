from rest_framework import parsers
from rest_framework.views import APIView
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth import authenticate

from .models import Driver, Customer, PhoneOTP, RideRequest
from .serializers import (
    DriverSerializer, CustomerSerializer,
    PhoneOTPSerializer, RideRequestSerializer
)

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


# ----------------------------------------------------------
# HELPER — GENERATE JWT TOKENS
# ----------------------------------------------------------
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


# ----------------------------------------------------------
# DRIVER LOGIN
# ----------------------------------------------------------
class DriverLogin(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone = request.data.get("phone")
        password = request.data.get("password")

        if not phone or not password:
            return Response({"detail": "phone and password required"}, status=400)

        try:
            driver = Driver.objects.get(phone=phone)
        except Driver.DoesNotExist:
            return Response({"detail": "Invalid credentials"}, status=400)

        if not check_password(password, driver.password):
            return Response({"detail": "Invalid credentials"}, status=400)

        if driver.approval_status != "APPROVED":
            return Response({"detail": "Driver not approved yet"}, status=403)

        tokens = get_tokens_for_user(driver)

        return Response({
            "message": "Login successful",
            "driver": DriverSerializer(driver).data,
            "tokens": tokens
        })


# ----------------------------------------------------------
# CUSTOMER LOGIN
# ----------------------------------------------------------
class CustomerLogin(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone = request.data.get("phone")
        password = request.data.get("password")

        try:
            customer = Customer.objects.get(phone=phone)
        except Customer.DoesNotExist:
            return Response({"detail": "Invalid credentials"}, status=400)

        if not check_password(password, customer.password):
            return Response({"detail": "Invalid credentials"}, status=400)

        tokens = get_tokens_for_user(customer)

        return Response({
            "message": "Login successful",
            "customer": CustomerSerializer(customer).data,
            "tokens": tokens
        })


# ----------------------------------------------------------
# ADMIN LOGIN
# ----------------------------------------------------------
class AdminLogin(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)

        if user is None:
            return Response({"detail": "Invalid admin credentials"}, status=400)

        if not user.is_staff:
            return Response({"detail": "Not an admin user"}, status=403)

        tokens = get_tokens_for_user(user)

        return Response({
            "message": "Admin login successful",
            "tokens": tokens,
            "admin": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
        })


# ----------------------------------------------------------
# DRIVER REGISTRATION
# ----------------------------------------------------------
class RegisterDriver(APIView):
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone = request.data.get("phone")
        password = request.data.get("password")

        if Driver.objects.filter(phone=phone).exists():
            return Response({"detail": "Phone already registered"}, status=400)

        otp_obj = PhoneOTP.objects.filter(phone=phone, is_verified=True).last()
        if not otp_obj:
            return Response({"detail": "Phone not verified"}, status=400)

        data = request.data.copy()
        data["password"] = make_password(password)

        serializer = DriverSerializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        serializer.save()
        return Response({"message": "Driver registered successfully"}, status=201)


# ----------------------------------------------------------
# CUSTOMER REGISTRATION
# ----------------------------------------------------------
class RegisterCustomer(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data.copy()
        data["password"] = make_password(data.get("password"))

        serializer = CustomerSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Customer registered successfully"}, status=201)

        return Response(serializer.errors, status=400)


# ----------------------------------------------------------
# SEND OTP
# ----------------------------------------------------------
class SendOTP(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone = request.data.get("phone")
        if not phone:
            return Response({"detail": "Phone required"}, status=400)

        import random
        code = str(random.randint(1000, 9999))

        PhoneOTP.objects.update_or_create(
            phone=phone,
            defaults={
                "otp": code,
                "is_verified": False,
                "created_at": timezone.now()
            }
        )

        return Response({"message": "OTP sent", "otp": code})


# ----------------------------------------------------------
# VERIFY OTP
# ----------------------------------------------------------
class VerifyOTP(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone = request.data.get("phone")
        otp = str(request.data.get("otp", "")).strip()

        obj = PhoneOTP.objects.filter(phone=phone).last()
        if not obj:
            return Response({"detail": "OTP not found"}, status=400)

        if timezone.now() - obj.created_at > timezone.timedelta(minutes=10):
            return Response({"detail": "OTP expired"}, status=400)

        if otp != str(obj.otp).strip():
            return Response({"detail": "Incorrect OTP"}, status=400)

        obj.is_verified = True
        obj.save()

        return Response({"message": "OTP verified"})


# ----------------------------------------------------------
# DRIVER APPROVAL
# ----------------------------------------------------------
class ApproveDriver(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, driver_id):
        driver = get_object_or_404(Driver, id=driver_id)
        action = request.data.get("action")

        if action == "approve":
            driver.approval_status = "APPROVED"
        elif action == "reject":
            driver.approval_status = "REJECTED"
        else:
            return Response({"detail": "Invalid action"}, status=400)

        driver.save()

        return Response({
            "message": "Driver status updated",
            "approval_status": driver.approval_status
        })


# ----------------------------------------------------------
# UPDATE DRIVER STATUS
# ----------------------------------------------------------
class UpdateDriverStatus(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, driver_id):
        driver = get_object_or_404(Driver, id=driver_id)

        is_available = request.data.get("is_available")
        lat = request.data.get("latitude")
        lng = request.data.get("longitude")

        if is_available is not None:
            driver.is_available = str(is_available).lower() == "true"

        if lat:
            driver.latitude = lat
        if lng:
            driver.longitude = lng

        driver.save()

        return Response({
            "message": "Driver status updated",
            "is_available": driver.is_available
        })


# ----------------------------------------------------------
# CREATE RIDE
# ----------------------------------------------------------
class CreateRideRequest(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        customer_id = request.data.get("customer_id")
        customer = get_object_or_404(Customer, id=customer_id)

        data = {
            "customer": customer.id,
            "pickup_address": request.data.get("pickup_address"),
            "pickup_lat": request.data.get("pickup_lat"),
            "pickup_lng": request.data.get("pickup_lng"),
            "drop_address": request.data.get("drop_address"),
            "drop_lat": request.data.get("drop_lat"),
            "drop_lng": request.data.get("drop_lng"),
            "estimated_fare": request.data.get("estimated_fare")
        }

        serializer = RideRequestSerializer(data=data)

        if serializer.is_valid():
            ride = serializer.save()
            return Response(RideRequestSerializer(ride).data, status=201)

        return Response(serializer.errors, status=400)


# ----------------------------------------------------------
# LIST AVAILABLE DRIVERS
# ----------------------------------------------------------
class ListAvailableDrivers(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        drivers = Driver.objects.filter(is_available=True, approval_status="APPROVED")
        return Response({"drivers": DriverSerializer(drivers, many=True).data})


# ----------------------------------------------------------
# ASSIGN DRIVER + SEND REAL-TIME EVENT
# ----------------------------------------------------------
class AssignDriverToRide(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, ride_id):
        ride = get_object_or_404(RideRequest, id=ride_id)

        if ride.driver:
            return Response({"detail": "Ride already assigned"}, status=400)

        driver_id = request.data.get("driver_id")
        driver = get_object_or_404(Driver, id=driver_id)

        if driver.approval_status != "APPROVED" or not driver.is_available:
            return Response({"detail": "Driver not available"}, status=400)

        ride.driver = driver
        ride.status = "ASSIGNED"
        ride.assigned_at = timezone.now()
        ride.save()

        driver.is_available = False
        driver.save()

        # SEND REAL-TIME NOTIFICATION
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"driver_{driver.id}",
            {
                "type": "new_ride",
                "message": "New ride assigned!",
                "ride_id": ride.id,
                "pickup": ride.pickup_address,
                "drop": ride.drop_address,
            }
        )

        return Response({
            "message": "Driver assigned",
            "ride": RideRequestSerializer(ride).data
        })


# ----------------------------------------------------------
# START RIDE
# ----------------------------------------------------------
class DriverStartRide(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, ride_id):
        ride = get_object_or_404(RideRequest, id=ride_id)

        if ride.status != "ASSIGNED":
            return Response({"detail": "Ride not in assigned state"}, status=400)

        ride.status = "ONGOING"
        ride.started_at = timezone.now()
        ride.save()

        return Response({"message": "Ride started"})


# ----------------------------------------------------------
# COMPLETE RIDE
# ----------------------------------------------------------
class DriverCompleteRide(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, ride_id):
        ride = get_object_or_404(RideRequest, id=ride_id)

        if ride.status != "ONGOING":
            return Response({"detail": "Ride not started"}, status=400)

        ride.status = "COMPLETED"
        ride.completed_at = timezone.now()
        ride.save()

        if ride.driver:
            ride.driver.is_available = True
            ride.driver.save()

        return Response({"message": "Ride completed"})


# ----------------------------------------------------------
# CUSTOMER RIDES
# ----------------------------------------------------------
class CustomerRides(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, customer_id):
        rides = RideRequest.objects.filter(customer_id=customer_id).order_by("-created_at")
        return Response(RideRequestSerializer(rides, many=True).data)


# ----------------------------------------------------------
# DRIVER RIDES
# ----------------------------------------------------------
class DriverRides(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, driver_id):
        rides = RideRequest.objects.filter(driver_id=driver_id).order_by("-created_at")
        return Response(RideRequestSerializer(rides, many=True).data)


# ----------------------------------------------------------
# DRIVER LIST (ADMIN)
# ----------------------------------------------------------
class DriverList(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        drivers = Driver.objects.all().order_by("-id")
        return Response(DriverSerializer(drivers, many=True).data)
    # ----------------------------------------------------------
# LIST ALL RIDES (ADMIN ONLY)
# ----------------------------------------------------------
class AllRides(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        rides = RideRequest.objects.all().order_by("-created_at")
        return Response(RideRequestSerializer(rides, many=True).data)

