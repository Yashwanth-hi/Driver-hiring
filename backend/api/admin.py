from django.contrib import admin
from .models import Driver, Customer, PhoneOTP, RideRequest

# ---------- ACTIONS ----------
@admin.action(description="Approve selected drivers")
def approve_drivers(modeladmin, request, queryset):
    queryset.update(approval_status="APPROVED")

@admin.action(description="Reject selected drivers")
def reject_drivers(modeladmin, request, queryset):
    queryset.update(approval_status="REJECTED")


# ---------- DRIVER ADMIN ----------
@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = ("id", "full_name", "phone", "email", "approval_status", "is_available", "created_at")
    list_filter = ("approval_status", "is_available")
    search_fields = ("full_name", "phone", "email")

    # Add the actions to the admin panel
    actions = [approve_drivers, reject_drivers]


# ---------- CUSTOMER ADMIN ----------
@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("id", "full_name", "phone", "email", "created_at")
    search_fields = ("full_name", "phone", "email")


# ---------- PHONE OTP ADMIN ----------
@admin.register(PhoneOTP)
class PhoneOTPAdmin(admin.ModelAdmin):
    list_display = ("phone", "otp", "is_verified", "created_at")


# ---------- RIDE REQUEST ADMIN ----------
@admin.register(RideRequest)
class RideRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "customer", "driver", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("customer__full_name", "driver__full_name")
