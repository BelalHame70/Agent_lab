from fastapi import FastAPI

from schema import (
    TrainRequest,
    AskRequest
)

from services.trainer import train_agent
from services.asker import ask_agent

app = FastAPI()


@app.post("/train")
def train(data: TrainRequest):

    return train_agent(data.dict())


@app.post("/ask")
def ask(data: AskRequest):

    return ask_agent(data.dict())