from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from django.http import JsonResponse, HttpResponse
from rest_framework.response import Response
from rest_framework import status


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class testView(APIView):
    def get(self, request, format=None):
        print("BACKEND WORKS ", len(User.objects.all()))
        return Response({'message': 'try'}, status=status.HTTP_201_CREATED)