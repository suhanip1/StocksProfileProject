from django.db import IntegrityError
from django.shortcuts import render
from rest_framework import generics
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from django.http import JsonResponse, HttpResponse
from rest_framework.response import Response
from rest_framework import status
from .models import User


# class SignupView(generics.CreateAPIView):
#     queryset = User.objects.all()
#     serializer_class = UserSerializer
#     permission_classes = [AllowAny]

class SignupView(APIView):
    def get(self, request, fname, lname, username, email, password):
        try:
            user = User.objects.create(first_name = fname, last_name= lname, username= username, email= email,password= password)
            user.save()
            return Response({'message': 'User creation successful'}, status=status.HTTP_201_CREATED)
        except IntegrityError as e:
            return Response({'message': 'duplicate user'})


        
    
