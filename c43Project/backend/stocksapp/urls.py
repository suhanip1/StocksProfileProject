from django.contrib import admin
from django.urls import path, include
from .views import *

urlpatterns = [
    path("user/register/<str:fname>/<str:lname>/<str:username>/<str:email>/<str:password>/", SignupView.as_view(), name="register"),
]