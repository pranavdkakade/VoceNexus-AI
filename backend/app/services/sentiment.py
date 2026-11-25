"""
Customer Sentiment Analysis Service.
Detects sentiment (positive, neutral, negative) and customer intent/urgency.
"""

from typing import Dict, Any


def analyze_sentiment_fast(text: str) -> Dict[str, Any]:
    """
    Lightweight rule and keyword sentiment analyzer for real-time latency.
    """
    lower = text.lower()

    positive_keywords = [
        "great", "awesome", "perfect", "interested", "love", "sounds good",
        "definitely", "yes", "sure", "need", "looking forward", "excellent",
        "impressive", "ready", "demo", "book", "schedule", "pricing"
    ]
    negative_keywords = [
        "too expensive", "not interested", "bad", "terrible", "waste",
        "no", "don't want", "cancel", "unhappy", "frustrated", "competitor",
        "complicated", "slow", "doubt"
    ]

    pos_count = sum(1 for kw in positive_keywords if kw in lower)
    neg_count = sum(1 for kw in negative_keywords if kw in lower)

    if pos_count > neg_count:
        sentiment = "positive"
        score = min(0.6 + (pos_count * 0.1), 0.98)
    elif neg_count > pos_count:
        sentiment = "negative"
        score = min(0.6 + (neg_count * 0.1), 0.95)
    else:
        sentiment = "neutral"
        score = 0.5

    return {
        "sentiment": sentiment,
        "confidence": round(score, 2),
        "is_positive": sentiment == "positive"
    }
