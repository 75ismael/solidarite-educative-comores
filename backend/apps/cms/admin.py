from django.contrib import admin
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
    list_display = ('name', 'role', 'location', 'is_featured', 'created_at')
    list_filter = ('is_featured', 'role')

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
