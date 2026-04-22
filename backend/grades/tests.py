import json

from django.test import Client, TestCase
from django.urls import reverse

from courses.models import Course, Enrollment
from grades.models import Grade
from users.models import User


class GradeAPITests(TestCase):
    def setUp(self):
        self.client = Client()
        self.teacher = User.objects.create_user("teacher", "t@t.com", "pass", role="teacher")
        self.student = User.objects.create_user("student", "s@s.com", "pass", role="student")
        self.course = Course.objects.create(name="Math", teacher=self.teacher)
        Enrollment.objects.create(student=self.student, course=self.course)
        self.grade = Grade.objects.create(student=self.student, course=self.course, score=85)

    def test_student_can_view_own_grades(self):
        self.client.login(username="student", password="pass")
        response = self.client.get(reverse("grade-list"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["score"], 85)

    def test_teacher_can_update_grade(self):
        self.client.login(username="teacher", password="pass")
        response = self.client.put(
            reverse("grade-detail", args=[self.grade.id]),
            data=json.dumps({"score": 95}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.grade.refresh_from_db()
        self.assertEqual(self.grade.score, 95)

    def test_student_cannot_update_grade(self):
        self.client.login(username="student", password="pass")
        response = self.client.put(
            reverse("grade-detail", args=[self.grade.id]),
            data=json.dumps({"score": 100}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 403)
