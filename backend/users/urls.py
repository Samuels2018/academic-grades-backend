from django.urls import path

from . import views

urlpatterns = [
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("me/", views.current_user, name="current-user"),
    path("users/", views.users_by_role, name="users-by-role"),
]
