from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from django.core.exceptions import ValidationError

class Friends(models.Model):
    PENDING = "Pending"
    ACCEPTED = "Accepted"
    REJECTED = "Rejected"
    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (ACCEPTED, 'Accepted'),
        (REJECTED, 'Rejected'),
    ]
    
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='receiver', on_delete=models.CASCADE)
    requester = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='sender', on_delete=models.CASCADE)
    req_status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=PENDING)
    time_of_rejection = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('receiver', 'requester')
        constraints = [
            models.UniqueConstraint(fields=['receiver', 'requester'], name='unique_friendship')
        ]

    def clean(self):
        if Friends.objects.filter(receiver=self.requester, requester=self.receiver).exists():
            raise ValidationError('Friendship in the opposite direction already exists.')
        super().clean()

class Bank_account(models.Model):
    uid = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    balance = models.DecimalField(max_digits=10, decimal_places=2)
from django.contrib.auth.models import User

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
    visibility = models.CharField(max_length=10, choices=[('private', 'Private'), ('public', 'Public'), ('shared', 'Shared')], default='private')
    sl_name = models.CharField(max_length=20)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.slid}"

class StockListItem(models.Model):
    slid = models.ForeignKey(StockList, on_delete=models.SET_NULL, null=True)
    symbol = models.ForeignKey(Stock, on_delete=models.SET_NULL, null=True)
    shares = models.IntegerField()

    class Meta:
        unique_together = ('slid', 'symbol')

    def __str__(self):
        return f"{self.slid} - {self.symbol}"


class StockListAccessibleBy(models.Model):
    # create table StockListAccessibleBy()
    slid = models.ForeignKey(StockList, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    class Meta:
        unique_together = ('slid', 'user')

class Review(models.Model):
    slid = models.ForeignKey(StockList, on_delete=models.CASCADE)
    uid = models.ForeignKey(User, on_delete=models.CASCADE)
    reviewText = models.TextField(max_length=4000)
    reviewDate = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('slid', 'uid')

    def __str__(self):
        return f"Review by {self.uid} on {self.slid}"
