import yfinance as yf
from datetime import date
from django.core.management.base import BaseCommand
from django.db import connection, transaction
from stocksapp.models import StockPerformance
from concurrent.futures import ThreadPoolExecutor
import traceback

class Command(BaseCommand):
    help = 'Fetch and update stock performance data'

    def handle(self, *args, **kwargs):

        with connection.cursor() as cursor:
            cursor.execute('SELECT MIN(timestamp) FROM stocksapp_stockperformance')
            min_date = cursor.fetchone()[0]

            start_date = min_date

            cursor.execute('SELECT MAX(timestamp) FROM stocksapp_stockperformance')
            max_date = cursor.fetchone()[0]

            end_date = max_date


        self.fetch_and_store_data("SPY", start_date, end_date)

        self.stdout.write(self.style.SUCCESS("Data fetching and updating completed."))

    def fetch_and_store_data(self, symbol, start_date, end_date):
        self.stdout.write(f"Fetching data for {symbol}")
        try:
            stock_data = yf.download(symbol, start=start_date, end=end_date)

            if stock_data.empty:
                self.stdout.write(self.style.WARNING(f"No data found for {symbol}"))
                return
            
            stock_data['symbol'] = symbol
            stock_data.reset_index(inplace=True)
            stock_data.rename(columns={
                'Date': 'timestamp',
                'Open': 'open',
                'High': 'high',
                'Low': 'low',
                'Close': 'close',
                'Volume': 'volume'
            }, inplace=True)

            stock_data = stock_data[['timestamp', 'open', 'high', 'low', 'close', 'volume', 'symbol']]
            data_tuples = list(stock_data.itertuples(index=False, name=None))

            self.insert_stock_data(data_tuples)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error fetching data for {symbol}: {e}"))
            traceback.print_exc()

    def insert_stock_data(self, data):
        insert_query = """
        INSERT INTO stocksapp_stockperformance (timestamp, open, high, low, close, volume, symbol)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (symbol, timestamp) DO UPDATE
        SET open = EXCLUDED.open,
            high = EXCLUDED.high,
            low = EXCLUDED.low,
            close = EXCLUDED.close,
            volume = EXCLUDED.volume;
        """
        try:
            with connection.cursor() as cursor:
                cursor.executemany(insert_query, data)
            transaction.commit()
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error inserting data: {e}"))
            transaction.rollback()