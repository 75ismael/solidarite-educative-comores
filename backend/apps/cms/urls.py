from django.urls import path
from .views import (
    PageContentView,
    PageContentListView,
    ArticleListView,
    ArticleDetailView,
    KeyMetricListView,
    TestimonialListView,
    FAQItemListView,
    ContactMessageCreateView,
    ImpactReportView,
    PartnerListView,
    MilestoneListView,
)

urlpatterns = [
    path('pages/', PageContentListView.as_view(), name='page_list'),
    path('pages/<slug:slug>/', PageContentView.as_view(), name='page_detail'),
    path('articles/', ArticleListView.as_view(), name='article_list'),
    path('articles/<slug:slug>/', ArticleDetailView.as_view(), name='article_detail'),
    path('metrics/', KeyMetricListView.as_view(), name='metric_list'),
    path('testimonials/', TestimonialListView.as_view(), name='testimonial_list'),
    path('faq/', FAQItemListView.as_view(), name='faq_list'),
    path('contact/', ContactMessageCreateView.as_view(), name='contact_create'),
    path('impact-report/', ImpactReportView.as_view(), name='impact_report'),
    path('partners/', PartnerListView.as_view(), name='partner_list'),
    path('milestones/', MilestoneListView.as_view(), name='milestone_list'),
]
