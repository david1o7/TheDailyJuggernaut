from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from news.models import Post, Category, UserProfile
from django.utils import timezone
from datetime import timedelta

class Command(BaseCommand):
    help = 'Create welcome posts for Daily Juggernaut'

    def handle(self, *args, **options):
        # Create or get admin user
        admin_user, created = User.objects.get_or_create(
            username='dailyjuggernaut',
            defaults={
                'email': 'admin@dailyjuggernaut.com',
                'first_name': 'Daily',
                'last_name': 'Juggernaut',
                'is_staff': True,
                'is_active': True
            }
        )
        
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(f'Created admin user: {admin_user.username}')
        
        # Create or get admin profile
        admin_profile, created = UserProfile.objects.get_or_create(
            user=admin_user,
            defaults={
                'bio': 'Official Daily Juggernaut team account bringing you the latest campus news and updates.',
                'location': 'Campus',
                'website': 'https://dailyjuggernaut.com'
            }
        )

        # Create categories
        campus_news, _ = Category.objects.get_or_create(
            name='Campus News',
            defaults={'description': 'Latest news from around campus', 'color': '#3B82F6'}
        )
        
        student_life, _ = Category.objects.get_or_create(
            name='Student Life',
            defaults={'description': 'Student activities and lifestyle', 'color': '#8B5CF6'}
        )
        
        opinion, _ = Category.objects.get_or_create(
            name='Opinion',
            defaults={'description': 'Opinion pieces and editorials', 'color': '#EAB308'}
        )

        # Create welcome posts
        posts_data = [
            {
                'title': '🎉 Welcome to Daily Juggernaut - Your Campus News Hub!',
                'content': '''We're thrilled to have you join our vibrant community of students, faculty, and campus enthusiasts! Daily Juggernaut is your go-to destination for staying connected with everything happening on campus.

From breaking news and research breakthroughs to student achievements and upcoming events, we've got you covered. Share your stories, engage with fellow community members, and be part of the conversation that shapes our campus culture.

Whether you're looking for the latest updates, want to contribute your own content, or simply stay informed about campus life, you're in the right place. Let's build an informed and engaged campus community together!

Features you can explore:
• 📰 Latest campus news and updates
• 🔍 Search for specific topics and users
• 💬 Comment and engage with posts
• 👍 Like posts from fellow community members
• 📱 Mobile-friendly responsive design
• 🌙 Dark and light theme options

Welcome aboard! 🚀''',
                'category': campus_news,
                'is_featured': True,
                'created_at': timezone.now()
            },
            {
                'title': '📚 Getting Started: How to Make the Most of Daily Juggernaut',
                'content': '''New to Daily Juggernaut? Here's your quick guide to navigating our platform and making the most of your experience!

**Getting Started:**
1. Complete your profile with a bio and profile picture
2. Follow topics and categories that interest you
3. Start engaging with posts through likes and comments
4. Use our search feature to find specific content or discover new voices

**Key Features:**
• **Search Bar**: Find users, posts, and topics quickly
• **Trending Topics**: Stay updated with what's hot on campus
• **Categories**: Browse content by specific interests
• **Notifications**: Get notified when someone interacts with your content

**Community Guidelines:**
• Be respectful and constructive in discussions
• Share accurate information and cite sources when needed
• Report inappropriate content to help maintain our community standards
• Engage meaningfully - quality over quantity!

Don't forget to check out our trending topics and featured stories to stay up-to-date with what's happening on campus. Happy browsing! 📖✨''',
                'category': student_life,
                'is_featured': False,
                'created_at': timezone.now() - timedelta(days=1)
            },
            {
                'title': '🤝 Building a Positive Campus Community',
                'content': '''At Daily Juggernaut, we believe in fostering respectful dialogue and meaningful connections. Our community thrives on diverse perspectives, constructive discussions, and mutual support.

**Our Community Values:**
• **Respect**: Treat all community members with dignity and courtesy
• **Inclusivity**: Welcome diverse viewpoints and backgrounds
• **Academic Excellence**: Promote learning and intellectual growth
• **Campus Unity**: Strengthen our shared campus identity
• **Constructive Dialogue**: Engage in meaningful, solution-oriented discussions

**How You Can Contribute:**
• Share your unique campus experiences and insights
• Support fellow students through encouragement and helpful advice
• Participate in discussions with an open mind
• Report content that violates our community standards
• Celebrate achievements and milestones of community members

**Making Connections:**
Use our platform to connect with classmates, discover study groups, find event buddies, and build lasting friendships. Whether you're a freshman finding your way or a senior sharing wisdom, everyone has something valuable to contribute.

Together, we're not just sharing news – we're building a stronger, more connected campus community. Let's make Daily Juggernaut a place where every voice matters and every story has value. 🌟

What's your campus story? We'd love to hear it!''',
                'category': opinion,
                'is_featured': False,
                'created_at': timezone.now() - timedelta(days=2)
            }
        ]

        created_posts = []
        for post_data in posts_data:
            post, created = Post.objects.get_or_create(
                title=post_data['title'],
                author=admin_user,
                defaults={
                    'content': post_data['content'],
                    'category': post_data['category'],
                    'is_featured': post_data['is_featured'],
                    'is_published': True,
                    'visibility': 'public',
                    'created_at': post_data['created_at']
                }
            )
            
            if created:
                created_posts.append(post)
                self.stdout.write(f'Created post: {post.title}')
            else:
                self.stdout.write(f'Post already exists: {post.title}')

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {len(created_posts)} welcome posts!')
        )
