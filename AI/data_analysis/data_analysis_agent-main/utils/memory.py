conversation_memory = []


def add_memory(question, answer):

    conversation_memory.append({
        "question": question,
        "answer": answer
    })

    # keep last 5 q
    if len(conversation_memory) > 5:
        conversation_memory.pop(0)



def get_memory_text():

    if not conversation_memory:
        return ""

    text = "\nPREVIOUS CONVERSATION:\n"

    for item in conversation_memory:
        text += f"Q: {item['role']}\n"  # question 
        text += f"A: {item['content']}\n\n"   # answer 

    return text
