
### not used now 
import re

GREETINGS = [
    r"\bhi\b", r"\bhello\b", r"\bhey\b",
    r"السلام عليكم", r"مرحبا", r"أهلا"
]

THANKS = [
    r"\bthanks\b", r"\bthank you\b",
    r"شكرا", r"شكرًا"
]

SMALL_TALK = [
    r"how are you", r"how r you",
    r"عامل ايه", r"ازيك", r"كيف حالك"
]

from rapidfuzz import fuzz


def fuzzy_match(text, keywords, threshold=80):
    for word in keywords:
        if fuzz.partial_ratio(text, word) >= threshold:
            return True
    return False

def detect_intent(text: str):
    text = text.lower()

    if fuzzy_match(text, GREETINGS):
        return "greeting"

    if fuzzy_match(text, THANKS):
        return "thanks"

    if fuzzy_match(text, SMALL_TALK):
        return "small_talk"

    return "information"

