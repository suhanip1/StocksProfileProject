# Generated by Django 5.0.6 on 2024-08-01 18:52

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='CashAccount',
            fields=[
                ('acc_id', models.AutoField(primary_key=True, serialize=False)),
                ('balance', models.FloatField()),
            ],
        ),
        migrations.CreateModel(
            name='Stock',
            fields=[
                ('symbol', models.CharField(max_length=5, primary_key=True, serialize=False)),
                ('strike_price', models.FloatField()),
            ],
        ),
        migrations.CreateModel(
            name='Friends',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('req_status', models.CharField(choices=[('Pending', 'Pending'), ('Accepted', 'Accepted'), ('Rejected', 'Rejected')], default='Pending', max_length=10)),
                ('time_of_rejection', models.DateTimeField(blank=True, null=True)),
                ('receiver', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='receiver', to=settings.AUTH_USER_MODEL)),
                ('requester', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sender', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Portfolio',
            fields=[
                ('pid', models.AutoField(primary_key=True, serialize=False)),
                ('pname', models.CharField(max_length=20)),
                ('cash_account', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='stocksapp.cashaccount')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Purchase',
            fields=[
                ('purchase_id', models.AutoField(primary_key=True, serialize=False)),
                ('timestamp', models.DateTimeField()),
                ('quantity', models.IntegerField()),
                ('purchase_price', models.FloatField()),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('symbol', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='stocksapp.stock')),
            ],
        ),
        migrations.CreateModel(
            name='StockHolding',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('shares_owned', models.IntegerField()),
                ('pid', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='stocksapp.portfolio')),
                ('symbol', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='stocksapp.stock')),
            ],
        ),
        migrations.CreateModel(
            name='StockList',
            fields=[
                ('slid', models.AutoField(primary_key=True, serialize=False)),
                ('visibility', models.CharField(choices=[('private', 'Private'), ('public', 'Public'), ('shared', 'Shared')], default='private', max_length=10)),
                ('sl_name', models.CharField(max_length=20)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Review',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('reviewText', models.TextField(max_length=4000)),
                ('reviewDate', models.DateTimeField(auto_now_add=True)),
                ('uid', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('slid', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='stocksapp.stocklist')),
            ],
        ),
        migrations.CreateModel(
            name='StockListAccessibleBy',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('slid', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='stocksapp.stocklist')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='StockListItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('shares', models.IntegerField()),
                ('slid', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='stocksapp.stocklist')),
                ('symbol', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='stocksapp.stock')),
            ],
        ),
        migrations.CreateModel(
            name='StockPerformance',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp', models.DateField()),
                ('open', models.FloatField(blank=True, null=True)),
                ('high', models.FloatField(blank=True, null=True)),
                ('low', models.FloatField(blank=True, null=True)),
                ('close', models.FloatField(blank=True, null=True)),
                ('volume', models.IntegerField()),
                ('symbol', models.CharField(max_length=5)),
            ],
            options={
                'unique_together': {('symbol', 'timestamp')},
            },
        ),
        migrations.AddConstraint(
            model_name='friends',
            constraint=models.UniqueConstraint(fields=('receiver', 'requester'), name='unique_friendship'),
        ),
        migrations.AlterUniqueTogether(
            name='friends',
            unique_together={('receiver', 'requester')},
        ),
        migrations.AlterUniqueTogether(
            name='stockholding',
            unique_together={('pid', 'symbol')},
        ),
        migrations.AlterUniqueTogether(
            name='review',
            unique_together={('slid', 'uid')},
        ),
        migrations.AlterUniqueTogether(
            name='stocklistaccessibleby',
            unique_together={('slid', 'user')},
        ),
        migrations.AlterUniqueTogether(
            name='stocklistitem',
            unique_together={('slid', 'symbol')},
        ),
    ]
