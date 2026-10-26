from django.test import TestCase
from django.contrib.auth.models import User

from . import restapis


class SentimentTests(TestCase):
    def test_positive(self):
        self.assertEqual(restapis.analyze_sentiment("Fantastic services"), "positive")

    def test_negative(self):
        self.assertEqual(restapis.analyze_sentiment("Terrible and slow"), "negative")


class DealerApiTests(TestCase):
    def test_get_all_dealers(self):
        r = self.client.get("/djangoapp/get_dealers")
        self.assertEqual(r.status_code, 200)
        self.assertGreater(len(r.json()["dealers"]), 0)

    def test_filter_by_state(self):
        r = self.client.get("/djangoapp/get_dealers/Kansas")
        self.assertTrue(all(d["state"] == "Kansas" for d in r.json()["dealers"]))

    def test_dealer_by_id(self):
        r = self.client.get("/djangoapp/dealer/1")
        self.assertEqual(r.json()["dealer"]["id"], 1)

    def test_login_and_add_review(self):
        User.objects.create_user("tester", password="pass12345")
        r = self.client.post("/djangoapp/login", {"userName": "tester", "password": "pass12345"})
        self.assertEqual(r.json()["status"], "Authenticated")
        r = self.client.post("/djangoapp/add_review", {"dealership": 1, "review": "Great stuff"},
                             content_type="application/json")
        self.assertEqual(r.status_code, 200)
