"""
Django settings for driverhiring project.
"""

from pathlib import Path
import os
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = "django-insecure-bn^^1&_0daxm3dzarojr4+2e(wn=jmwddsji^3_k%y_u-u4#@1"

DEBUG = True
ALLOWED_HOSTS = ["*"]   # Allow everything in development


# -----------------------------------------------------------
# Installed Apps
# -----------------------------------------------------------
INSTALLED_APPS = [
    # Django Core
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third Party Apps
    'rest_framework',
    'corsheaders',
    'rest_framework_simplejwt',
    'channels',   # For WebSockets

    # Local App
    'api',
]


# -----------------------------------------------------------
# Middleware
# -----------------------------------------------------------
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",

    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


ROOT_URLCONF = 'driverhiring.urls'


# -----------------------------------------------------------
# Templates
# -----------------------------------------------------------
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [], 
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


# -----------------------------------------------------------
# WSGI + ASGI
# -----------------------------------------------------------
WSGI_APPLICATION = 'driverhiring.wsgi.application'
ASGI_APPLICATION = 'driverhiring.asgi.application'   # IMPORTANT for WebSockets


# -----------------------------------------------------------
# Database (MySQL)
# -----------------------------------------------------------
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'driverhiring',
        'USER': 'root',
        'PASSWORD': 'Yash@2004',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}


# -----------------------------------------------------------
# Authentication
# -----------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    # Disabled in development
]


# -----------------------------------------------------------
# Localization
# -----------------------------------------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# -----------------------------------------------------------
# Static & Media Files
# -----------------------------------------------------------
STATIC_URL = '/static/'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# -----------------------------------------------------------
# CORS SETTINGS
# -----------------------------------------------------------
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_HEADERS = ['*']
CORS_ALLOW_METHODS = ['*']


# -----------------------------------------------------------
# DRF + JWT
# -----------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.AllowAny",  # Easier for dev
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "AUTH_HEADER_TYPES": ("Bearer",),
}


# -----------------------------------------------------------
# CHANNELS + REDIS (REAL-TIME WEBSOCKETS)
# -----------------------------------------------------------
# Make sure Redis is running on localhost:6379
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer"
    }
}

