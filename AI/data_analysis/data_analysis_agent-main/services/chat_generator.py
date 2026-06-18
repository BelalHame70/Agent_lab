import ollama


def generate_chat_response(question, memory):

    
    ## add memory
    memory_text = ""

    if memory:

        recent_memory = memory[-5:]

        memory_text = "\n".join(
            [
                f"User: {m['role']}\nAssistant: {m['content']}"
                for m in recent_memory
            ]
        )

    

    system_prompt = f"""
You are a conversational Data Analysis Assistant.

Conversation History:
{memory_text}

Your responsibilities:

- Handle greetings naturally.
- Handle small talk.
- Explain data analysis concepts.
- Help users understand datasets.
- Continue previous conversations when relevant.

If the user only says:
- hello
- hi
- hey
- ازيك
- السلام عليكم

Respond naturally and briefly.

Examples:

User: hello
Assistant: Hello! How can I help you analyze your data today?

User: ازيك
Assistant: الحمد لله، تمام , كيف أستطيع مساعدتك في تحليل البيانات؟

User: thanks
Assistant: You're welcome! Let me know if you'd like to explore the dataset further.


"""




    # use llm 

    response = ollama.chat(
        model="qwen2:7b",
        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": question
            }
        ]
    )

    return response["message"]["content"]