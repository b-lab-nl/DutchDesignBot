# main.py

import os
import yaml
import sqlite3
from datetime import datetime
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import base64
from elevenlabs.client import ElevenLabs, AsyncElevenLabs
import logging

# make logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


# Load environment variables and settings
load_dotenv('../.env')
with open('../settings.yaml', 'r') as f:
    settings = yaml.safe_load(f)


logger.info(f"Setting OpenAI KEY")
OpenAIClient = OpenAI(api_key=os.getenv('LLM_OAI_KEY'))
logger.info(f"Setting Elevenlabs KEY")
ElevenClient = ElevenLabs(api_key=os.getenv('STT_EL_KEY'))  # Get ElevenLabs API key


# Initialize FastAPI app
# Configure CORS
origins = [
    "http://localhost:3000",  # Frontend origin
    # Add other allowed origins if needed
]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["*"],
)

# Database setup
logger.info(f"Making SQL Lite")
conn = sqlite3.connect('answers.db', check_same_thread=False)
cursor = conn.cursor()
cursor.execute('''
    CREATE TABLE IF NOT EXISTS answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        datetime TEXT,
        challenge TEXT,
        solution TEXT,
        pre_filled TEXT
    )
''')
conn.commit()

# Request model
class EvaluationRequest(BaseModel):
    challenge: str
    solution: str
    pre_filled: bool
    attempt_number: int

# API endpoint for evaluation
@app.post('/api/evaluate')
def evaluate(request: EvaluationRequest):
    # Store the user's response
    logger.info(f"Received request: {request}")

    cursor.execute('''
        INSERT INTO answers (datetime, challenge, solution, pre_filled)
        VALUES (?, ?, ?, ?)
    ''', (datetime.now().isoformat(), request.challenge, request.solution, 'yes' if request.pre_filled else 'no'))
    conn.commit()

    # Determine originality
    originality = check_originality(request.solution)

    # Generate bot response
    if request.pre_filled or not originality:
        bot_response = generate_sarcastic_response(request.challenge, request.solution)
    else:
        bot_response = generate_positive_response(request.challenge, request.solution)

    # Generate audio using ElevenLabs
    audio_base64 = generate_audio(bot_response)

    return {'bot_response': bot_response, 'audio_base64': audio_base64}

def check_originality(solution):
    # Check for previous solutions in the database
    cursor.execute('SELECT solution FROM answers')
    previous_solutions = [row[0].lower() for row in cursor.fetchall()]
    if solution.lower() in previous_solutions:
        return False
    # Additional originality checks can be added here
    return True

def generate_sarcastic_response(challenge, solution):
    prompt = f"You have selected {challenge} as the problem. Your suggested solution is {solution}.\n\nBot: Oh, how original. Another '{solution}' to solve '{challenge}'. Haven't heard that before."
    response = OpenAIClient.chat.completions.create(
        model=settings['llm']['model'],
        messages=[
            {"role": "system", "content": settings['llm']['system']},
            {"role": "user", "content": prompt}
        ],
        max_tokens=settings['llm']['max_tokens']
    )
    return response.choices[0].message.content.strip()

def generate_positive_response(challenge, solution):
    prompt = f"You have selected {challenge} as the problem. Your suggested solution is {solution}.\n\nBot: Impressive! That's a novel approach to '{challenge}'. Well done!"
    response = OpenAIClient.chat.completions.create(
        model=settings['llm']['model'],
        messages=[
            {"role": "system", "content": settings['llm']['system']},
            {"role": "user", "content": prompt}
        ],
        max_tokens=settings['llm']['max_tokens']
    )
    return response.choices[0].message.content.strip()

def generate_audio(text):
    audio = ElevenClient.generate(
        text=text,
        voice=settings['tts']['voice'],
        model=settings['tts']['model']
        )
    audio_bytes = b''.join(audio)
    # Encode audio to base64 string
    audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
    return audio_base64


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=1232)