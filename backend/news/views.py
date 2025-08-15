from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from django.db.models import Q, F
from rest_framework import generics, status, viewsets, permissions, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from .models import UserProfile, Post, Like, Comment, Notification, Category, Follow, Share
from .serializers import (
    UserSerializer, UserProfileSerializer, UserUpdateSerializer, PostSerializer, PostCreateSerializer,
    LikeSerializer, CommentSerializer, NotificationSerializer,
    CategorySerializer, FollowSerializer, ShareSerializer
)


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        # Create user profile automatically
        UserProfile.objects.create(user=user)


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserProfileSerializer


class UserDashboardView(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile

    def get(self, request, *args, **kwargs):
        profile = self.get_object()
        serializer = self.get_serializer(profile)
        
        # Get additional dashboard data
        user_posts = request.user.posts.all()[:5]  # Latest 5 posts
        recent_activity = {
            'total_posts': request.user.posts.count(),
            'total_likes_received': sum(post.likes_count for post in request.user.posts.all()),
            'total_comments_received': sum(post.comments_count for post in request.user.posts.all()),
            'recent_posts': [
                {
                    'id': post.id,
                    'title': post.title,
                    'created_at': post.created_at,
                    'likes_count': post.likes_count,
                    'comments_count': post.comments_count,
                    'views_count': post.views_count
                } for post in user_posts
            ]
        }
        
        data = serializer.data
        data['activity'] = recent_activity
        
        return Response(data)


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.filter(is_published=True)
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'author', 'visibility']
    search_fields = ['title', 'content', 'author__username']
    ordering_fields = ['created_at', 'likes_count', 'views_count']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return PostCreateSerializer
        return PostSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        Post.objects.filter(id=instance.id).update(views_count=F('views_count') + 1)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        post = self.get_object()
        like, created = Like.objects.get_or_create(user=request.user, post=post)
        
        if created:
            # Increment like count
            Post.objects.filter(id=post.id).update(likes_count=F('likes_count') + 1)
            
            # Create notification
            if post.author != request.user:
                Notification.objects.create(
                    recipient=post.author,
                    sender=request.user,
                    notification_type='like',
                    post=post,
                    message=f"{request.user.username} liked your post"
                )
            
            return Response({'status': 'liked'}, status=status.HTTP_201_CREATED)
        else:
            like.delete()
            # Decrement like count
            Post.objects.filter(id=post.id).update(likes_count=F('likes_count') - 1)
            return Response({'status': 'unliked'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        post = self.get_object()
        shared_to = request.data.get('shared_to', 'copy_link')
        
        share = Share.objects.create(
            user=request.user,
            post=post,
            shared_to=shared_to
        )
        
        # Increment share count
        Post.objects.filter(id=post.id).update(shares_count=F('shares_count') + 1)
        
        # Create notification
        if post.author != request.user:
            Notification.objects.create(
                recipient=post.author,
                sender=request.user,
                notification_type='share',
                post=post,
                message=f"{request.user.username} shared your post"
            )
        
        serializer = ShareSerializer(share)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def my_posts(self, request):
        posts = self.queryset.filter(author=request.user)
        page = self.paginate_queryset(posts)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def featured(self, request):
        posts = self.queryset.filter(is_featured=True)
        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['post', 'parent']

    def perform_create(self, serializer):
        comment = serializer.save(author=self.request.user)
        
        # Increment comment count on post
        Post.objects.filter(id=comment.post.id).update(comments_count=F('comments_count') + 1)
        
        # Create notification
        if comment.post.author != self.request.user:
            Notification.objects.create(
                recipient=comment.post.author,
                sender=self.request.user,
                notification_type='comment',
                post=comment.post,
                comment=comment,
                message=f"{self.request.user.username} commented on your post"
            )

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        comment = self.get_object()
        like, created = CommentLike.objects.get_or_create(
            user=request.user, 
            comment=comment
        )
        
        if created:
            # Increment like count
            Comment.objects.filter(id=comment.id).update(likes_count=F('likes_count') + 1)
            return Response({'status': 'liked'}, status=status.HTTP_201_CREATED)
        else:
            like.delete()
            # Decrement like count
            Comment.objects.filter(id=comment.id).update(likes_count=F('likes_count') - 1)
            return Response({'status': 'unliked'}, status=status.HTTP_200_OK)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]


class FollowViewSet(viewsets.ModelViewSet):
    queryset = Follow.objects.all()
    serializer_class = FollowSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'delete']

    def get_queryset(self):
        return self.queryset.filter(follower=self.request.user)

    def perform_create(self, serializer):
        following_user_id = self.request.data.get('following')
        following_user = get_object_or_404(User, id=following_user_id)
        
        if following_user == self.request.user:
            return Response(
                {'error': 'You cannot follow yourself'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        follow, created = Follow.objects.get_or_create(
            follower=self.request.user,
            following=following_user
        )
        
        if created:
            # Update follower/following counts
            UserProfile.objects.filter(user=self.request.user).update(
                following_count=F('following_count') + 1
            )
            UserProfile.objects.filter(user=following_user).update(
                followers_count=F('followers_count') + 1
            )
            
            # Create notification
            Notification.objects.create(
                recipient=following_user,
                sender=self.request.user,
                notification_type='follow',
                message=f"{self.request.user.username} started following you"
            )

    @action(detail=False, methods=['post'])
    def unfollow(self, request):
        following_user_id = request.data.get('following')
        following_user = get_object_or_404(User, id=following_user_id)
        
        try:
            follow = Follow.objects.get(
                follower=request.user,
                following=following_user
            )
            follow.delete()
            
            # Update follower/following counts
            UserProfile.objects.filter(user=request.user).update(
                following_count=F('following_count') - 1
            )
            UserProfile.objects.filter(user=following_user).update(
                followers_count=F('followers_count') - 1
            )
            
            return Response({'status': 'unfollowed'}, status=status.HTTP_200_OK)
        except Follow.DoesNotExist:
            return Response(
                {'error': 'You are not following this user'}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'marked as read'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().update(is_read=True)
        return Response({'status': 'all notifications marked as read'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Get dashboard statistics for the current user"""
    user = request.user
    profile = getattr(user, 'profile', None)
    
    stats = {
        'posts_count': user.posts.count(),
        'likes_received': sum(post.likes_count for post in user.posts.all()),
        'comments_received': sum(post.comments_count for post in user.posts.all()),
        'followers_count': profile.followers_count if profile else 0,
        'following_count': profile.following_count if profile else 0,
        'unread_notifications': user.notifications.filter(is_read=False).count(),
    }
    
    return Response(stats)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_users(request):
    """Search for users by username or name"""
    query = request.GET.get('q', '')
    if len(query) < 2:
        return Response({'results': []})
    
    users = User.objects.filter(
        Q(username__icontains=query) |
        Q(first_name__icontains=query) |
        Q(last_name__icontains=query)
    ).exclude(id=request.user.id)[:10]
    
    results = []
    for user in users:
        profile = getattr(user, 'profile', None)
        results.append({
            'id': user.id,
            'username': user.username,
            'full_name': f"{user.first_name} {user.last_name}".strip(),
            'avatar': profile.avatar.url if profile and profile.avatar else None,
            'is_following': Follow.objects.filter(
                follower=request.user, 
                following=user
            ).exists()
        })
    
    return Response({'results': results})


class UserSearchView(generics.ListAPIView):
    """
    API endpoint for searching users by username, first name, or last name
    """
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        if not query:
            return UserProfile.objects.none()
        
        # Search users by username, first name, or last name
        users = User.objects.filter(
            Q(username__icontains=query) |
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query)
        ).exclude(id=self.request.user.id)  # Exclude current user
        
        # Get profiles for these users
        return UserProfile.objects.filter(user__in=users)
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        query = request.query_params.get('q', '')
        
        if not query:
            return Response({'results': [], 'message': 'Please provide a search query'})
        
        # Limit results to 10 for performance
        queryset = queryset[:10]
        
        results = []
        for profile in queryset:
            user = profile.user
            results.append({
                'id': user.id,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'full_name': f"{user.first_name} {user.last_name}".strip() or user.username,
                'avatar': profile.avatar.url if profile.avatar else None,
                'bio': profile.bio,
                'location': profile.location,
                'is_active': user.is_active,
                'date_joined': user.date_joined
            })
        
        return Response({
            'results': results,
            'count': len(results),
            'query': query
        })