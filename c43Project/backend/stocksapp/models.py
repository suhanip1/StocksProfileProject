from django.db import models

# Create your models here.
class User(models.Model):
        #CREATE TABLE Client(uid INT, fname VARCHAR(20), lname VARCHAR(20), username VARCHAR(20) UNIQUE, email VARCHAR(30) UNIQUE, password VARCHAR(15), dateJoined TIMESTAMP, PRIMARY KEY(uid));"
    id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=20)
    last_name = models.CharField(max_length=20)
    username = models.CharField(max_length=20, unique=True)
    email = models.EmailField(max_length=30, unique=True)
    password = models.CharField(max_length=15)

    REQUIRED_FIELDS = ['email', 'first_name', 'last_name', 'username', 'password']

    def __str__(self):
        return self.username