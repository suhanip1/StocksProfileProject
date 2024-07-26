from datetime import datetime
from django.db import IntegrityError, connection
from django.shortcuts import render
from rest_framework import generics
from .models import StockList, Stock
from .serializers import StockListItemSerializer, StockListSerializer, UserSerializer, StockSerializer
from .serializers import FriendsSerializer, UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from django.http import JsonResponse, HttpResponse
from rest_framework.response import Response
from rest_framework import status
from .models import Friends
from rest_framework.decorators import api_view
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from django.core.exceptions import ValidationError


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

@api_view(['GET'])
def find(request):
    username = request.GET.get('username')
    user = get_object_or_404(User, username=username)
    serializer = UserSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
def find_user(request, username):
    print(username)
    user = get_object_or_404(User, username=username)
    serializer = UserSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_friends(request):
    friends = Friends.objects.filter(req_status=Friends.ACCEPTED, receiver=request.user) | Friends.objects.filter(req_status=Friends.ACCEPTED, requester=request.user)
    serializer = FriendsSerializer(friends, many=True)
    return Response({'friends': [friend.receiver.username if friend.requester == request.user else friend.requester.username for friend in friends]}, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_pending_friends(request):
    pending_requests = Friends.objects.filter(receiver=request.user, req_status=Friends.PENDING)
    serializer = FriendsSerializer(pending_requests, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_our_pending_requests(request):
    sent_requests = Friends.objects.filter(requester=request.user, req_status=Friends.PENDING)
    serializer = FriendsSerializer(sent_requests, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
def send_friend_request(request, username):
    print(username)
    requester = request.user
    receiver = get_object_or_404(User, username=username)

   
    if receiver == requester:
        return Response({'message': 'You cannot friend yourself.'})
        
    try:
        friends = Friends(receiver=receiver, requester=requester)
        friends.clean() 
        friends.save()
        return Response({'message': 'Friend request sent successfully.'}, status=status.HTTP_201_CREATED)
    except (ValidationError, IntegrityError) as e:
        friends = Friends.objects.filter(receiver=requester, requester=receiver)
        if not friends.exists():
             friends = Friends.objects.filter(receiver=receiver, requester=requester)
        if friends.exists() and friends.first().req_status == Friends.PENDING:
            return Response({'message': 'Duplicate friend request.'})
        if friends.exists() and friends.first().req_status == Friends.REJECTED:
            friends = friends.first()
            time_remaining = (friends.time_of_rejection + timedelta(minutes=5)) - timezone.now()
            minutes_remaining = time_remaining.total_seconds() // 60
            if timezone.now() >= friends.time_of_rejection + timedelta(minutes=5):
                friends.req_status = Friends.PENDING
                print(friends.req_status)
                friends.time_of_rejection = None
                friends.save()
                return Response({'message': 'Friend request sent successfully.'}, status=status.HTTP_201_CREATED)
            return Response({'message': f'Please wait {int(minutes_remaining)} minutes.'})
        return Response({'message': 'Duplicate friend request.'})

@api_view(['PUT'])
def remove_friend(request, username):
    friend = Friends.objects.filter(receiver=request.user, requester__username=username) | Friends.objects.filter(receiver__username=username, requester=request.user)
    friend = friend.first()
    if friend:
        friend.req_status = friend.REJECTED
        friend.time_of_rejection = timezone.now()
        friend.save()
        return Response({'message': 'Friend removed successfully.'}, status=status.HTTP_200_OK)
    return Response({'message': 'Friend not found.'})

@api_view(['PUT'])
def accept_friend_request(request, username):
    friend_request = get_object_or_404(Friends, receiver=request.user, requester__username=username, req_status=Friends.PENDING)
    friend_request.req_status = Friends.ACCEPTED
    friend_request.save()
    return Response({'message': 'Friend request accepted.'}, status=status.HTTP_200_OK)

@api_view(['PUT'])
def remove_sent_request(request, username):
    friend_request = get_object_or_404(Friends, requester=request.user, receiver__username=username, req_status=Friends.PENDING)
    friend_request.delete()
    return Response({'message': 'Friend request removed.'}, status=status.HTTP_200_OK)

def stock_performance(request):
    symbol = request.GET.get('symbol')
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')

    if not symbol or not start_date or not end_date:
        return JsonResponse({'error': 'Missing parameters'}, status=400)

    try:
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        tdy = '2018-02-08'
        tdy_date = datetime.strptime(tdy, '%Y-%m-%d').date()
    except ValueError:
        return JsonResponse({'error': 'Invalid date format'}, status=400)
    
    
    # need to add todays data as well

    with connection.cursor() as cursor:
        query = '''
        SELECT timestamp, close
        FROM stocksapp_stockperformance
        WHERE symbol = %s
        AND timestamp BETWEEN %s AND %s
        ORDER BY timestamp;
        '''
        cursor.execute(query, [symbol, start_date, end_date])
        rows = cursor.fetchall()

    results = [{'timestamp': row[0], 'close': row[1]} for row in rows]
    
    return JsonResponse(results, safe=False)

class StockListCreateView(generics.CreateAPIView):
    # INSERT INTO StockList(slid, visibility, slname, user) VALUES (slid, visbility, slName, self.request.user)
    queryset = StockList.objects.all()
    serializer_class = StockListSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class StockListView(generics.ListAPIView):
    # SELECT * FROM StockLists WHERE uid=self.request.user


    queryset = StockList.objects.all()
    serializer_class = StockListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return StockList.objects.filter(user=self.request.user)
    
class StockListEditView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, slid, visibility, sl_name = ""):
        with connection.cursor() as cursor:
            if sl_name != "" and visibility:
                cursor.execute("UPDATE stocksapp_stocklist SET sl_name = %s, visibility = %s WHERE slid = %s", [sl_name, visibility, slid])
            elif sl_name != "":
                cursor.execute("UPDATE stocksapp_stocklist SET sl_name = %s WHERE slid = %s", [sl_name, slid])
            else: 
                cursor.execute("UPDATE stocksapp_stocklist SET visibility = %s WHERE slid = %s", [sl_name, visibility, slid])

        return Response(status=status.HTTP_204_NO_CONTENT)
    
class StockListDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, slid):
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM stocksapp_stocklist WHERE slid = %s", [slid])
        
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class StockListItemAddOrUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        slid = request.data.get('slid')
        symbol = request.data.get('symbol')
        shares = int(request.data.get('shares'))

        if not (slid and symbol and shares):
            return Response({"error": "Missing required fields: 'slid', 'symbol', and 'shares' are all required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with connection.cursor() as cursor:
                # Check if the stock list item exists
                cursor.execute("SELECT slid_id, symbol_id, shares FROM stocksapp_stocklistitem WHERE slid_id = %s AND symbol_id = %s", [slid, symbol])
                row = cursor.fetchone()

                if row:
                    # Update the existing stock list item
                    slid, symbol, current_shares = row
                    new_shares = current_shares + shares
                    cursor.execute("UPDATE stocksapp_stocklistitem SET shares = %s WHERE slid_id = %s AND symbol_id = %s", [new_shares, slid, symbol])
                    operation = "updated"
                else:
                    # Insert a new stock list item
                    cursor.execute("INSERT INTO stocksapp_stocklistitem (slid_id, symbol_id, shares) VALUES (%s, %s, %s)", [slid, symbol, shares])
                    operation = "created"

            return Response({"status": f"StockListItem successfully {operation}"}, status=status.HTTP_200_OK if row else status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    

class StockView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        symbol = request.GET.get('symbol')
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM stocksapp_stock WHERE symbol ILIKE %s", [symbol + '%'])
            rows = cursor.fetchall()
            columns = [col[0] for col in cursor.description]
        
        # Convert rows to list of dicts
        stocks = [dict(zip(columns, row)) for row in rows]

        serializer = StockSerializer(stocks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class StockListItemView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, slid):
        ### get all the information from stocklistitem and strikeprice of the symbol
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT sli.slid_id, sli.symbol_id, sli.shares, s.strike_price
                FROM stocksapp_stocklistitem sli
                JOIN stocksapp_stock s ON sli.symbol_id = s.symbol
                WHERE sli.slid_id = %s
            """, [slid])
            rows = cursor.fetchall()
            columns = [col[0] for col in cursor.description]
        
        stocklistitem = [dict(zip(columns, row)) for row in rows]
        
        return Response(stocklistitem, status=status.HTTP_200_OK)