import os
import openai
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import logging

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://kard-sandy.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

openai.api_key = os.getenv("OPENAI_API_KEY")

# Define the request body model using Pydantic
class OpenAIRequest(BaseModel):
    prompt: str
    max_tokens: int = 200

@app.get("/")
async def read_root():
    return {"message": "Welcome to the OpenAI Service API"}

# Define the POST endpoint to generate text without streaming
@app.post("/generate")
async def generate_text(request: OpenAIRequest):
    try:
        # Create a completion using the OpenAI API
        response = await openai.ChatCompletion.acreate(
            model="gpt-4o-mini",
            messages=[
                {"role": "user", "content": request.prompt}
            ],
            max_tokens=request.max_tokens,
        )
        
        # Extract the generated text from the response
        generated_text = response.choices[0].message.content

        # Return the generated text as JSON
        return {"text": generated_text}
    except Exception as e:
        logging.error(f"Error generating text: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An error occurred while generating the text: {str(e)}")