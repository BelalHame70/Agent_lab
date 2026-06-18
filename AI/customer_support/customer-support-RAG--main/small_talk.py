import ollama
from config import MODEL_NAME

def conversational_reply(user_input: str, lang: str) -> str:
    system_prompt = (
        "You are a polite customer support assistant. "
        "Respond briefly and friendly. "
        "Do NOT provide factual information."
    )

    response = ollama.chat(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_input}
        ],
        options={"temperature": 0.6}
    )

    return response["message"]["content"].strip()
