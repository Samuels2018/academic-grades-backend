from django.test import TestCase, Client
from django.urls import reverse
from users.models import User
from courses.models import Course, Enrollment
import json

class CourseAPITests(TestCase):
    def setUp(self):
        self.client = Client()
        self.admin = User.objects.create_superuser("admin", "admin@test.com", "pass", role="admin")
        self.teacher = User.objects.create_user("teacher", "t@t.com", "pass", role="teacher")
        self.student = User.objects.create_user("student", "s@s.com", "pass", role="student")
        self.course = Course.objects.create(name="Math", teacher=self.teacher)

    def test_admin_can_create_course(self):
        self.client.login(username="admin", password="pass")
        response = self.client.post(reverse("course-list-create"),
                                    data=json.dumps({"name": "Physics", "teacher_id": self.teacher.id}),
                                    content_type="application/json")
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Course.objects.filter(name="Physics").exists())

    def test_teacher_cannot_create_course(self):
        self.client.login(username="teacher", password="pass")
        response = self.client.post(reverse("course-list-create"),
                                    data=json.dumps({"name": "Physics"}),
                                    content_type="application/json")
        self.assertEqual(response.status_code, 403)

    def test_student_can_view_enrolled_courses(self):
        Enrollment.objects.create(student=self.student, course=self.course)
        self.client.login(username="student", password="pass")
        response = self.client.get(reverse("course-list-create"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["name"], "Math")