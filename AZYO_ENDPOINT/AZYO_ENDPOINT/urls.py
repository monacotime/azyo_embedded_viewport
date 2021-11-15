from django.contrib import admin
from django.urls import path
from django.shortcuts import render
from django.urls.conf import include

urlpatterns = [
    path('', include('CORE.urls'))
]
