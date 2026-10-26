"""IBM Cloud Function (Python): dealer reviews microservice.

Actions:
  {"action": "get_reviews", "dealerId": 1}
  {"action": "post_review", "review": {...}}
"""
import json
import os

DATA = os.path.join(os.path.dirname(__file__), "..", "cloudant", "data", "reviews.json")


def _load():
    with open(DATA, encoding="utf-8") as f:
        return json.load(f)["reviews"]


def _save(reviews):
    with open(DATA, "w", encoding="utf-8") as f:
        json.dump({"reviews": reviews}, f, indent=2)


def main(params):
    action = params.get("action", "get_reviews")
    if action == "get_reviews":
        dealer_id = int(params.get("dealerId", 0))
        result = [r for r in _load() if int(r.get("dealership", -1)) == dealer_id]
        return {"statusCode": 200, "body": {"entries": result}}

    if action == "post_review":
        reviews = _load()
        review = params.get("review", {})
        review["id"] = max([r["id"] for r in reviews] or [0]) + 1
        reviews.append(review)
        _save(reviews)
        return {"statusCode": 200, "body": review}

    return {"statusCode": 400, "body": {"error": f"unknown action {action}"}}
