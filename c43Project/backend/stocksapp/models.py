from django.db import models
from django.contrib.auth.models import User

# Create your models here.
# class User(models.Model):
#         #CREATE TABLE Client(uid INT, fname VARCHAR(20), lname VARCHAR(20), username VARCHAR(20) UNIQUE, email VARCHAR(30) UNIQUE, password VARCHAR(15), dateJoined TIMESTAMP, PRIMARY KEY(uid));"
#     id = models.AutoField(primary_key=True)
#     first_name = models.CharField(max_length=20)
#     last_name = models.CharField(max_length=20)
#     username = models.CharField(max_length=20, unique=True)
#     email = models.EmailField(max_length=30, unique=True)
#     password = models.CharField(max_length=15)

#     REQUIRED_FIELDS = ['email', 'first_name', 'last_name', 'username', 'password']

#     def __str__(self):
#         return self.username

class Stock(models.Model):
    # CREATE TABLE Stock(symbol VARCHAR(5), strikePrice REAL, PRIMARY KEY(symbol);
    symbol = models.CharField(max_length=5, primary_key=True)
    strike_price = models.FloatField()

class StockPerformance(models.Model):
    # CREATE TABLE StockPerformance(timestamp DATE, open REAL, high REAL, low REAL, 
    # close REAL, volume INT, symbol VARCHAR(5), PRIMARY KEY(symbol, timestamp), 
    # FOREIGN KEY (symbol) REFERENCES Stock(symbol) ON DELETE SET NULL ON UPDATE CASCADE);;

    timestamp = models.DateField()
    open = models.FloatField(null=True, blank=True)
    high = models.FloatField(null=True, blank=True)
    low = models.FloatField(null=True, blank=True)
    close = models.FloatField(null=True, blank=True)
    volume = models.IntegerField()
    # symbol = models.ForeignKey(Stock, on_delete=models.SET_NULL, null=True)
    symbol = models.CharField(max_length=5)

    class Meta:
        unique_together = ('symbol', 'timestamp')

    def __str__(self):
        return f"{self.symbol} - {self.timestamp}"
    

class StockList(models.Model):
    slid = models.AutoField(primary_key=True)
    visibility = models.CharField(max_length=10, choices=[('private', 'Private'), ('public', 'Public')], default='private')
    sl_name = models.CharField(max_length=20)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.slname

class StockListItem(models.Model):
    slid = models.ForeignKey(StockList, on_delete=models.SET_NULL, null=True)
    symbol = models.ForeignKey(Stock, on_delete=models.SET_NULL, null=True)
    shares = models.IntegerField()

    class Meta:
        unique_together = ('slid', 'symbol')

    def __str__(self):
        return f"{self.slid} - {self.symbol}"

class IsAccessibleBy(models.Model):
    slid = models.ForeignKey(StockList, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('slid', 'user')