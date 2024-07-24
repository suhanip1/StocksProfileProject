from datetime import datetime
from django.db import IntegrityError, connection
from django.shortcuts import render
from rest_framework import generics
from .models import StockList, Stock
from .serializers import StockListItemSerializer, StockListSerializer, UserSerializer, StockSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from django.http import JsonResponse, HttpResponse
from rest_framework.response import Response
from rest_framework import status
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
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM stocksapp_stocklistitem WHERE slid_id = %s", [slid])
            rows = cursor.fetchall()
            columns = [col[0] for col in cursor.description]
        
        stocklistitem = [dict(zip(columns, row)) for row in rows]
        
        return Response(stocklistitem, status=status.HTTP_200_OK)