from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from django.core.exceptions import ValidationError

class Friends(models.Model):
    # CREATE TABLE Friends(receiverId INT, requesterId INT, reqStatus VARCHAR(10), timeOfRejection TIMESTAMP DEFAULT NULL, 
    # CHECK (reqStatus in ['accepted', 'pending', 'rejected']), PRIMARY KEY(receiverId, requesterId), 
    # FOREIGN KEY (receiverId) REFERENCES Client(uid) ON DELETE CASCADE ON UPDATE CASCADE,
    # FOREIGN KEY (requesterId) REFERENCES Client(uid) ON DELETE CASCADE ON UPDATE CASCADE);

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


class Stock(models.Model):
    # CREATE TABLE Stock(symbol VARCHAR(5), strikePrice REAL, PRIMARY KEY(symbol);
    symbol = models.CharField(max_length=5, primary_key=True)
    strike_price = models.FloatField()

class StockPerformance(models.Model):
    # CREATE TABLE StockPerformance(timestamp DATE, open REAL, high REAL, low REAL, 
    # close REAL, volume INT, symbol VARCHAR(5), PRIMARY KEY(symbol, timestamp), 
    # FOREIGN KEY (symbol) REFERENCES Stock(symbol) ON DELETE CASCADE ON UPDATE CASCADE);;

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
    # CREATE TABLE StockLists(slid INT, visibility VARCHAR(10) DEFAULT 'private', slName CHAR(20),
    # uid INT, PRIMARY KEY(slid), FOREIGN KEY (uid) REFERENCES User(uid) ON DELETE CASCADE ON UPDATE CASCADE),
    # CHECK (visibility IN ('private', 'public', 'Private', 'Public));";

    slid = models.AutoField(primary_key=True)
    visibility = models.CharField(max_length=10, choices=[('private', 'Private'), ('public', 'Public'), ('shared', 'Shared')], default='private')
    sl_name = models.CharField(max_length=20)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.slid}"

class StockListItem(models.Model):
    # CREATE TABLE StockListItem(slid INT, symbol VARCHAR(5), shares INT, PRIMARY KEY(slid, symbol), 
    # FOREIGN KEY (slid) REFERENCES StockLists(slid) ON DELETE CASCADE ON UPDATE CASCADE,
    # FOREIGN KEY (symbol) REFERENCES Stock(symbol) ON DELETE CASCADE ON UPDATE CASCADE);
    slid = models.ForeignKey(StockList, on_delete=models.CASCADE)
    symbol = models.ForeignKey(Stock, on_delete=models.CASCADE)
    shares = models.IntegerField()

    class Meta:
        unique_together = ('slid', 'symbol')

    def __str__(self):
        return f"{self.slid} - {self.symbol}"



class StockListAccessibleBy(models.Model):
    # CREATE TABLE StockListAccessibleBy(slid INT, uid INT, PRIMARY KEY(slid, uid),
    # FOREIGN KEY (uid) REFERENCES User(uid) ON DELETE SET NULL ON UPDATE CASCADE,
    # FOREIGN KEY (slid) REFERENCES StockLists(slid) ON DELETE CASCADE ON UPDATE CASCADE);
    slid = models.ForeignKey(StockList, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ('slid', 'user')

class CashAccount(models.Model):
    # CREATE TABLE CashAccount(accId INT, balance REAL, PRIMARY KEY(accId))
    acc_id = models.AutoField(primary_key=True)
    balance = models.FloatField()

    def __str__(self):
        return f"CashAccount(balance={self.balance})"

class Portfolio(models.Model):
    # CREATE TABLE Portfolio(pid INT, pname CHAR(20), 
    # uid INT, accId INT, FOREIGN KEY (uid) REFERENCES User(uid),
    # PRIMARY KEY(pid), 
    # FOREIGN KEY (accId) REFERENCES CashAccount(accId) ON DELETE CASCADE ON UPDATE CASCADE);
    pid = models.AutoField(primary_key=True)
    pname = models.CharField(max_length=20)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    cash_account = models.ForeignKey(CashAccount, on_delete=models.CASCADE)

    def __str__(self):
        return self.pname

class StockHolding(models.Model):
    # "CREATE TABLE StockHoldings(pid INT, symbol VARCHAR(5), sharesOwned INT, PRIMARY KEY(pid, symbol),
    # FOREIGN KEY (pid) REFERENCES Portfolio(pid) ON DELETE CASCADE ON UPDATE CASCADE,
    # FOREIGN KEY (symbol) REFERENCES Stock(symbol) ON DELETE CASCADE ON UPDATE CASCADE);"

    pid = models.ForeignKey(Portfolio, on_delete=models.CASCADE)
    symbol = models.ForeignKey(Stock, on_delete=models.CASCADE)
    shares_owned = models.IntegerField()

    class Meta:
        unique_together = ('pid', 'symbol')

    def __str__(self):
        return f"{self.pid} - {self.symbol}"
    

class Purchase(models.Model):
    # CREATE TABLE Purchase(purchaseId INT, timestamp TIMESTAMP, quantity INT, 
    # purchasePrice REAL, uid INT, symbol VARCHAR(5), PRIMARY KEY(purchaseId)
    # FOREIGN KEY (uid) REFERENCES User(uid) ON DELETE CASCADE ON UPDATE CASCADE,
    # FOREIGN KEY (symbol) REFERENCES Stock(symbol) ON DELETE CASCADE ON UPDATE CASCADE);
    purchase_id = models.AutoField(primary_key=True)
    timestamp = models.DateTimeField()
    quantity = models.IntegerField()
    purchase_price = models.FloatField()
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    symbol = models.ForeignKey(Stock, on_delete=models.CASCADE)

    def __str__(self):
        return f"Purchase(user={self.user}, symbol={self.symbol}, timestamp={self.timestamp})"


class Review(models.Model):
    slid = models.ForeignKey(StockList, on_delete=models.CASCADE)
    uid = models.ForeignKey(User, on_delete=models.CASCADE)
    reviewText = models.TextField(max_length=4000)
    reviewDate = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('slid', 'uid')

    def __str__(self):
        return f"Review by {self.uid} on {self.slid}"
