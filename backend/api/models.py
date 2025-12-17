from django.db import models
from django.utils import timezone
from django.contrib.auth.hashers import make_password


# -------------------------------------------------------------
# DRIVER MODEL
# -------------------------------------------------------------
class Driver(models.Model):
    full_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    address = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=15, unique=True)
    password = models.CharField(max_length=255)  # hashed password

    license_file = models.FileField(upload_to="licenses/%Y/%m/%d/", null=True, blank=True)
    photo = models.ImageField(upload_to="driver_photos/%Y/%m/%d/", null=True, blank=True)

    experience_years = models.PositiveIntegerField(default=0)

    approval_status = models.CharField(
        max_length=20,
        choices=(
            ("PENDING", "Pending"),
            ("APPROVED", "Approved"),
            ("REJECTED", "Rejected"),
        ),
        default="PENDING",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    # Driver availability for ride assignment
    is_available = models.BooleanField(default=False)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    def set_password(self, raw_password):
        """Hashes password before saving"""
        self.password = make_password(raw_password)

    def __str__(self):
        return f"{self.full_name} ({self.phone})"

    class Meta:
        ordering = ["-created_at"]


# -------------------------------------------------------------
# CUSTOMER MODEL
# -------------------------------------------------------------
class Customer(models.Model):
    full_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, unique=True)
    address = models.CharField(max_length=255, blank=True)
    password = models.CharField(max_length=255)  # hashed password

    created_at = models.DateTimeField(auto_now_add=True)

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def __str__(self):
        return f"{self.full_name} ({self.phone})"

    class Meta:
        ordering = ["-created_at"]


# -------------------------------------------------------------
# OTP MODEL
# -------------------------------------------------------------
class PhoneOTP(models.Model):
    phone = models.CharField(max_length=15)  # removed unique=True
    otp = models.CharField(max_length=6)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.phone} - {self.otp}"

    class Meta:
        ordering = ["-created_at"]


# -------------------------------------------------------------
# RIDE REQUEST MODEL
# -------------------------------------------------------------
class RideRequest(models.Model):

    STATUS_CHOICES = (
        ("REQUESTED", "Requested"),
        ("ASSIGNED", "Assigned"),
        ("ONGOING", "Ongoing"),
        ("COMPLETED", "Completed"),
        ("CANCELLED", "Cancelled"),
    )

    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE, related_name="rides"
    )

    driver = models.ForeignKey(
        Driver, on_delete=models.SET_NULL, null=True, blank=True, related_name="rides"
    )

    # Pickup Information
    pickup_address = models.CharField(max_length=255)
    pickup_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    pickup_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    # Drop Information
    drop_address = models.CharField(max_length=255)
    drop_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    drop_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    # Fare
    estimated_fare = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="REQUESTED")

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    assigned_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Ride {self.id} - {self.customer.full_name} - {self.status}"

    class Meta:
        ordering = ["-created_at"]
