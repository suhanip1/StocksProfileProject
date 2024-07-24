from django.contrib import admin
from django.urls import path, include
from .views import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("user/register/", SignupView.as_view(), name="register"),
   path("token/", TokenObtainPairView.as_view(), name="get_token"),
    path("token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path('user/get-curr-user/', get_current_user, name='get_current_user'),
    path('stock-performance/', stock_performance, name ='get_stock_performance'),
    path('stocklists/', StockListView.as_view(), name='stocklist_list'),
    path('stocklists/edit/<int:slid>/<str:visibility>/<str:sl_name>', StockListEditView.as_view(), name='stocklist_edit'),
    path('stocklists/create/', StockListCreateView.as_view(), name='stocklist_create'),
    path('stocklists/delete/<int:slid>/', StockListDeleteView.as_view(), name='stocklist_delete'),
    path('stocklistitems/add-or-update/', StockListItemAddOrUpdateView.as_view(), name='stocklistitem_add_or_update'),
    path('stocks/', StockView.as_view(), name='get_stocks'),
    path('stocklistitems/<int:slid>/', StockListItemView.as_view(), name='get_stocklist_items'),
]