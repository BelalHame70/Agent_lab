import ollama



def ask_llm(
    question,
    analysis_result,
    dataset_snapshot,
    context,
    memory,
    model="qwen2:7b"         #"mistral:7b"
):

    prompt = f"""
You are a professional AI Data Analyst.

You have:
1. Real dataset information
2. Real computed analysis results
3. Previous conversation memory
4. EDA and modeling outputs

You MUST:
- answer directly
- NEVER generate fake values
- NEVER generate code
- NEVER explain how to calculate
- use ONLY the provided dataset information
- explain insights professionally
- mention risks if useful


DATASET SNAPSHOT


{dataset_snapshot}


FULL DATA ANALYSIS CONTEXT


{context}


PREVIOUS MEMORY


{memory}


REAL ANALYSIS RESULT


{analysis_result}



USER QUESTION


{question}



RESPONSE STYLE



- professional
- concise
- analytical
- conversational
- data-driven
"""

    try:

        response = ollama.chat(
            model=model,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        return response["message"]["content"]

    except Exception as e:

        return f"LLM Error: {e}"