import csv
from datetime import datetime
from django.core.management.base import BaseCommand
from stocksapp.models import Stock, StockPerformance

class Command(BaseCommand):
    help = 'Populate SP500 history data from a CSV file'

    def handle(self, *args, **kwargs):
        csv_file = 'stocksapp/SP500History.csv'

        with open(csv_file, mode='r', newline='', encoding='utf-8') as f:
            reader = csv.reader(f)
            next(reader)  # Skip the header row
            for row in reader:
                timestamp = datetime.strptime(row[0], '%Y-%m-%d').date()
                open_price = self.safe_float(row[1])
                high = self.safe_float(row[2])
                low = self.safe_float(row[3])
                close = self.safe_float(row[4])
                volume = self.safe_int(row[5])
                symbol = row[6]

                # Ensure the stock exists in the database, create if not
                stock, created = Stock.objects.get_or_create(symbol=symbol)
                if not created:
                    # Update the strikePrice if the stock already exists
                    stock.strikePrice = close
                    stock.save()

                # Create StockPerformance entry
                StockPerformance.objects.update_or_create(
                    symbol=stock,
                    timestamp=timestamp,
                    defaults={
                        'open': open_price,
                        'high': high,
                        'low': low,
                        'close': close,
                        'volume': volume
                    }
                )

        # After processing the CSV file, update strikePrice to the latest close price for each stock
        for stock in Stock.objects.all():
            # Find the closest StockPerformance entry to today's date
            try:
                latest_performance = StockPerformance.objects.filter(symbol=stock).order_by('-timestamp').first()
                if latest_performance:
                    stock.strikePrice = latest_performance.close
                    stock.save()
            except StockPerformance.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'No performance data found for stock symbol "{stock.symbol}"'))

        self.stdout.write(self.style.SUCCESS('Successfully imported data from "%s"' % csv_file))


    def safe_float(self, value):
        try:
            return float(value) if value else None
        except ValueError:
            return None

    def safe_int(self, value):
        try:
            return int(value) if value else None
        except ValueError:
            return None