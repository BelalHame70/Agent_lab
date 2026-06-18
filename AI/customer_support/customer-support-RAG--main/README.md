Customer Support AI Agent (RAG-Based)

A customizable AI customer support system built using **Retrieval-Augmented Generation (RAG)**.  
The system allows creating multiple customer support agents, each with its own knowledge base, vector index, and conversation memory.

The project uses **FastAPI** as the backend API and combines semantic search with LLM generation to provide accurate answers based only on uploaded documents.


 # Features

- Multi-agent customer support system
- Each agent has:
  - Separate knowledge base
  - Separate FAISS vector index
  - Separate conversation memory

- RAG pipeline:
  - Document loading
  - Text chunking
  - Embedding generation
  - Vector search
  - Context-based answer generation

- Supports:
  - PDF datasets
  - CSV FAQ datasets

- Multilingual support:
  - English
  - Arabic

- Arabic text processing:
  - Normalization
  - Query expansion
  - Similar meaning retrieval

- Hybrid retrieval:
  - Semantic embeddings
  - Keyword-based retrieval

- Hallucination control:
  - Answers only from retrieved context
  - Fallback response when information is missing


  


# Technologies Used

## Backend

- Python
- FastAPI
- Uvicorn

## AI / NLP

- Sentence Transformers
- FAISS
- Ollama
- qwen

## Data Processing

- PyPDF
- Pandas
- Custom chunking pipeline

## Deployment

- Docker
- Hugging Face Spaces



# how it works 

1- create environment 
python -m venv venv

2- activate 
venv\Scripts\activate


3- download ollama from
https://ollama.com/download

4- pull qwen 
open CMD 
ollama pull qwen2:7b

5- download requirememts 
pip install -r requirements.txt

6- start server 
uvicorn main:app --reload

7- open 
http://127.0.0.1:8000/docs 







