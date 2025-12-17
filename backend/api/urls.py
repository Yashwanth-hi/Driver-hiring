from django.urls import path
from .views import (
    RegisterDriver, RegisterCustomer, DriverLogin, CustomerLogin,
    SendOTP, VerifyOTP, ApproveDriver, UpdateDriverStatus,
    CreateRideRequest, ListAvailableDrivers, AssignDriverToRide,
    DriverStartRide, DriverCompleteRide, CustomerRides, DriverRides,
    AdminLogin, DriverList,
    AllRides   # <-- NEW IMPORT
)

urlpatterns = [
    # registration
    path("register-driver/", RegisterDriver.as_view()),
    path("register-customer/", RegisterCustomer.as_view()),

    # login
    path("login-driver/", DriverLogin.as_view()),
    path("login-customer/", CustomerLogin.as_view()),
    path("login-admin/", AdminLogin.as_view()),

    # OTP
    path("send-otp/", SendOTP.as_view()),
    path("verify-otp/", VerifyOTP.as_view()),

    # admin driver approval
    path("admin/driver/<int:driver_id>/approve/", ApproveDriver.as_view()),

    # driver status updates
    path("driver/<int:driver_id>/status/", UpdateDriverStatus.as_view()),

    # ride management
    path("rides/create/", CreateRideRequest.as_view()),
    path("rides/available-drivers/", ListAvailableDrivers.as_view()),
    path("rides/<int:ride_id>/assign/", AssignDriverToRide.as_view()),
    path("rides/<int:ride_id>/start/", DriverStartRide.as_view()),
    path("rides/<int:ride_id>/complete/", DriverCompleteRide.as_view()),

    # ride history
    path("customer/<int:customer_id}/rides/", CustomerRides.as_view()),
    path("driver/<int:driver_id}/rides/", DriverRides.as_view()),

    # NEW ENDPOINT — list ALL rides (Admin)
    path("rides/", AllRides.as_view()),

    # list all drivers (admin)
    path("drivers/", DriverList.as_view()),
]
