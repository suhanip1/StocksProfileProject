from django.core.management.base import BaseCommand
from django.db import connection
from stocksapp.models import StockPerformance
from django.db import connection, transaction

class Command(BaseCommand):
    help = 'Update stock strike prices based on the latest performance data'

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting update of stock strike prices...")
        self.update_stock_strike_prices()
        self.stdout.write(self.style.SUCCESS("Stock strike prices updated successfully."))

    def update_stock_strike_prices(self):
        update_query = """
        WITH latest_performance AS (
            SELECT symbol, close
            FROM stocksapp_stockperformance
            WHERE symbol = %s
            ORDER BY timestamp DESC
            LIMIT 1
        )
        UPDATE stocksapp_stock
        SET strike_price = latest_performance.close
        FROM latest_performance
        WHERE stocksapp_stock.symbol = latest_performance.symbol;
        """

        symbols = StockPerformance.objects.values_list('symbol', flat=True).distinct()
        with connection.cursor() as cursor:
            for symbol in symbols:
                cursor.execute(update_query, [symbol])
        transaction.commit()
