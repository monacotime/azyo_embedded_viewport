from django.contrib import admin
from django.urls import path
from django.shortcuts import render

from AZYO_ENDPOINT.views import TestAPI

urlpatterns = [
    path('admin/', admin.site.urls),
    path('test_api/', TestAPI.as_view(), name='test_api'),
    path('test_page/', lambda request: render(request, 'test.html'))
]
