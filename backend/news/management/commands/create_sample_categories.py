from django.core.management.base import BaseCommand
from news.models import Category

class Command(BaseCommand):
    help = 'Create sample categories for testing'

    def handle(self, *args, **options):
        categories = [
            {
                'name': 'Breaking News',
                'description': 'Latest breaking news and urgent updates',
                'color': '#DC2626'  # Red
            },
            {
                'name': 'Sports',
                'description': 'Campus sports, games, and athletic events',
                'color': '#16A34A'  # Green
            },
            {
                'name': 'Technology',
                'description': 'Tech news, innovations, and digital trends',
                'color': '#2563EB'  # Blue
            },
            {
                'name': 'Campus Life',
                'description': 'Student life, events, and campus activities',
                'color': '#7C3AED'  # Purple
            },
            {
                'name': 'Academic',
                'description': 'Academic news, research, and educational content',
                'color': '#EA580C'  # Orange
            },
            {
                'name': 'Entertainment',
                'description': 'Entertainment, culture, and lifestyle content',
                'color': '#DB2777'  # Pink
            }
        ]

        created_count = 0
        for category_data in categories:
            category, created = Category.objects.get_or_create(
                name=category_data['name'],
                defaults={
                    'description': category_data['description'],
                    'color': category_data['color']
                }
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created category: {category.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Category already exists: {category.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} new categories')
        )
