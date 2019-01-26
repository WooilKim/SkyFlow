from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('lineup', views.lineup, name='lineup')
    # path('relation', views.relation, name='relation'),
    # path('projection', views.projection, name='projection'),
    # path('project_plain', views.project_plain, name='project_plain'),
    # path('compare', views.compare, name='compare'),
    # path('bundling', views.bundling, name='bundling'),
    # path('mapbox', views.mapbox, name='mapbox'),
    # path('skyx', views.skyx, name='skyx'),
    # path('calculate', views.calculate, name='calculate'),
]
