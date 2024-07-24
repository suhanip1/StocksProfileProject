from django.contrib import admin
from django.urls import path, include
from . import views
from .views import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("user/register/", SignupView.as_view(), name="register"),
   path("token/", TokenObtainPairView.as_view(), name="get_token"),
    path("token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path('user/get-curr-user/', get_current_user, name='get_current_user'),

    path('find-username/<str:username2>/', views.find, name='snfndf'),
    path('find-user/<str:username>/', views.find_user, name='find_user'),
    path('get-friends/', views.get_friends, name='get_friends'),
    path('get-pending-friends/', views.get_pending_friends, name='get_pending_friends'),
    path('get_our_pending_requests/', views.get_our_pending_requests, name='get_our_pending_requests'),
    path('send-friend-request/<str:username>/', views.send_friend_request, name='send_friend_request'),
    path('remove-friends/<str:username>/', views.remove_friend, name='remove_friend'),
    path('accept-pending-req/<str:username>/', views.accept_friend_request, name='accept_friend_request'),
    path('remove_sentReq/<str:username>/', views.remove_sent_request, name='remove_sent_request'),
    
    path('stock-performance/', stock_performance, name ='get_stock_performance'),
    path('stocklists/', StockListView.as_view(), name='stocklist_list'),
    path('stocklists/edit/<int:slid>/<str:visibility>/<str:sl_name>', StockListEditView.as_view(), name='stocklist_edit'),
    path('stocklists/create/', StockListCreateView.as_view(), name='stocklist_create'),
    path('stocklists/delete/<int:slid>/', StockListDeleteView.as_view(), name='stocklist_delete'),
    path('stocklistitems/add-or-update/', StockListItemAddOrUpdateView.as_view(), name='stocklistitem_add_or_update'),
    path('stocks/', StockView.as_view(), name='get_stocks'),
    path('stocklistitems/<int:slid>/', StockListItemView.as_view(), name='get_stocklist_items'),
]