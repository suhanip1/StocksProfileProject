from django.contrib import admin
from django.urls import path, include
from .views import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("user/register/", SignupView.as_view(), name="register"),
   path("token/", TokenObtainPairView.as_view(), name="get_token"),
    path("token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path('user/get-curr-user/', get_current_user, name='get_current_user'),
    
    path('find-username/', find, name='snfndf'),
    path('find-user/<str:username>/', find_user, name='find_user'),
    path('get-friends/', get_friends, name='get_friends'),
    path('get-pending-friends/', get_pending_friends, name='get_pending_friends'),
    path('get_our_pending_requests/', get_our_pending_requests, name='get_our_pending_requests'),
    path('send-friend-request/<str:username>/', send_friend_request, name='send_friend_request'),
    path('remove-friends/<str:username>/', remove_friend, name='remove_friend'),
    path('accept-pending-req/<str:username>/', accept_friend_request, name='accept_friend_request'),
    path('remove_sentReq/<str:username>/', remove_sent_request, name='remove_sent_request'),

    path('get-date/', get_latest_date, name ='get_latest_date'),
    path('stock-performance/', stock_performance, name ='get_stock_performance'),
    path('predict-prices/<str:symbol>/<str:pastInterval>/<str:futureInterval>/', predict_prices, name='predict_prices'),
    
    path('stocklists/', StockListView.as_view(), name='stocklist_list'),
    path('stocklists/edit/<int:slid>/<str:visibility>/<str:sl_name>', StockListEditView.as_view(), name='stocklist_edit'),
    path('stocklists/create/', StockListCreateView.as_view(), name='stocklist_create'),
    path('stocklists/delete/<int:slid>/', StockListDeleteView.as_view(), name='stocklist_delete'),
    path('stocklistitems/add-or-update/', StockListItemAddOrUpdateView.as_view(), name='stocklistitem_add_or_update'),
    path('remove-stock-list-item/<int:slid>/<str:symbol>/<int:shares>/', remove_stock_list_item, name='remove_stock_list_item'),
    path('stocklist/<int:slid>/market_value/', StocklistMarketValueView.as_view(), name='stocklist_market_value'),

    path('stocks/', StockView.as_view(), name='get_stocks'),
    path('strike-price/<str:symbol>/', GetStrikePriceView.as_view(), name='get-strike-price'),
    path('stocklistitems/<int:slid>/', StockListItemView.as_view(), name='get_stocklist_items'),

    path('portfolio/', PortfolioView.as_view(), name='portfolio_list'),
    path('portfolio/edit/<int:pid>/<str:pname>', PortfolioEditView.as_view(), name='portfolio_edit'),
    path('portfolio/create/', PortfolioCreateView.as_view(), name='portfolio_create'),
    path('portfolio/delete/<int:pid>/', PortfolioDeleteView.as_view(), name='portfolio_delete'),
    path('portfolio/stock-holdings/<int:pid>/', StockHoldingsView.as_view(), name='get_stock_holdings'),
    path('portfolio/<int:pid>/market_value/', PortfolioMarketValueView.as_view(), name='portfolio_market_value'),
    
    path('cash-account/<int:pid>/', PortfolioCashBalanceView.as_view(), name='get_cash_balance'),
    path('cash-account/transfer/<int:pid1>/<int:pid2>/<str:amount>', PortfolioCashTransferView.as_view(), name='portfolio-transfer'),
    path('cash-account/deposit/<int:pid>/<str:amount>', PortfolioCashDepositView.as_view(), name='cash-deposit'),
    path('cash-account/withdraw/<int:pid>/<str:amount>', PortfolioCashWithdrawView.as_view(), name='cash-withdraw'),
    path('buy-stock/<int:pid>/<str:symbol>/<int:quantity>/', BuyStockView.as_view(), name='buy-stock'),
    path('sell-stock/<int:pid>/<str:symbol>/<int:shares>/', SellStockView.as_view(), name='sell-stock'),

    path("stock-performace/add/", DailyStockInformationView.as_view(), name="addStockPerformace"),
    path('stock-cov/', stock_cov, name ='get_stock_cov'),
    path('stock-beta/', stock_beta, name ='get_stock_beta'),
    path('covariance-matrix/<int:id>/<str:interval>/<str:type>', get_covariance_matrix, name='covariance_matrix'),
    path('correlation-matrix/<int:id>/<str:interval>/<str:type>', get_correlation_matrix, name='correlation_matrix'),

    
]