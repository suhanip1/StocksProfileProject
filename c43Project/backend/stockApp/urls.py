from django.contrib import admin
from django.urls import path, include
from .views import CreateUserView, testView

urlpatterns = [
    path("user/register/", CreateUserView.as_view(), name="register"),
    path("test/", testView.as_view(), name="test"),
]