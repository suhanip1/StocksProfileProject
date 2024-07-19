from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.models import User


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
        fields = ('username', 'email', 'first_name',  'last_name', 'password')
        extra_kwargs = {
            'first_name': {'required': True, 'allow_blank': False},
            'last_name': {'required': True,'allow_blank': False},
            'password': {'write_only': True},
        }

    def create(self, validated_data):
        validated_data['first_name'] = validated_data['first_name'].capitalize()
        validated_data['last_name'] = validated_data['last_name'].capitalize()
        return User.objects.create_user(**validated_data)

    def validate_password(self, value):
        validate_password(value)
        return value
    

    
