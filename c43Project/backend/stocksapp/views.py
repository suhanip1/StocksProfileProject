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
from rest_framework.decorators import api_view


class SignupView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = UserSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response({'message': 'User creation successful'}, status=status.HTTP_201_CREATED)
        else: 
            return Response({'message': 'duplicate user'})


@api_view(['GET'])
def get_current_user(request):
    user_id = request.user.id
    user_name = request.user.first_name + " " + request.user.last_name
    return Response({"user_id": user_id, "user_name": user_name})


        
    
