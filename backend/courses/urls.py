from django.urls import path
from . import views

urlpatterns = [
    path("", views.course_list_create, name="course-list-create"),
    path("<int:course_id>/", views.course_detail, name="course-detail"),
    path("<int:course_id>/enroll/", views.enroll_student, name="enroll"),
    path("my-courses/", views.my_courses, name="my-courses"),
]