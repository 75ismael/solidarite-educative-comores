from rest_framework import serializers
from .models import PageContent, Article, KeyMetric, Testimonial, FAQItem, ContactMessage, Partner, Milestone

class PageContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageContent
        fields = '__all__'

class ArticleSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = Article
        fields = '__all__'

class KeyMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = KeyMetric
        fields = '__all__'

class TestimonialSerializer(serializers.ModelSerializer):
    role_type_display = serializers.CharField(source='get_role_type_display', read_only=True)
    mission_title = serializers.CharField(source='mission.title', read_only=True)
    photo_display = serializers.SerializerMethodField()

    class Meta:
        model = Testimonial
        fields = '__all__'

    def get_photo_display(self, obj):
        request = self.context.get('request')
        if obj.photo:
            try:
                if request:
                    return request.build_absolute_uri(obj.photo.url)
                return obj.photo.url
            except Exception:
                pass
        return obj.avatar_url or ''

class FAQItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQItem
        fields = '__all__'

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'
        read_only_fields = ['id', 'is_addressed', 'created_at']

class PartnerSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = Partner
        fields = '__all__'

class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = '__all__'

