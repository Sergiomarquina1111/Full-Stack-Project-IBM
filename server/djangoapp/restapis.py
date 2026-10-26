"""Data access layer: reads/writes dealership and review JSON, and runs sentiment analysis."""
import json
import re
from pathlib import Path

import requests
from django.conf import settings

POSITIVE = {"good", "great", "excellent", "fantastic", "amazing", "love", "happy", "best",
            "friendly", "honest", "perfect", "wonderful", "awesome", "pleased", "recommend"}
NEGATIVE = {"bad", "terrible", "awful", "poor", "worst", "hate", "slow", "rude", "confusing",
            "disappointed", "horrible", "dishonest", "long", "broken", "unhappy", "never"}


def _path(name):
    return Path(settings.DATA_DIR) / name


def _read(name):
    with open(_path(name), encoding="utf-8") as f:
        return json.load(f)


def _write(name, data):
    with open(_path(name), "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def analyze_sentiment(text):
    """Return 'positive', 'negative' or 'neutral'. Uses the microservice if configured."""
    if settings.SENTIMENT_URL:
        try:
            r = requests.get(settings.SENTIMENT_URL, params={"text": text}, timeout=5)
            r.raise_for_status()
            return r.json()["sentiment"]
        except (requests.RequestException, KeyError, ValueError):
            pass  # fall back to the local lexicon
    words = re.findall(r"[a-z']+", (text or "").lower())
    score = sum(w in POSITIVE for w in words) - sum(w in NEGATIVE for w in words)
    if score > 0:
        return "positive"
    if score < 0:
        return "negative"
    return "neutral"


def get_all_dealers():
    data = _read("dealerships.json")
    return data["dealerships"] if isinstance(data, dict) else data


def get_dealers_by_state(state):
    s = state.lower()
    return [d for d in get_all_dealers()
            if d["state"].lower() == s or d["st"].lower() == s]


def get_dealer_by_id(dealer_id):
    for d in get_all_dealers():
        if int(d["id"]) == int(dealer_id):
            return d
    return None


def get_reviews_for_dealer(dealer_id):
    reviews = _read("reviews.json")["reviews"]
    result = []
    for r in reviews:
        if int(r.get("dealership", -1)) == int(dealer_id):
            if "sentiment" not in r:
                r["sentiment"] = analyze_sentiment(r.get("review", ""))
            result.append(r)
    return result


def add_review(review):
    data = _read("reviews.json")
    reviews = data["reviews"]
    review["id"] = max([r["id"] for r in reviews] or [0]) + 1
    review["sentiment"] = analyze_sentiment(review.get("review", ""))
    reviews.append(review)
    _write("reviews.json", {"reviews": reviews})
    return review
