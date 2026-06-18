"""""
from openai import OpenAI
from config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)

def rewrite_query(question: str, lang: str) -> str:
    system_prompt = (
        "Rewrite the user's question into a clear, formal FAQ-style question "
        "that could exist in a customer support dataset. "
        "Do NOT answer the question. "
        "Do NOT add new information. "
        "Return ONLY the rewritten question."
    )

    if lang == "ar":
        system_prompt += " Rewrite in Arabic."

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        temperature=0,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question}
        ]
    )

    return response.choices[0].message.content.strip()
"""""

import ollama
from config import MODEL_NAME, TEMPERATURE

client = ollama.Client()


def rewrite_query(question: str, lang: str) -> str:
    """
    # rewrite a user's question using ollama.
    """
    system_prompt = (
        "Rewrite the user's question into a clear, formal FAQ-style question "


        "that could exist in a customer support dataset. "


        "Do NOT answer the question. "

        "Do NOT add new information. "


        "Return ONLY the rewritten question."
    )



    if lang == "ar":
        system_prompt += " Rewrite in Arabic."

    prompt = f"{system_prompt}\nOriginal question: {question}"



    response = client.generate(
        model=MODEL_NAME,
        prompt=prompt,
        options={"temperature": 0}  # deterministic rewriting
    )



    return response["response"].strip() if isinstance(response, dict) else str(response)
