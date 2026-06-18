import ollama


def generate_final_answer(
    question,
    result,
    metadata= None
):

    prompt = f"""
You are a professional data analyst.

Question:
{question}

Analysis Result:
{result}

Write a short natural-language answer.

Rules:
- Answer directly.
- Mention the metric name if obvious.
- Round long decimals to 3 digits.
- Do not mention Python code.
- Do not explain your reasoning.
- Reply in the SAME language used by the user.
- If the question is Arabic, answer in Arabic.
- If the question is English, answer in English.
- Never translate unless asked.
- Explain the result naturally.
- Keep answers concise.
"""
    

    response = ollama.chat(
        model="qwen2:7b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response["message"]["content"]