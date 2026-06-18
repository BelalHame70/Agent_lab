from pydantic import BaseModel


class TrainRequest(BaseModel):

    agent_id: str
    file_url: str
    file_type: str 
    file_name: str 
    agent_type: str 


class AskRequest(BaseModel):

    agent_id: str
    message: str