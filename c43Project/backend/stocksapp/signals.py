from django.db.models.signals import post_save
from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.db import connection
from .models import StockPerformance
from django.core.management import call_command

@receiver(post_save, sender=StockPerformance)
def update_strike_price(sender, instance, **kwargs):
    print("Signal fired!")
    with connection.cursor() as cursor:
        cursor.execute("""
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
        """, [instance.symbol])

    call_command('populate_index')