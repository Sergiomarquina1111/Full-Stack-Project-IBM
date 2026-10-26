"""Standalone Flask sentiment microservice.

Run:   python sentiment_analyzer.py            (listens on port 5050)
Call:  GET /analyze?text=Fantastic%20services  ->  {"sentiment": "positive"}
"""
import re

from flask import Flask, jsonify, request

app = Flask(__name__)

POSITIVE = {"good", "great", "excellent", "fantastic", "amazing", "love", "happy", "best",
            "friendly", "honest", "perfect", "wonderful", "awesome", "pleased", "recommend"}
NEGATIVE = {"bad", "terrible", "awful", "poor", "worst", "hate", "slow", "rude", "confusing",
            "disappointed", "horrible", "dishonest", "long", "broken", "unhappy", "never"}


def classify(text):
    words = re.findall(r"[a-z']+", text.lower())
    score = sum(w in POSITIVE for w in words) - sum(w in NEGATIVE for w in words)
    return "positive" if score > 0 else "negative" if score < 0 else "neutral"


@app.route("/analyze")
def analyze():
    text = request.args.get("text", "")
    return jsonify({"sentiment": classify(text), "text": text})


if __name__ == "__main__":
    app.run(port=5050, debug=False)
