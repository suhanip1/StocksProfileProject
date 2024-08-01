from django.contrib import admin
from django.urls import path, include
from .views import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("user/register/", SignupView.as_view(), name="register"),
   path("token/", TokenObtainPairView.as_view(), name="get_token"),
    path("token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path('user/get-curr-user/', get_current_user, name='get_current_user'),
    path("get-curr-username/", get_current_username, name="get_current_username"),
    path('find-username/', find, name='snfndf'),
    path('find-user/<str:username>/', find_user, name='find_user'),
    path('get-friends/', get_friends, name='get_friends'),
    path('get-pending-friends/', get_pending_friends, name='get_pending_friends'),
    path('get_our_pending_requests/', get_our_pending_requests, name='get_our_pending_requests'),
    path('send-friend-request/<str:username>/', send_friend_request, name='send_friend_request'),
    path('remove-friends/<str:username>/', remove_friend, name='remove_friend'),
    path('accept-pending-req/<str:username>/', accept_friend_request, name='accept_friend_request'),
    path('remove_sentReq/<str:username>/', remove_sent_request, name='remove_sent_request'),
    
    path('stock-performance/', stock_performance, name ='get_stock_performance'),
    path('stocklists/', StockListView.as_view(), name='stocklist_list'),
    path('stocklists/edit/<int:slid>/<str:visibility>/<str:sl_name>', StockListEditView.as_view(), name='stocklist_edit'),
    path('stocklists/create/', StockListCreateView.as_view(), name='stocklist_create'),
    path('stocklists/delete/<int:slid>/', StockListDeleteView.as_view(), name='stocklist_delete'),
    path('stocklistitems/add-or-update/', StockListItemAddOrUpdateView.as_view(), name='stocklistitem_add_or_update'),
    path('stocks/', StockView.as_view(), name='get_stocks'),
    path('stocklistitems/<int:slid>/', StockListItemView.as_view(), name='get_stocklist_items'),

    path('shareStockList/<str:slid>/<str:friend_username>/', create_stock_list_accessibility, name="share_stock_list"),
    path('getSharedStockList/', get_all_stockLists_shared, name="shared_stock_list"),
    
    path('leaveReview/<int:slid>/', leave_review, name='leave_review'),
    path('editReview/<int:slid>/', edit_review, name='edit_review'),
    path('deleteReview/<int:slid>/', delete_review, name='delete_review'),
    path('getReview/<int:slid>/', get_review, name='get_review'),
    path('allReviews/<int:slid>/', get_all_reviews, name="get_all_reviews"),
    path('delete_review_of_your_stock_list/<int:slid>/<str:username>/', delete_review_of_your_stock_list, name="delete_from_your_stock_list"),
    path('publicStockLists/', get_public_stock_lists, name='get_public_stock_lists'),
    
]