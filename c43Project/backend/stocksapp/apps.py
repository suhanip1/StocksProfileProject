from django.apps import AppConfig


class StocksappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'stocksapp'

    def ready(self):
        import stocksapp.signals