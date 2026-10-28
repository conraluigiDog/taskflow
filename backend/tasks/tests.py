from django.contrib.auth.models import User
from rest_framework.test import APITestCase


class TaskApiTests(APITestCase):
    def auth(self, username="ana"):
        User.objects.create_user(username, password="senha-forte-123")
        res = self.client.post("/api/auth/login/", {"username": username, "password": "senha-forte-123"})
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {res.data['access']}")

    def test_register_and_login(self):
        res = self.client.post("/api/auth/register/", {"username": "bia", "password": "senha-forte-123"})
        self.assertEqual(res.status_code, 201)
        res = self.client.post("/api/auth/login/", {"username": "bia", "password": "senha-forte-123"})
        self.assertIn("access", res.data)

    def test_requires_authentication(self):
        self.assertEqual(self.client.get("/api/tasks/").status_code, 401)

    def test_create_and_stats(self):
        self.auth()
        self.client.post("/api/tasks/", {"title": "Estudar Django"})
        self.client.post("/api/tasks/", {"title": "Publicar projeto", "status": "done"})
        stats = self.client.get("/api/tasks/stats/").data
        self.assertEqual(stats, {"todo": 1, "doing": 0, "done": 1})

    def test_users_cannot_see_each_other_tasks(self):
        self.auth("ana")
        self.client.post("/api/tasks/", {"title": "Segredo da Ana"})
        self.client.credentials()
        self.auth("beto")
        self.assertEqual(len(self.client.get("/api/tasks/").data), 0)
