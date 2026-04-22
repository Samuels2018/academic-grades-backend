from django.test import TestCase, Client
from django.urls import reverse
from users.models import User
import json

class UserAuthTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username="student1", password="pass", role="student")
        self.teacher = User.objects.create_user(username="teacher1", password="pass", role="teacher")

    def test_login_success(self):
        response = self.client.post(reverse("login"),
                                    data=json.dumps({"username": "student1", "password": "pass"}),
                                    content_type="application/json")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["username"], "student1")
        self.assertEqual(data["role"], "student")

    def test_login_failure(self):
        response = self.client.post(reverse("login"),
                                    data=json.dumps({"username": "student1", "password": "wrong"}),
                                    content_type="application/json")
        self.assertEqual(response.status_code, 401)
        self.assertIn("error", response.json())

    def test_current_user_authenticated(self):
        self.client.login(username="student1", password="pass")
        response = self.client.get(reverse("current-user"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["username"], "student1")

    def test_current_user_unauthenticated(self):
        response = self.client.get(reverse("current-user"))
        self.assertEqual(response.status_code, 401)