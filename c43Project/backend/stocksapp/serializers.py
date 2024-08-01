from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.models import User
from .models import CashAccount, Friends, Portfolio, Purchase, Stock, StockHolding, StockPerformance, StockList, StockListItem, StockListAccessibleBy, Review


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
    
class FriendsSerializer(serializers.ModelSerializer):
    requester_username = serializers.CharField(source='requester.username', read_only=True)
    receiver_username = serializers.CharField(source='receiver.username', read_only=True)

    class Meta:
        model = Friends
        fields = ['id', 'receiver', 'requester', 'req_status', 'time_of_rejection', 'requester_username', 'receiver_username']


class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = ['symbol', 'strike_price']

class StockPerformanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockPerformance
        fields = ['timestamp', 'open', 'high', 'low', 'close', 'volume', 'symbol']


class StockListSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)  

    class Meta:
        model = StockList
        fields = ['slid', 'visibility', 'sl_name', 'user']
        

class StockListItemSerializer(serializers.ModelSerializer):
    slid = StockListSerializer(read_only=True)  
    symbol = StockSerializer(read_only=True)   
    class Meta:
        model = StockListItem
        fields = ['slid', 'symbol', 'shares']

class StockListAccessibleBySerializer(serializers.ModelSerializer):
    Slid = StockListSerializer(read_only=True)  
    user = UserSerializer(read_only=True)      
    class Meta:
        model = StockListAccessibleBy
        fields = ['slid', 'user']

class CashAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = CashAccount
        fields = ['acc_id', 'balance']

class PortfolioSerializer(serializers.ModelSerializer):
    cash_account = CashAccountSerializer(read_only=True)
    
    class Meta:
        model = Portfolio
        fields = ['pid', 'pname', 'user', "cash_account"]

class StockHoldingSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockHolding
        fields = ['pid', 'symbol', 'shares_owned']


class PurchaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Purchase
        fields = ['purchase_id', 'timestamp', 'quantity', 'purchase_price', 'user', 'symbol']
    
class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['slid', 'uid', 'reviewText', 'reviewDate']