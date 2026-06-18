import ollama
from config import MODEL_NAME, TEMPERATURE

client = ollama.Client()


def translate_ar_to_en(text):
    """
    Translate Arabic text to English using Ollama.
    """
    prompt = f"""
Translate the following Arabic text to English. 
Return ONLY the translation.

Arabic text:
{text}
"""

    response = client.generate(
        model=MODEL_NAME,
        prompt=prompt,
        options={"temperature": 0}  # deterministic translation
    )

    # Ollama returns the response text
    return response["response"].strip() if isinstance(response, dict) else str(response)
