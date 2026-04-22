from django.urls import path

from . import views

urlpatterns = [
    path("", views.grade_list, name="grade-list"),
    path("<int:grade_id>/", views.grade_detail, name="grade-detail"),
    path("course/<int:course_id>/", views.course_grades, name="course-grades"),
]
