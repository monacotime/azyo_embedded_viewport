from django.urls import path
from django.shortcuts import render

from .views import TestAPI, test

urlpatterns = [
    path('test/', test, name='test_api'),
    path('test_api/', TestAPI.as_view(), name='test_api'),
    path('test_page/', lambda request: render(request, 'test.html'))
]
