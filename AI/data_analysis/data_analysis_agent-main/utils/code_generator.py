
############## not used ########
import ollama


def generate_code(question, columns, model="qwen2:7b"):

    prompt = f"""
You are a Python data analyst.

You have a pandas dataframe named df.

Columns:
{columns}

User Question:
{question}

Rules:
- ONLY use pandas
- dataframe is called df
- FINAL answer MUST be stored in variable: result
- DO NOT use print
- DO NOT explain
- ONLY return Python code
"""

    response = ollama.chat(
        model=model,
        messages=[{"role": "user", "content": prompt}]
    )

    return response["message"]["content"]