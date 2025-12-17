from rest_framework import serializers
from .models import Driver, Customer, PhoneOTP, RideRequest


# ----------------------------------------------------------
# DRIVER SERIALIZER
# ----------------------------------------------------------
class DriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Driver
        fields = "__all__"
        read_only_fields = (
            "is_available",
            "latitude",
            "longitude",
            "approval_status",
            "created_at",
        )

    def validate_phone(self, value):
        if Driver.objects.filter(phone=value).exists():
            raise serializers.ValidationError("Phone number already registered.")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        driver = Driver(**validated_data)

        if password:
            driver.set_password(password)

        driver.save()
        return driver


# ----------------------------------------------------------
# CUSTOMER SERIALIZER
# ----------------------------------------------------------
class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = "__all__"
        read_only_fields = ("created_at",)

    def validate_phone(self, value):
        if Customer.objects.filter(phone=value).exists():
            raise serializers.ValidationError("Phone number already registered.")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        customer = Customer(**validated_data)

        if password:
            customer.set_password(password)

        customer.save()
        return customer


# ----------------------------------------------------------
# PHONE OTP SERIALIZER
# ----------------------------------------------------------
class PhoneOTPSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhoneOTP
        fields = "__all__"


# ----------------------------------------------------------
# RIDE REQUEST SERIALIZER
# ----------------------------------------------------------
class RideRequestSerializer(serializers.ModelSerializer):
    # customer & driver assigned by backend, not form
    customer = serializers.PrimaryKeyRelatedField(read_only=True)
    driver = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = RideRequest
        fields = "__all__"
        read_only_fields = (
            "status",
            "created_at",
            "assigned_at",
            "started_at",
            "completed_at",
        )
