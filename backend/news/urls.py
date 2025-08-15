from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

# Create router for ViewSets
router = DefaultRouter()
router.register(r'posts', views.PostViewSet)
router.register(r'comments', views.CommentViewSet)
router.register(r'categories', views.CategoryViewSet)
router.register(r'follows', views.FollowViewSet)
router.register(r'notifications', views.NotificationViewSet, basename='notification')

urlpatterns = [
    # Authentication
    path('auth/register/', views.CreateUserView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User Profile
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('dashboard/', views.UserDashboardView.as_view(), name='user-dashboard'),
    path('search/users/', views.UserSearchView.as_view(), name='user-search'),
    
    # Dashboard & Stats
    path('dashboard/stats/', views.dashboard_stats, name='dashboard-stats'),
    
    # Include router URLs
    path('', include(router.urls)),
]
