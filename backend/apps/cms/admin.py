from django.contrib import admin
from django.utils.html import format_html
from .models import PageContent, Article, KeyMetric, Testimonial, FAQItem, ContactMessage, Partner, Milestone

@admin.register(PageContent)
class PageContentAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'is_published', 'updated_at')
    list_filter = ('is_published',)
    search_fields = ('title', 'slug', 'content')
    prepopulated_fields = {'slug': ('title',)}

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'author_name', 'is_published', 'published_at')
    list_filter = ('category', 'is_published', 'published_at')
    search_fields = ('title', 'excerpt', 'content')
    prepopulated_fields = {'slug': ('title',)}

@admin.register(KeyMetric)
class KeyMetricAdmin(admin.ModelAdmin):
    list_display = ('label', 'value', 'icon', 'order', 'is_active')
    list_editable = ('value', 'order', 'is_active')

@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ('photo_preview', 'name', 'role', 'role_type', 'mission', 'rating', 'location', 'is_featured', 'is_published', 'order', 'created_at')
    list_filter = ('role_type', 'is_featured', 'is_published', 'rating', 'mission')
    list_editable = ('is_featured', 'is_published', 'rating', 'order')
    search_fields = ('name', 'role', 'quote', 'location')
    raw_id_fields = ('mission',)

    def photo_preview(self, obj):
        url = ''
        if obj.photo:
            url = obj.photo.url
        elif obj.avatar_url:
            url = obj.avatar_url
        if url:
            return format_html('<img src="{}" style="width: 36px; height: 36px; object-fit: cover; border-radius: 9999px; box-shadow: 0 1px 3px rgba(0,0,0,0.2);" />', url)
        return '—'
    photo_preview.short_description = 'Photo'

@admin.register(FAQItem)
class FAQItemAdmin(admin.ModelAdmin):
    list_display = ('question', 'category', 'order', 'is_published')
    list_editable = ('order', 'is_published')
    list_filter = ('category', 'is_published')

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('subject', 'name', 'email', 'phone', 'is_addressed', 'created_at')
    list_filter = ('is_addressed', 'created_at')
    search_fields = ('name', 'email', 'subject', 'message')
    list_editable = ('is_addressed',)

@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'order', 'is_active', 'created_at')
    list_editable = ('order', 'is_active')
    list_filter = ('category', 'is_active')
    search_fields = ('name', 'description', 'website_url')

@admin.register(Milestone)
class MilestoneAdmin(admin.ModelAdmin):
    list_display = ('year', 'title', 'tag', 'order', 'is_active', 'created_at')
    list_editable = ('order', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('year', 'title', 'tag', 'description')
