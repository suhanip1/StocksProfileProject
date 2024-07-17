from .models import User
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

class UserSerializer(serializers.ModelSerializer):
    #CREATE TABLE Client(uid INT, fname VARCHAR(20), lname VARCHAR(20), username VARCHAR(20) UNIQUE, email VARCHAR(30) UNIQUE, password VARCHAR(15), dateJoined TIMESTAMP, PRIMARY KEY(uid));";
    
    username = serializers.CharField(
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    email = serializers.EmailField(
        validators=[UniqueValidator(queryset=User.objects.all())]
    )

    class Meta:
        model = User
        fields = ["id", "username", "password", "first_name", "last_name", "email"]
        extra_kwargs = {'first_name': {'required': True, 'allow_blank': False},'last_name': {'required': True,'allow_blank': False}, "password": {"write_only": True}}
