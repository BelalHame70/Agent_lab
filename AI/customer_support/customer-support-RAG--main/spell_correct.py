## try api
""""
from openai import OpenAI
from config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)

def correct_query(text):
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        temperature=0,
        messages=[
            {
                "role": "system",
                "content": (
                    "Correct spelling mistakes only. "
                    "Do NOT change meaning. "
                    "Return ONLY the corrected sentence."
                )
            },
            {"role": "user", "content": text}
        ]
    )
    return response.choices[0].message.content.strip()

    """


from rapidfuzz import process

def correct_query(text: str, vocabulary=None):
    
    # spell correction using fuzzy matching.
    
    if not vocabulary:
        return text

    words = text.split()
    corrected = []

    for w in words:
        match = process.extractOne(w, vocabulary, score_cutoff=85)
        corrected.append(match[0] if match else w)

    return " ".join(corrected)

