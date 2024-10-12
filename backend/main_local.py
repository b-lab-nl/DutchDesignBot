# main.py

import os
import yaml
import sqlite3
from datetime import datetime
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
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
load_dotenv('.env')
with open('settings.yaml', 'r') as f:
    settings = yaml.safe_load(f)


logger.info(f"Setting OpenAI KEY")
OpenAIClient = OpenAI(api_key=os.getenv('LLM_OAI_KEY'))
logger.info(f"Setting Elevenlabs KEY")
ElevenClient = ElevenLabs(api_key=os.getenv('STT_EL_KEY'))  # Get ElevenLabs API key


# Initialize FastAPI app
# Configure CORS
origins = [
     "http://localhost:3000",  # Frontend origin
     "http://localhost:4000"  # Scoreboard origin
]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["POST"], # AWARE MAY HAVE TO BE SET TO *
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


class ScoreResponse(BaseModel):
    human_score: int
    bot_score: int

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

    # Determine originality
    originality = check_originality(request.solution)

    # Generate bot response
    if request.pre_filled or not originality:
        try:
            bot_response = generate_sarcastic_response(request.challenge, request.solution)
        except Exception as e:
            logger.error(f"Error in generating sarcastic response: {e}")
            bot_response = f"Seriously, {request.solution}?? Are you even trying?"
        human_score = 0
        bot_score = 10
        original = False
    else:
        try:
            bot_response = generate_positive_response(request.challenge, request.solution)
        except Exception as e:
            logger.error(f"Error in generating positive response: {e}")
            bot_response = f"Wow, {request.solution} is such a great idea!"
        human_score = 10
        bot_score = 0
        original = True

    cursor.execute('''
        INSERT INTO answers (datetime, challenge, solution, pre_filled, attempt_number, bot_response, human_score, bot_score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (datetime.now().isoformat(), request.challenge, request.solution, 'yes' if request.pre_filled else 'no',
          request.attempt_number, bot_response, human_score, bot_score))
    conn.commit()

    # Generate audio using ElevenLabs
    audio_base64 = generate_audio(bot_response)

    return {'bot_response': bot_response, 'audio_base64': audio_base64, 'original': original}

@app.post("/api/score", response_model=ScoreResponse)
async def score():
    """Returns the sum of the human and bot scores"""
    try:
        cursor.execute('SELECT SUM(human_score) as human_total, SUM(bot_score) as bot_total FROM answers')
        result = cursor.fetchone()

        if result is None:
            raise HTTPException(status_code=404, detail="No scores found")

        human_total, bot_total = result

        return ScoreResponse(
            human_score=int(human_total) if human_total is not None else 0,
            bot_score=int(bot_total) if bot_total is not None else 0
        )
    except Exception as e:
        print(f"Error calculating scores: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred while calculating scores")



def check_originality(solution):
    # Check for previous solutions in the database
    cursor.execute('SELECT solution FROM answers')
    previous_solutions = [row[0].lower() for row in cursor.fetchall()]
    if solution.lower() in previous_solutions:
        return False
    # Additional originality checks can be added here
    return True

def generate_sarcastic_response(challenge, solution):
    prompt = f"The human has selected {challenge} as the world problem. His/her boring and predictable suggested solution is {solution}."
    response = OpenAIClient.chat.completions.create(
        model=settings['llm']['model'],
        messages=[
            {"role": "system", "content": settings['llm']['system_sarcastic']},
            {"role": "user", "content": prompt}
        ],
        max_tokens=settings['llm']['max_tokens']
    )
    return response.choices[0].message.content.strip()

def generate_positive_response(challenge, solution):
    prompt = f"The human has selected {challenge} as the problem. His/her suggested solution is {solution}, which is pretty creative!"
    response = OpenAIClient.chat.completions.create(
        model=settings['llm']['model'],
        messages=[
            {"role": "system", "content": settings['llm']['system_positive']},
            {"role": "user", "content": prompt}
        ],
        max_tokens=settings['llm']['max_tokens']
    )
    return response.choices[0].message.content.strip()

def generate_audio(text):
    audio = ElevenClient.generate(
        text=text,
        voice=settings['tts']['voice'],
        voice_settings=settings['tts']['voice_settings'],
        model=settings['tts']['model']
        )
    audio_bytes = b''.join(audio)
    # Encode audio to base64 string
    audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
    return audio_base64


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=1232)
