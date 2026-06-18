import ollama


def classify_intent(question):

    prompt = f"""
Classify the user message.

Possible labels:

- chat
- dataset_question

Rules:

chat:
- greetings
- small talk
- thanks
- introductions
- general conversation

dataset_question:
- any question requiring dataset analysis
- statistics
- charts
- correlations
- rows
- columns
- sales
- business insights

Message:
{question}

Return ONLY one label.
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

    return response["message"]["content"].strip().lower()