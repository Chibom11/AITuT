from fastapi import FastAPI
from pydantic import BaseModel

from agent.langgraph_agent import invoke_agent 
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class UserMessage(BaseModel):
    input: str


@app.post("/get-ai-response")
def get_ai_response(data: UserMessage):
    """
    Receives user input and returns the AI agent's response.
    """
  
    response = invoke_agent(data.input)
    
   
    return {"response": response}





