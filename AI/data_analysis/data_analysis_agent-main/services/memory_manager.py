import json
import os


def load_memory(agent_id):

    path = f"agents/{agent_id}/memory.json"

    if not os.path.exists(path):
        return []

    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

""""
def save_memory(agent_id, memory):

    path = f"agents/{agent_id}/memory.json"

    with open(path, "w", encoding="utf-8") as f:
        json.dump(
            memory,
            f,
            indent=2
        )

""" 
## folder exsist
def save_memory(agent_id, memory):

    folder = f"agents/{agent_id}"

    os.makedirs(folder, exist_ok=True)

    path = f"{folder}/memory.json"

    with open(path, "w", encoding="utf-8") as f:
        json.dump(
            memory,
            f,
            indent=2,
            ensure_ascii=False
        )

def add_message(agent_id, role, content):

    memory = load_memory(agent_id)

    memory.append({
        "role": role,
        "content": content
    })

    memory = memory[-10:]

    save_memory(agent_id, memory)