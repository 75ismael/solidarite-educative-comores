from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

admin.site.site_header = "Solidarité Éducative Comores — Administration"
admin.site.site_title = "CMS & Portail Bénévolat"
admin.site.index_title = "Gestion de la plateforme"

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/cms/', include('apps.cms.urls')),
    path('api/pedagogy/', include('apps.pedagogy.urls')),
    path('api/volunteering/', include('apps.volunteering.urls')),
    path('api/matching/', include('apps.matching.urls')),
    path('api/sessions/', include('apps.sessions_track.urls')),
    path('api/safeguarding/', include('apps.safeguarding.urls')),
    path('api/finance/', include('apps.finance.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
