from django.db.models.signals import post_save, post_delete
from django.db.models.signals import post_migrate
from django.core.cache import cache
from django.dispatch import receiver
from django.db import connection
from .models import Portfolio, StockHolding, StockList, StockListItem, StockPerformance
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
    clear_cache(instance)

@receiver(post_delete, sender=StockPerformance)
def clear_stock_cache(sender, instance, **kwargs):
    clear_cache(instance)

def clear_cache(instance):
    intervals = ['week', 'month', 'quarter', 'year', 'five_years']
    for interval in intervals:
        cache_key = f"cov_{instance.symbol}_{interval}"
        cache.delete(cache_key)
        cache_key = f"beta_{instance.symbol}_{interval}"
        cache.delete(cache_key)
        for interval2 in intervals:
            cache_key = f"predict_prices_{instance.symbol}_{interval}_{interval2}"
            print(f"clear cache")

@receiver(post_save, sender=StockHolding)
@receiver(post_delete, sender=StockHolding)
def clear_stockholding_matrix_cache(sender, instance, **kwargs):
    intervals = ['week', 'month', 'quarter', 'year', 'five_years']
    print("hi stockholding")
    
    for interval in intervals:
            cache_key_cov = f"cov_matrix_{instance.pid_id}_{interval}_portfolio"
            cache_key_cor = f"cor_matrix_{instance.pid_id}_{interval}_portfolio"
            cache.delete(cache_key_cov)
            cache.delete(cache_key_cor)
            print(f"clear matrix cache: portfolio - {cache_key_cov}")

@receiver(post_save, sender=StockListItem)
@receiver(post_delete, sender=StockListItem)
def clear_stocklist_matrix_cache(sender, instance, **kwargs):
    intervals = ['week', 'month', 'quarter', 'year', 'five_years']
    print("hi stocklist")
    
    for interval in intervals:
            cache_key_cov = f"cov_matrix_{instance.slid}_{interval}_stocklist"
            cache_key_cor = f"cor_matrix_{instance.slid}_{interval}_stocklist"
            cache.delete(cache_key_cov)
            cache.delete(cache_key_cor)
            print(f"clear matrix cache: stocklist - {cache_key_cov}")
            

@receiver(post_save, sender=StockPerformance)
@receiver(post_delete, sender=StockPerformance)
def clear_matrix_cache(sender, instance, **kwargs):
    intervals = ['week', 'month', 'quarter', 'year', 'five_years']
    print("hi")

# Clear cache for all portfolio IDs
    portfolios = Portfolio.objects.all()
    for portfolio in portfolios:
        for interval in intervals:
            cache_key_cov = f"cov_matrix_{portfolio.pid}_{interval}_portfolio"
            cache_key_cor = f"cor_matrix_{portfolio.pid}_{interval}_portfolio"
            cache.delete(cache_key_cov)
            cache.delete(cache_key_cor)
            print(f"clear matrix cache: portfolio - {cache_key_cov}")

# Also clear cache for all stock lists
    stock_lists = StockList.objects.all()
    for stock_list in stock_lists:
        for interval in intervals:
            cache_key_cov = f"cov_matrix_{stock_list.slid}_{interval}_stocklist"
            cache_key_cor = f"cor_matrix_{stock_list.slid}_{interval}_stocklist"
            cache.delete(cache_key_cov)
            cache.delete(cache_key_cor)
            print(f"clear matrix cache: stocklist - {cache_key_cov}")