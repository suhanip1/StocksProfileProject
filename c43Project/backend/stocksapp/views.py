from datetime import datetime
import json
from django.db import IntegrityError, connection, transaction
from django.shortcuts import render
from rest_framework import generics
from .models import CashAccount, Portfolio, Purchase, StockHolding, StockList, Stock, StockPerformance
from .serializers import PortfolioSerializer, StockListItemSerializer, StockPerformanceSerializer, UserSerializer, StockSerializer
from .models import StockList, Stock, StockListAccessibleBy, Friends, Review
from .serializers import StockListItemSerializer, StockListSerializer, UserSerializer, ReviewSerializer
from .serializers import FriendsSerializer, StockListAccessibleBySerializer 
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
from datetime import datetime, timedelta
from django.core.exceptions import ValidationError, ObjectDoesNotExist


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


def get_latest_date(request):
    with connection.cursor() as cursor:
        cursor.execute('SELECT MAX(timestamp) FROM stocksapp_stockperformance')
        max_date = cursor.fetchone()[0]

        if not max_date:
            return JsonResponse({'error': 'No data available'}, status=404)
    
        formatted_date = max_date.strftime('%Y-%m-%d')

        return JsonResponse({'latest_date': formatted_date})
    

@api_view(['GET'])
def get_current_username(request):
    username = request.user.username
    return Response({"username": username})


@api_view(['GET'])
def find(request):
    username = request.GET.get('username')
    user = get_object_or_404(User, username=username)
    serializer = UserSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
def find_user(request, username):
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
    interval = request.GET.get('interval')

    if not symbol or not interval:
        return JsonResponse({'error': 'Missing parameters'}, status=400)
    
    with connection.cursor() as cursor:
        # set current date as the max_date in stockperformance
        cursor.execute('SELECT MAX(timestamp) FROM stocksapp_stockperformance')
        max_date = cursor.fetchone()[0]

        if not max_date:
            return JsonResponse({'error': 'No data available'}, status=404)

        end_date = max_date

        # get start date
        if interval == 'week':
            start_date = end_date - timedelta(weeks=1)
        elif interval == 'month':
            start_date = end_date - timedelta(days=30)
        elif interval == 'quarter':
            start_date = end_date.replace(month=end_date.month - 3 if end_date.month > 3 else end_date.month - 3 + 12, 
                                          year=end_date.year if end_date.month > 3 else end_date.year - 1)
        elif interval == 'year':
            start_date = end_date.replace(year=end_date.year - 1)
        elif interval == 'five_years':
            start_date = end_date.replace(year=end_date.year - 5)
        else:
            return JsonResponse({'error': 'Invalid interval parameter'}, status=400)

        # get all data for symbol between start date and end date
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

def predict_prices(request, symbol, pastInterval, futureInterval):

    intervals = {
        'week': '7 days',
        'month': '30 days',
        'quarter': '90 days',
        'year': '365 days'
    }

    if futureInterval not in intervals:
        return JsonResponse({'error': 'Invalid interval'}, status=400)

    days = intervals[futureInterval]

    with connection.cursor() as cursor:
        # current date
        cursor.execute('SELECT MAX(timestamp) FROM stocksapp_stockperformance')
        max_date = cursor.fetchone()[0]

        if not max_date:
            return JsonResponse({'error': 'No data available'}, status=404)

        end_date = max_date

        # start date
        if pastInterval == 'week':
            start_date = end_date - timedelta(weeks=1)
        elif pastInterval == 'month':
            start_date = end_date - timedelta(days=30)
        elif pastInterval == 'quarter':
            start_date = end_date.replace(month=end_date.month - 3 if end_date.month > 3 else end_date.month - 3 + 12, 
                                          year=end_date.year if end_date.month > 3 else end_date.year - 1)
        elif pastInterval == 'year':
            start_date = end_date.replace(year=end_date.year - 1)
        elif pastInterval == 'five_years':
            start_date = end_date.replace(year=end_date.year - 5)
        else:
            return JsonResponse({'error': 'Invalid interval parameter'}, status=400)
        
        # 1. get the dates we are calculating the predicted prices for
        # 2. get the returns for the given symbol and the returns for the index
        # 3. calculate the beta and average return of the given symbol
        # 4. use (1 + (a.avg_return * b.beta) * (ROW_NUMBER() OVER (ORDER BY f.timestamp))) as formula for predicted prices
        cursor.execute(f"""
        WITH RECURSIVE future_dates AS (
            SELECT 
                MAX(timestamp) + INTERVAL '1 day' AS timestamp
            FROM 
                stocksapp_stockperformance
            WHERE 
                symbol = %s
            UNION ALL
            SELECT 
                timestamp + INTERVAL '1 day'
            FROM 
                future_dates
            WHERE 
                timestamp < (SELECT MAX(timestamp) + INTERVAL %s FROM stocksapp_stockperformance WHERE symbol = %s)
        ),
        Returns AS (
            SELECT
                current.timestamp,
                current.close AS stock_close,
                prev.close AS stock_prev_close,
                (current.close - prev.close) / prev.close AS return
            FROM
                stocksapp_stockperformance current
            JOIN
                stocksapp_stockperformance prev
            ON
                current.symbol = prev.symbol
                AND prev.timestamp = (
                    SELECT MAX(p.timestamp)
                    FROM stocksapp_stockperformance p
                    WHERE p.symbol = current.symbol
                    AND p.timestamp < current.timestamp
                )
            WHERE
                current.symbol = %s
                AND current.timestamp BETWEEN %s AND %s
        ),
        AvgReturn AS (
            SELECT 
                AVG(return) AS avg_return
            FROM Returns
        ),
        benchmark_returns AS (
            SELECT
                current.timestamp,
                current.close AS benchmark_close,
                prev.close AS benchmark_prev_close,
                (current.close - prev.close) / prev.close AS benchmark_return
            FROM
                stocksapp_stockperformance current
            JOIN
                stocksapp_stockperformance prev
            ON
                current.symbol = prev.symbol
                AND prev.timestamp = (
                    SELECT MAX(p.timestamp)
                    FROM stocksapp_stockperformance p
                    WHERE p.symbol = current.symbol
                    AND p.timestamp < current.timestamp
                )
            WHERE
                current.symbol = 'SPY'
                AND current.timestamp BETWEEN %s AND %s
        ),
        combined_returns AS (
            SELECT
                s.timestamp,
                s.return,
                b.benchmark_return
            FROM
                Returns s
            JOIN
                benchmark_returns b
            ON
                s.timestamp = b.timestamp
        ),
        covariance_variance AS (
            SELECT
                COVAR_SAMP(return, benchmark_return) AS covariance,
                VARIANCE(benchmark_return) AS variance
            FROM
                combined_returns
        ), 
        Beta AS (
            SELECT
                covariance / variance AS beta
            FROM
                covariance_variance
        ),
        predictions AS (
            SELECT 
                f.timestamp,
                NULL AS close,
                (SELECT MAX(close) FROM stocksapp_stockperformance WHERE symbol = %s) * 
                (1 + (a.avg_return * b.beta) * (ROW_NUMBER() OVER (ORDER BY f.timestamp))) AS predicted_price
            FROM 
                future_dates f,
                AvgReturn a,
                Beta b
        )
        SELECT 
            timestamp,
            close,
            predicted_price
        FROM 
            predictions
        WHERE timestamp > (SELECT MAX(timestamp) FROM stocksapp_stockperformance WHERE symbol = %s)
        ORDER BY 
            Timestamp;
        """, [symbol, days, symbol, symbol, start_date, end_date, start_date, end_date, symbol, symbol])

        rows = cursor.fetchall()

    data = [{'timestamp': row[0], 'close': row[2]} for row in rows]
    return JsonResponse(data, safe=False)

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
    # edit the stocklist name and/or visibility
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
        stock_list = get_object_or_404(StockList, pk=slid)
        stock_list.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class StockListItemAddOrUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # add/update number of shares of a stock in the stocklist 
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

@api_view(['POST'])
def remove_stock_list_item(request, slid, symbol, shares):
    # removing shares of a stock from a stock list
    try:
        shares = int(shares)
        if shares <= 0:
            return Response({"error": "Number of shares must be greater than zero."}, status=status.HTTP_400_BAD_REQUEST)
    except ValueError:
        return Response({"error": "Number of shares must be a valid integer."}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        try:
            with connection.cursor() as cursor:
                # Check if the stock list item exists and fetch the current number of shares
                cursor.execute("""
                    SELECT shares
                    FROM stocksapp_stocklistitem
                    WHERE slid_id = %s AND symbol_id = %s
                """, [slid, symbol])
                
                row = cursor.fetchone()
                
                if not row:
                    return Response({"error": "Stock list item not found."}, status=status.HTTP_404_NOT_FOUND)

                current_shares = row[0]

                if current_shares < shares:
                    return Response({"error": "Not enough shares to remove."}, status=status.HTTP_400_BAD_REQUEST)

                if current_shares == shares:
                    # Delete the stock list item if shares to remove are equal to the existing shares
                    cursor.execute("""
                        DELETE FROM stocksapp_stocklistitem
                        WHERE slid_id = %s AND symbol_id = %s
                    """, [slid, symbol])
                else:
                    # Otherwise, update the number of shares
                    new_shares = current_shares - shares
                    cursor.execute("""
                        UPDATE stocksapp_stocklistitem
                        SET shares = %s
                        WHERE slid_id = %s AND symbol_id = %s
                    """, [new_shares, slid, symbol])
            
            return Response({"status": "Stock list item updated successfully."}, status=status.HTTP_200_OK)

        except Exception as e:
            # Rollback transaction and return an error response
            transaction.set_rollback(True)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class StocklistMarketValueView(APIView):
    # get the market value of the stock list
    permission_classes = [IsAuthenticated]

    def get(self, request, slid):
        try: 
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT SUM(si.shares * s.strike_price) AS total_value
                    FROM stocksapp_stocklistitem AS si
                    JOIN stocksapp_stock AS s ON s.symbol = si.symbol_id
                    WHERE si.slid_id = %s;
                """, [slid])

                row = cursor.fetchone()
                total_value = row[0] if row[0] is not None else 0
            return JsonResponse({'stocklist_id': slid, 'market_value': total_value})
        except Portfolio.DoesNotExist:
            return JsonResponse({'error': 'Portfolio not found'}, status=404)    

class StockView(APIView):
    # searching for a stock, get all stocks that start with the provided string
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


class GetStrikePriceView(APIView):
    # get current strike price of a stock
    permission_classes = [IsAuthenticated]

    def get(self, request, symbol):
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT strike_price
                FROM stocksapp_stock
                WHERE symbol = %s
            """, [symbol])
            row = cursor.fetchone()

        if row:
            strike_price = row[0]
            return Response({"symbol": symbol, "strike_price": strike_price}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Stock not found."}, status=status.HTTP_404_NOT_FOUND)
        

class StockListItemView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, slid):
        # get all the information from stocklistitem and strikeprice of the symbol
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
    

class PortfolioCreateView(generics.CreateAPIView):
    queryset = Portfolio.objects.all()
    serializer_class = PortfolioSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # INSERT INTO Portfolio(pid, pname, uid, accId) VALUES (pid, pname, user, cash_account)
        user = self.request.user
        cash_account = CashAccount.objects.create(balance=0.00)  # Create a new CashAccount
        serializer.save(user=user, cash_account=cash_account)  # Save the Portfolio with the new CashAccount

class PortfolioView(generics.ListAPIView):
    # SELECT * FROM Portfolio WHERE uid=self.request.user
    queryset = Portfolio.objects.all()
    serializer_class = PortfolioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Portfolio.objects.filter(user=self.request.user)
    
class PortfolioEditView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pid, pname = ""):
        # edit the name of the portfolio
        with connection.cursor() as cursor:
            if pname != "" and pid:
                cursor.execute("UPDATE stocksapp_portfolio SET pname = %s WHERE pid = %s", [pname, pid])

        return Response(status=status.HTTP_204_NO_CONTENT)
    
class PortfolioDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pid):
        portfolio = get_object_or_404(Portfolio, pk=pid)
        portfolio.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class StockHoldingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pid):
        # get all the information from stockholdings and strikeprice of the symbol
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT sh.pid_id, sh.symbol_id, sh.shares_owned, s.strike_price
                FROM stocksapp_stockholding sh
                JOIN stocksapp_stock s ON sh.symbol_id = s.symbol
                WHERE sh.pid_id = %s
            """, [pid])
            rows = cursor.fetchall()
            columns = [col[0] for col in cursor.description]
        
        stocklistitem = [dict(zip(columns, row)) for row in rows]
        
        return Response(stocklistitem, status=status.HTTP_200_OK)
    
class PortfolioMarketValueView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pid):
        # get market value of portfolio
        try: 
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT SUM(sh.shares_owned * s.strike_price) AS total_value
                    FROM stocksapp_stockholding AS sh
                    JOIN stocksapp_stock AS s ON s.symbol = sh.symbol_id
                    WHERE sh.pid_id = %s;
                """, [pid])

                row = cursor.fetchone()
                total_value = row[0] if row[0] is not None else 0
            return JsonResponse({'portfolio_id': pid, 'market_value': total_value})
        except Portfolio.DoesNotExist:
            return JsonResponse({'error': 'Portfolio not found'}, status=404)

class PortfolioCashBalanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pid):
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT ca.acc_id, ca.balance
                FROM stocksapp_cashaccount ca
                JOIN stocksapp_portfolio p ON p.cash_account_id = ca.acc_id
                WHERE p.pid = %s
            """, [pid])
            row = cursor.fetchone()
        
        if row:
            acc_id, balance = row
            return Response({"acc_id": acc_id, "balance": balance}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Portfolio or Cash Account not found"}, status=status.HTTP_404_NOT_FOUND)
        

class PortfolioCashTransferView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pid1, pid2, amount):
        # deposit cash from another cash account
        if not (pid1 and pid2 and amount):
            return Response({"error": "Missing required fields: 'pid1', 'pid2', and 'amount' are all required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            amount = round(float(amount), 2)
        except ValueError:
            return Response({"error": "Amount must be a valid number."}, status=status.HTTP_400_BAD_REQUEST)

        if amount <= 0:
            return Response({"error": "Amount must be greater than zero."}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cursor:
            # Get balances for both portfolios
            cursor.execute("""
                SELECT ca.acc_id, ca.balance
                FROM stocksapp_cashaccount ca
                JOIN stocksapp_portfolio p ON p.cash_account_id = ca.acc_id
                WHERE p.pid = %s
            """, [pid1])
            row1 = cursor.fetchone()

            cursor.execute("""
                SELECT ca.acc_id, ca.balance
                FROM stocksapp_cashaccount ca
                JOIN stocksapp_portfolio p ON p.cash_account_id = ca.acc_id
                WHERE p.pid = %s
            """, [pid2])
            row2 = cursor.fetchone()

            if not row1 or not row2:
                return Response({"error": "One or both portfolios not found."}, status=status.HTTP_404_NOT_FOUND)

            acc_id1, balance1 = row1
            acc_id2, balance2 = row2

            if balance2 < amount:
                return Response({"error": "Insufficient funds in the source portfolio."}, status=status.HTTP_400_BAD_REQUEST)

            # Perform the transfer
            new_balance1 = round(balance1 + amount, 2)
            new_balance2 = round(balance2 - amount, 2)

            cursor.execute("UPDATE stocksapp_cashaccount SET balance = %s WHERE acc_id = %s", [new_balance1, acc_id1])
            cursor.execute("UPDATE stocksapp_cashaccount SET balance = %s WHERE acc_id = %s", [new_balance2, acc_id2])

        return Response({"status": "Transfer successful"}, status=status.HTTP_200_OK)
    

class PortfolioCashDepositView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pid, amount):
        # deposit cash from external bank account
        if not (pid and amount):
            return Response({"error": "Missing required fields: 'pid', and 'amount' are all required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            amount = round(float(amount), 2)
        except ValueError:
            return Response({"error": "Amount must be a valid number."}, status=status.HTTP_400_BAD_REQUEST)

        if amount <= 0:
            return Response({"error": "Amount must be greater than zero."}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT ca.acc_id, ca.balance
                FROM stocksapp_cashaccount ca
                JOIN stocksapp_portfolio p ON p.cash_account_id = ca.acc_id
                WHERE p.pid = %s
            """, [pid])
            row = cursor.fetchone()

            if not row:
                return Response({"error": "portfolio not found."}, status=status.HTTP_404_NOT_FOUND)

            acc_id, balance = row

            # Perform the transfer
            new_balance = round(balance + amount, 2)

            cursor.execute("UPDATE stocksapp_cashaccount SET balance = %s WHERE acc_id = %s", [new_balance, acc_id])

        return Response({"status": "Deposit successful"}, status=status.HTTP_200_OK)

class PortfolioCashWithdrawView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pid, amount):
        # withdraw cash from cash account
        if not (pid and amount):
            return Response({"error": "Missing required fields: 'pid', and 'amount' are all required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            amount = round(float(amount), 2)
        except ValueError:
            return Response({"error": "Amount must be a valid number."}, status=status.HTTP_400_BAD_REQUEST)

        if amount <= 0:
            return Response({"error": "Amount must be greater than zero."}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT ca.acc_id, ca.balance
                FROM stocksapp_cashaccount ca
                JOIN stocksapp_portfolio p ON p.cash_account_id = ca.acc_id
                WHERE p.pid = %s
            """, [pid])
            row = cursor.fetchone()

            if not row:
                return Response({"error": "portfolio not found."}, status=status.HTTP_404_NOT_FOUND)

            acc_id, balance = row
            
            if balance >= amount:
                # Perform the withdrawl
                new_balance = round(balance - amount, 2)

                cursor.execute("UPDATE stocksapp_cashaccount SET balance = %s WHERE acc_id = %s", [new_balance, acc_id])

                return Response({"status": "Deposit successful"}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Not enough to withdraw."}, status=status.HTTP_400_BAD_REQUEST)
    

class BuyStockView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pid, symbol, quantity):
        try:
            quantity = int(quantity)
            if quantity <= 0:
                return Response({"error": "Quantity must be greater than zero."}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({"error": "Quantity must be a valid integer."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            stock = Stock.objects.get(symbol=symbol)
        except Stock.DoesNotExist:
            return Response({"error": "Stock not found."}, status=status.HTTP_404_NOT_FOUND)

        strike_price = round(stock.strike_price, 2)
        total_price = round(strike_price * quantity, 2)

        with connection.cursor() as cursor:
            try:
                with transaction.atomic():
                    # Fetch the cash account balance
                    cursor.execute("""
                        SELECT ca.acc_id, ca.balance
                        FROM stocksapp_cashaccount ca
                        JOIN stocksapp_portfolio p ON p.cash_account_id = ca.acc_id
                        WHERE p.pid = %s AND p.user_id = %s
                    """, [pid, request.user.id])
                    row = cursor.fetchone()

                    if not row:
                        return Response({"error": "Portfolio not found or you don't have access."}, status=status.HTTP_404_NOT_FOUND)

                    acc_id, balance = row

                    if balance < total_price:
                        return Response({"error": "Insufficient balance."}, status=status.HTTP_400_BAD_REQUEST)

                    # Deduct the amount from the cash account
                    new_balance = round(balance - total_price, 2)
                    cursor.execute("UPDATE stocksapp_cashaccount SET balance = %s WHERE acc_id = %s", [new_balance, acc_id])

                    # Add or update stock holding
                    cursor.execute("""
                        SELECT shares_owned FROM stocksapp_stockholding
                        WHERE pid_id = %s AND symbol_id = %s
                    """, [pid, stock.symbol])
                    row = cursor.fetchone()

                    if row:
                        shares_owned = row[0] + quantity
                        cursor.execute("""
                            UPDATE stocksapp_stockholding
                            SET shares_owned = %s
                            WHERE pid_id = %s AND symbol_id = %s
                        """, [shares_owned, pid, stock.symbol])
                    else:
                        cursor.execute("""
                            INSERT INTO stocksapp_stockholding (pid_id, symbol_id, shares_owned)
                            VALUES (%s, %s, %s)
                        """, [pid, stock.symbol, quantity])

                    # Insert into purchases
                    timestamp = timezone.now()
                    cursor.execute("""
                        INSERT INTO stocksapp_purchase (timestamp, quantity, purchase_price, user_id, symbol_id)
                        VALUES (%s, %s, %s, %s, %s)
                    """, [timestamp, quantity, strike_price, request.user.id, stock.symbol])

            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"status": "Stock purchase successful"}, status=status.HTTP_200_OK)
    
class SellStockView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pid, symbol, shares):
        try:
            shares = int(shares)
            if shares <= 0:
                return Response({"error": "Shares must be greater than zero."}, status=400)
        except ValueError:
            return Response({"error": "Shares must be a valid integer."}, status=400)

        with connection.cursor() as cursor:
            try:
                with transaction.atomic():
                    # Fetch the stock's strike price and the number of shares owned
                    cursor.execute("""
                        SELECT strike_price FROM stocksapp_stock WHERE symbol = %s
                    """, [symbol])
                    stock_row = cursor.fetchone()
                    if not stock_row:
                        return Response({"error": "Stock not found."}, status=404)

                    strike_price = round(stock_row[0], 2)

                    cursor.execute("""
                        SELECT shares_owned FROM stocksapp_stockholding
                        WHERE pid_id = %s AND symbol_id = %s
                    """, [pid, symbol])
                    holding_row = cursor.fetchone()
                    if not holding_row or holding_row[0] < shares:
                        return Response({"error": "Not enough shares to sell."}, status=400)

                    # Calculate the total price for the shares being sold
                    total_price = strike_price * shares

                    # Update the stock holding
                    new_shares = holding_row[0] - shares
                    if new_shares > 0:
                        cursor.execute("""
                            UPDATE stocksapp_stockholding
                            SET shares_owned = %s
                            WHERE pid_id = %s AND symbol_id = %s
                        """, [new_shares, pid, symbol])
                    else:
                        cursor.execute("""
                            DELETE FROM stocksapp_stockholding
                            WHERE pid_id = %s AND symbol_id = %s
                        """, [pid, symbol])

                    # Update the cash account balance
                    cursor.execute("""
                        SELECT ca.acc_id, ca.balance
                        FROM stocksapp_cashaccount ca
                        JOIN stocksapp_portfolio p ON p.cash_account_id = ca.acc_id
                        WHERE p.pid = %s
                    """, [pid])
                    cash_account_row = cursor.fetchone()
                    if not cash_account_row:
                        return Response({"error": "Cash account not found."}, status=404)

                    acc_id, balance = cash_account_row
                    new_balance = balance + total_price

                    cursor.execute("""
                        UPDATE stocksapp_cashaccount
                        SET balance = %s
                        WHERE acc_id = %s
                    """, [new_balance, acc_id])

            except Exception as e:
                return Response({"error": str(e)}, status=500)

        return Response({"status": "Stock sale successful"}, status=200)
    

class DailyStockInformationView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = StockPerformanceSerializer(data=request.data)

        if serializer.is_valid():
            # Extract symbol and timestamp from request data
            symbol = serializer.validated_data['symbol']
            timestamp = serializer.validated_data['timestamp']

            # Check if the record already exists
            if StockPerformance.objects.filter(symbol=symbol, timestamp=timestamp).exists():
                return Response({'message': 'Duplicate Daily Stock Information'}, status=status.HTTP_400_BAD_REQUEST)

            # Save the new record
            serializer.save()
            return Response({'message': 'Daily Stock Information creation successful'}, status=status.HTTP_201_CREATED)
        
        return Response({'message': 'Invalid data', 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

def stock_cov(request):
    symbol = request.GET.get('symbol')
    interval = request.GET.get('interval')

    if not symbol or not interval:
        return JsonResponse({'error': 'Missing parameters'}, status=400)
    
    with connection.cursor() as cursor:
        # set current date as max_date in stockperformance
        cursor.execute('SELECT MAX(timestamp) FROM stocksapp_stockperformance')
        max_date = cursor.fetchone()[0]

        if not max_date:
            return JsonResponse({'error': 'No data available'}, status=404)

        end_date = max_date

        # get start date
        if interval == 'week':
            start_date = end_date - timedelta(weeks=1)
        elif interval == 'month':
            start_date = end_date - timedelta(days=30)
        elif interval == 'quarter':
            start_date = end_date.replace(month=end_date.month - 3 if end_date.month > 3 else end_date.month - 3 + 12, 
                                          year=end_date.year if end_date.month > 3 else end_date.year - 1)
        elif interval == 'year':
            start_date = end_date.replace(year=end_date.year - 1)
        elif interval == 'five_years':
            start_date = end_date.replace(year=end_date.year - 5)
        else:
            return JsonResponse({'error': 'Invalid interval parameter'}, status=400)

        # calculate returns of the given symbol
        # calculate average and standard deviation of the returns
        # calculate the coefficient of variation percentage
        query = ''' WITH daily_returns AS (
                SELECT
                    current.timestamp,
                    current.close,
                    prev.close AS prev_close,
                    (current.close - prev.close) / prev.close AS return
                FROM
                    stocksapp_stockperformance current
                JOIN
                    stocksapp_stockperformance prev
                ON
                    current.symbol = prev.symbol
                    AND prev.timestamp = (
                        SELECT MAX(p.timestamp)
                        FROM stocksapp_stockperformance p
                        WHERE p.symbol = current.symbol
                        AND p.timestamp < current.timestamp
                    )
                WHERE
                    current.symbol = %s
                    AND current.timestamp BETWEEN %s AND %s
            ),
            stats AS (
                SELECT
                    AVG(return) AS mean_return,
                    STDDEV(return) AS std_dev_return
                FROM
                    daily_returns
            )
            SELECT
                (std_dev_return / mean_return) * 100 AS cov_percentage
            FROM
                stats;
            '''
        cursor.execute(query, [symbol,start_date, end_date])
        cov_percentage = cursor.fetchone()[0]

    
    return JsonResponse(cov_percentage, safe=False)

def stock_beta(request):
    symbol = request.GET.get('symbol')
    interval = request.GET.get('interval')

    if not symbol or not interval:
        return JsonResponse({'error': 'Missing parameters'}, status=400)
    
    with connection.cursor() as cursor:
        # set current date as max date
        cursor.execute('SELECT MAX(timestamp) FROM stocksapp_stockperformance')
        max_date = cursor.fetchone()[0]

        if not max_date:
            return JsonResponse({'error': 'No data available'}, status=404)

        end_date = max_date

        # start date
        if interval == 'week':
            start_date = end_date - timedelta(weeks=1)
        elif interval == 'month':
            start_date = end_date - timedelta(days=30)
        elif interval == 'quarter':
            start_date = end_date.replace(month=end_date.month - 3 if end_date.month > 3 else end_date.month - 3 + 12, 
                                          year=end_date.year if end_date.month > 3 else end_date.year - 1)
        elif interval == 'year':
            start_date = end_date.replace(year=end_date.year - 1)
        elif interval == 'five_years':
            start_date = end_date.replace(year=end_date.year - 5)
        else:
            return JsonResponse({'error': 'Invalid interval parameter'}, status=400)

        # calculate returns of the given stock 
        # calculate returns of the index 
        # calculate sample covariance of stock and index and the variance of index
        #  covariance / variance AS beta
        query = ''' WITH stock_returns AS (
                        SELECT
                            current.timestamp,
                            current.close AS stock_close,
                            prev.close AS stock_prev_close,
                            (current.close - prev.close) / prev.close AS stock_return
                        FROM
                            stocksapp_stockperformance current
                        JOIN
                            stocksapp_stockperformance prev
                        ON
                            current.symbol = prev.symbol
                            AND prev.timestamp = (
                                SELECT MAX(p.timestamp)
                                FROM stocksapp_stockperformance p
                                WHERE p.symbol = current.symbol
                                AND p.timestamp < current.timestamp
                            )
                        WHERE
                            current.symbol = %s
                            AND current.timestamp BETWEEN %s AND %s
                    ),
                    benchmark_returns AS (
                        SELECT
                            current.timestamp,
                            current.close AS benchmark_close,
                            prev.close AS benchmark_prev_close,
                            (current.close - prev.close) / prev.close AS benchmark_return
                        FROM
                            stocksapp_stockperformance current
                        JOIN
                            stocksapp_stockperformance prev
                        ON
                            current.symbol = prev.symbol
                            AND prev.timestamp = (
                                SELECT MAX(p.timestamp)
                                FROM stocksapp_stockperformance p
                                WHERE p.symbol = current.symbol
                                AND p.timestamp < current.timestamp
                            )
                        WHERE
                            current.symbol = 'SPY'
                            AND current.timestamp BETWEEN %s AND %s
                    ),
                    combined_returns AS (
                        SELECT
                            s.timestamp,
                            s.stock_return,
                            b.benchmark_return
                        FROM
                            stock_returns s
                        JOIN
                            benchmark_returns b
                        ON
                            s.timestamp = b.timestamp
                    ),
                    covariance_variance AS (
                        SELECT
                            COVAR_SAMP(stock_return, benchmark_return) AS covariance,
                            VARIANCE(benchmark_return) AS variance
                        FROM
                            combined_returns
                    )
                    SELECT
                        covariance / variance AS beta
                    FROM
                        covariance_variance;
            '''
        cursor.execute(query, [symbol, start_date, end_date, start_date, end_date])
        cov_percentage = cursor.fetchone()[0]

    
    return JsonResponse(cov_percentage, safe=False)

def get_covariance_matrix(request, id, interval, type):

    with connection.cursor() as cursor:
        cursor.execute('SELECT MAX(timestamp) FROM stocksapp_stockperformance')
        max_date = cursor.fetchone()[0]

        if not max_date:
            return JsonResponse({'error': 'No data available'}, status=404)

        end_date = max_date

        if interval == 'week':
            start_date = end_date - timedelta(weeks=1)
        elif interval == 'month':
            start_date = end_date - timedelta(days=30)
        elif interval == 'quarter':
            start_date = end_date.replace(month=end_date.month - 3 if end_date.month > 3 else end_date.month - 3 + 12, 
                                          year=end_date.year if end_date.month > 3 else end_date.year - 1)
        elif interval == 'year':
            start_date = end_date.replace(year=end_date.year - 1)
        elif interval == 'five_years':
            start_date = end_date.replace(year=end_date.year - 5)
        else:
            return JsonResponse({'error': 'Invalid interval parameter'}, status=400)
        
        # get returns of all the stocks in the portfolio/stock list and calculate covariance of each pair of stocks
        if type == "portfolio":
            query = f"""
                    WITH stock_returns AS (
                        SELECT
                            current.timestamp,
                            current.symbol,
                            current.close AS stock_close,
                            prev.close AS stock_prev_close,
                            (current.close - prev.close) / prev.close AS daily_return
                        FROM
                            stocksapp_StockPerformance current
                        JOIN
                            stocksapp_StockPerformance prev
                        ON
                            current.symbol = prev.symbol
                            AND prev.timestamp = (
                                SELECT MAX(p.timestamp)
                                FROM stocksapp_StockPerformance p
                                WHERE p.symbol = current.symbol
                                AND p.timestamp < current.timestamp
                            )
                        WHERE
                            current.symbol IN (
                                SELECT symbol_id
                                FROM stocksapp_stockholding
                                WHERE pid_id = {id}
                            )
                            AND current.timestamp BETWEEN '{start_date}' AND '{end_date}'
                    )
                    SELECT
                        s1.symbol AS symbol1,
                        s2.symbol AS symbol2,
                        COVAR_SAMP(s1.daily_return, s2.daily_return) AS covariance
                    FROM
                        stock_returns s1
                    JOIN
                        stock_returns s2 ON s1.timestamp = s2.timestamp
                    WHERE
                        s1.symbol < s2.symbol 
                    GROUP BY
                        s1.symbol, s2.symbol
                    ORDER BY
                        s1.symbol, s2.symbol;
                """
        else: 
            query = f"""
                WITH stock_returns AS (
                    SELECT
                        current.timestamp,
                        current.symbol,
                        current.close AS stock_close,
                        prev.close AS stock_prev_close,
                        (current.close - prev.close) / prev.close AS daily_return
                    FROM
                        stocksapp_StockPerformance current
                    JOIN
                        stocksapp_StockPerformance prev
                    ON
                        current.symbol = prev.symbol
                        AND prev.timestamp = (
                            SELECT MAX(p.timestamp)
                            FROM stocksapp_StockPerformance p
                            WHERE p.symbol = current.symbol
                            AND p.timestamp < current.timestamp
                        )
                    WHERE
                        current.symbol IN (
                            SELECT symbol_id
                            FROM stocksapp_stocklistitem
                            WHERE slid_id = {id}
                        )
                        AND current.timestamp BETWEEN '{start_date}' AND '{end_date}'
                )
                SELECT
                    s1.symbol AS symbol1,
                    s2.symbol AS symbol2,
                    COVAR_SAMP(s1.daily_return, s2.daily_return) AS covariance
                FROM
                    stock_returns s1
                JOIN
                    stock_returns s2 ON s1.timestamp = s2.timestamp
                WHERE
                    s1.symbol < s2.symbol 
                GROUP BY
                    s1.symbol, s2.symbol
                ORDER BY
                    s1.symbol, s2.symbol;
            """    
        

        cursor.execute(query)
        results = cursor.fetchall()


    # Transform results into a matrix format
    symbols = list(set([row[0] for row in results] + [row[1] for row in results]))
    symbols.sort()
    matrix = {symbol: {symbol: 1.0 for symbol in symbols} for symbol in symbols}
    
    for row in results:
        matrix[row[0]][row[1]] = row[2]
        matrix[row[1]][row[0]] = row[2] 


    return JsonResponse(matrix)

def get_correlation_matrix(request, id, interval, type):
    with connection.cursor() as cursor:
        cursor.execute('SELECT MAX(timestamp) FROM stocksapp_stockperformance')
        max_date = cursor.fetchone()[0]

        if not max_date:
            return JsonResponse({'error': 'No data available'}, status=404)

        end_date = max_date

        if interval == 'week':
            start_date = end_date - timedelta(weeks=1)
        elif interval == 'month':
            start_date = end_date - timedelta(days=30)
        elif interval == 'quarter':
            start_date = end_date.replace(month=end_date.month - 3 if end_date.month > 3 else end_date.month - 3 + 12, 
                                          year=end_date.year if end_date.month > 3 else end_date.year - 1)
        elif interval == 'year':
            start_date = end_date.replace(year=end_date.year - 1)
        elif interval == 'five_years':
            start_date = end_date.replace(year=end_date.year - 5)
        else:
            return JsonResponse({'error': 'Invalid interval parameter'}, status=400)

        # get returns of all the stocks in the portfolio/stock list and calculate correlation of each pair of stocks
        if type == "portfolio":
            query = f"""
                WITH stock_returns AS (
                    SELECT
                        current.timestamp,
                        current.symbol,
                        current.close AS stock_close,
                        prev.close AS stock_prev_close,
                        (current.close - prev.close) / prev.close AS daily_return
                    FROM
                        stocksapp_StockPerformance current
                    JOIN
                        stocksapp_StockPerformance prev
                    ON
                        current.symbol = prev.symbol
                        AND prev.timestamp = (
                            SELECT MAX(p.timestamp)
                            FROM stocksapp_StockPerformance p
                            WHERE p.symbol = current.symbol
                            AND p.timestamp < current.timestamp
                        )
                    WHERE
                        current.symbol IN (
                            SELECT symbol_id
                            FROM stocksapp_stockholding
                            WHERE pid_id = {id}
                        )
                        AND current.timestamp BETWEEN '{start_date}' AND '{end_date}'
                )
                SELECT
                    s1.symbol AS symbol1,
                    s2.symbol AS symbol2,
                    CORR(s1.daily_return, s2.daily_return) AS correlation
                FROM
                    stock_returns s1
                JOIN
                    stock_returns s2 ON s1.timestamp = s2.timestamp
                WHERE
                    s1.symbol < s2.symbol 
                GROUP BY
                    s1.symbol, s2.symbol
                ORDER BY
                    s1.symbol, s2.symbol;
            """
        else: 
            query = f"""
                WITH stock_returns AS (
                    SELECT
                        current.timestamp,
                        current.symbol,
                        current.close AS stock_close,
                        prev.close AS stock_prev_close,
                        (current.close - prev.close) / prev.close AS daily_return
                    FROM
                        stocksapp_StockPerformance current
                    JOIN
                        stocksapp_StockPerformance prev
                    ON
                        current.symbol = prev.symbol
                        AND prev.timestamp = (
                            SELECT MAX(p.timestamp)
                            FROM stocksapp_StockPerformance p
                            WHERE p.symbol = current.symbol
                            AND p.timestamp < current.timestamp
                        )
                    WHERE
                        current.symbol IN (
                            SELECT symbol_id
                            FROM stocksapp_stocklistitem
                            WHERE slid_id = {id}
                        )
                        AND current.timestamp BETWEEN '{start_date}' AND '{end_date}'
                )
                SELECT
                    s1.symbol AS symbol1,
                    s2.symbol AS symbol2,
                    CORR(s1.daily_return, s2.daily_return) AS correlation
                FROM
                    stock_returns s1
                JOIN
                    stock_returns s2 ON s1.timestamp = s2.timestamp
                WHERE
                    s1.symbol < s2.symbol 
                GROUP BY
                    s1.symbol, s2.symbol
                ORDER BY
                    s1.symbol, s2.symbol;
            """    

        cursor.execute(query)
        results = cursor.fetchall()

    # Transform results into a matrix format
    symbols = list(set([row[0] for row in results] + [row[1] for row in results]))
    symbols.sort()
    matrix = {symbol: {symbol: 1.0 for symbol in symbols} for symbol in symbols}
    
    for row in results:
        matrix[row[0]][row[1]] = row[2]
        matrix[row[1]][row[0]] = row[2] 

    return JsonResponse(matrix)



@api_view(['POST'])
def create_stock_list_accessibility(request,slid,friend_username):

    if request.user.username == friend_username:
         return JsonResponse({"message": "cannot share with yourself"})

    try:
        friend = User.objects.get(username=friend_username)
        slid = StockList.objects.get(slid=slid)

        friends = Friends.objects.filter(req_status=Friends.ACCEPTED, receiver=request.user, requester=friend) | Friends.objects.filter(req_status=Friends.ACCEPTED, requester=request.user, receiver=friend)

        if len(friends) == 0:
            return JsonResponse({"message": "can only share with friends"})
            
        relationship, created = StockListAccessibleBy.objects.get_or_create(
            slid = slid,
            user = friend
        )

        if created:
            slid.visibility = "Shared"
            slid.save()
            return JsonResponse({"message": "shared stock list"}, status=201)
        else:
            return JsonResponse({"message": "already shared with this user"}, status=200)

    except User.DoesNotExist:
        return JsonResponse({"message": "user does not exist"})


@api_view(['GET'])
def get_all_stockLists_shared(request):
    
    shared_stock_lists = StockListAccessibleBy.objects.filter(user=request.user)
    
    stock_list_ids = list(shared_stock_lists.values_list('slid', flat=True))
    
    stock_list_items = StockList.objects.filter(slid__in=stock_list_ids)
    
    serializer = StockListSerializer(stock_list_items, many=True)

    return Response(serializer.data, status=status.HTTP_200_OK)




@api_view(['POST'])
def leave_review(request, slid):
    stock_list = StockList.objects.get(slid=slid)
    user = request.user

    if not stock_list:
        return Response({'message': 'Stock list not found'})

    user = request.user
    review_text = request.data.get('reviewText', '')

    if Review.objects.filter(slid=slid, uid=user.id).exists():
        return Response({'message': 'You have already reviewed this stock list'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        review = Review(slid=stock_list, uid=user, reviewText=review_text, reviewDate=timezone.now())
        review.save() 
        return Response({'message': 'Review added successfully'}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'message': f'Could not add review: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        
@api_view(['PUT'])
def edit_review(request, slid):
    try:
        review = Review.objects.get(slid=slid, uid=request.user)
    except Review.DoesNotExist:
        return Response({'message': 'Review not found'}, status=status.HTTP_404_NOT_FOUND)

    review_text = request.data.get('reviewText', '')

    try:
        review.reviewText = review_text
        review.reviewDate = timezone.now()
        review.save()
        return Response({'message': 'Review updated successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'message': f'Could not update review: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_review(request, slid):
    try:
        review = Review.objects.get(slid=slid, uid=request.user)
    except Review.DoesNotExist:
        return Response({'message': 'Review not found'}, status=status.HTTP_404_NOT_FOUND)

    try:
        review.delete()
        return Response({'message': 'Review deleted successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'message': f'Could not delete review: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
def delete_review_of_your_stock_list(request, slid, username):
    try:
        user = get_object_or_404(User, username=username)
        review = Review.objects.get(slid=slid, uid= user)
    except Review.DoesNotExist:
        return Response({'message': 'Review not found'}, status=status.HTTP_404_NOT_FOUND)

    try:
        review.delete()
        return Response({'message': 'Review deleted successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'message': f'Could not delete review: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_review(request, slid):
    uid = request.user.id
    reviews = Review.objects.filter(slid=slid,uid=uid).first()
    serializer = ReviewSerializer(reviews, many=False)
    return Response(serializer.data)


@api_view(['GET'])
def get_all_reviews(request, slid):
    try:
        reviews = Review.objects.filter(slid=slid)
        review_data = []
        
        for review in reviews:
            user =  get_object_or_404(User, id=review.uid.id)
            review_data.append({
                'reviewText': review.reviewText,
                'reviewDate': review.reviewDate,
                'slid': str(review.slid),
                'username': user.username
            })

        return Response(review_data, status=status.HTTP_200_OK)
    
    except Review.DoesNotExist:
        return Response({'message': 'No reviews found for this stock list'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def get_public_stock_lists(request):
    public_stock_lists = StockList.objects.filter(visibility='public')
    serializer = StockListSerializer(public_stock_lists, many=True)
    return Response(serializer.data)