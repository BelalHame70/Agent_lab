from fastapi import FastAPI
from pydantic import BaseModel

import os
import requests

from rag import RAGEngine
from loader import smart_load
from llm import generate_answer

from langdetect import detect
from normalizer import normalize_text

from config import FALLBACK_ANSWER
from memory import ConversationMemory


app = FastAPI()




agent_memories = {}


def get_agent_memory(agent_id):

    if agent_id not in agent_memories:

        agent_memories[agent_id] = ConversationMemory(
            max_messages=10
        )

    return agent_memories[agent_id]




class TrainRequest(BaseModel):
    agent_id: str
    file_url: str
    file_type: str
    file_name: str
    agent_type: str


class ChatRequest(BaseModel):
    agent_id: str
    message: str




@app.get("/")
def home():

    return {
        "service": "Customer Support AI",
        "status": "running"
    }




@app.post("/train")
async def train_agent(request: TrainRequest):

    try:

        agent_folder = f"agents/{request.agent_id}"

        os.makedirs(agent_folder, exist_ok=True)

        dataset_path = os.path.join(
            agent_folder,
            request.file_name
        )

        # download dataset
        response = requests.get(
            request.file_url,
            timeout=60
        )

        response.raise_for_status()

        with open(dataset_path, "wb") as f:
            f.write(response.content)

        # load dataset
        chunks = smart_load(dataset_path)

        if not chunks:

            return {
                "success": False,
                "message": "No valid data found in dataset"
            }

        
        
        rag = RAGEngine()

        rag.build_index(chunks)

    
        rag.save(agent_folder)

        return {
            "success": True,
            "agent_id": request.agent_id,
            "chunks": len(chunks)
        }

    except Exception as e:

        return {
            "success": False,
            "message": str(e)
        }




@app.post("/chat")
async def chat(request: ChatRequest):

    try:

        agent_folder = f"agents/{request.agent_id}"

        if not os.path.exists(agent_folder):

            return {
                "answer": "Agent not found",
                "sources": []
            }

        # load agent
        rag = RAGEngine()

        rag.load(agent_folder)

        question = request.message

        try:

            lang = detect(question)

        except:

            lang = "en"

        normalized = normalize_text(question)

        #  memory
        memory = get_agent_memory(
            request.agent_id
        )

        memory.add_user_message(question)

        # retrieval
        retrieved = rag.retrieve_multi_query(
            normalized,
            use_expansion=True
        )

        if not retrieved:

            retrieved, confidence = rag.retrieve_with_confidence(
                normalized,
                confidence_threshold=0.10
            )

            if not retrieved:

                return {
                    "answer": FALLBACK_ANSWER.get(
                        lang,
                        FALLBACK_ANSWER["en"]
                    ),
                    "sources": []
                }

        context = "\n".join(retrieved)

        # generate answer
        answer = generate_answer(
            context,
            question,
            lang,
            memory.get_memory()
        )

        memory.add_assistant_message(
            answer
        )

        return {
            "answer": answer,
            "sources": []
        }

    except Exception as e:

        return {
            "answer": "Error",
            "error": str(e)
        }




