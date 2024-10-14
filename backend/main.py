# main.py

import os
import yaml
import sqlite3
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import psycopg2
from datetime import datetime
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from openai import OpenAI
from anthropic import Anthropic, HUMAN_PROMPT, AI_PROMPT
from fuzzywuzzy import fuzz

import base64
from elevenlabs.client import ElevenLabs, AsyncElevenLabs
import logging
import argparse

import numpy as np
from typing import Tuple

# make logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables and settings
load_dotenv('.env')
with open('settings.yaml', 'r') as f:
    settings = yaml.safe_load(f)

logger.info(f"Setting OpenAI KEY")
OpenAIClient = OpenAI(api_key=os.getenv('LLM_OAI_KEY'))
AnthropicClient = Anthropic(api_key=os.getenv('LLM_ANTHROPIC_KEY'))

logger.info(f"Setting Elevenlabs KEY")
ElevenClient = ElevenLabs(api_key=os.getenv('STT_EL_KEY'))  # Get ElevenLabs API key


# Initialize FastAPI app
# Configure CORS
origins = [
     "https://dutchdesignbot-ux.netlify.app", # "http://localhost:3000",  # Frontend origin
     "https://dutchdesignbot-scoreboard.netlify.app" #"http://localhost:4000"  # Scoreboard origin
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
FUZZY_THRESHOLD = settings['originality']['fuzzy_threshold']
DATABASE_USER = os.environ.get("DATABASE_USER")
DATABASE_URL = os.environ.get("DATABASE_URL")
DATABASE_NAME = os.environ.get('DATABASE_NAME')
INSTANCE_CONNECTION_NAME = os.environ.get('INSTANCE_CONNECTION_NAME')
DATABASE_PASSWORD = os.environ.get("DATABASE_PASSWORD")
DATABASE_URL = f"postgresql://{DATABASE_USER}:{DATABASE_PASSWORD}@/{DATABASE_NAME}?host=/cloudsql/{INSTANCE_CONNECTION_NAME}"

DATA_LOCALE = 'gc'
try:
    logger.info(f"Making/connecting to Postgresql")
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    # check if answers table exists
    # if not, create it
    cursor.execute('''CREATE TABLE IF NOT EXISTS answers (
        id SERIAL PRIMARY KEY,
        datetime TEXT,
        challenge TEXT,
        solution TEXT,
        pre_filled TEXT,
        attempt_number INTEGER,
        bot_response TEXT,
        human_score INTEGER,
        bot_score INTEGER
    )''')
    conn.commit()

except:
    logger.error(f"Error in connecting to Postgresql, falling back to SQLite3")
    logger.info(f"Making SQL Lite")
    conn = sqlite3.connect('answers.db', check_same_thread=False)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            datetime TEXT,
            challenge TEXT,
            solution TEXT,
            pre_filled TEXT,
            attempt_number INTEGER,
            bot_response TEXT,
            human_score INTEGER,
            bot_score INTEGER
        )
    ''')
    conn.commit()
    DATA_LOCALE = 'local'


class ScoreResponse(BaseModel):
    human_score: int
    bot_score: int

# Request model
class EvaluationRequest(BaseModel):
    challenge: str
    solution: str
    pre_filled: bool
    attempt_number: int

class SoundRequest(BaseModel):
    textsnippet: str
    positive: bool

# API endpoint for evaluation
@app.post('/api/evaluate')
def evaluate(request: EvaluationRequest):
    # Store the user's response
    logger.info(f"Received request: {request}")

    # Determine originality
    originality, ogscore = check_originality(request.solution)

    # Generate bot response
    if request.pre_filled or not originality:
        try:
            bot_response = generate_sarcastic_response(request.challenge, request.solution)
        except Exception as e:
            logger.error(f"Error in generating sarcastic response: {e}")
            bot_response = f"Seriously, {request.solution}?? Are you even trying?"
        human_score = 0
        bot_score = 100
        original = False
    else:
        try:
            bot_response = generate_positive_response(request.challenge, request.solution)
        except Exception as e:
            logger.error(f"Error in generating positive response: {e}")
            bot_response = f"Wow, {request.solution} is such a great idea!"
        human_score = 100
        bot_score = 0
        original = True

    try:
        cursor.execute('''
            INSERT INTO answers (datetime, challenge, solution, pre_filled, attempt_number, bot_response, human_score, bot_score)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ''', (datetime.now().isoformat(), request.challenge, request.solution, 'yes' if request.pre_filled else 'no',
            request.attempt_number, bot_response, human_score, bot_score))
        conn.commit()
    except Exception as e:
        logger.error(f"Error in storing the answer in the {DATA_LOCALE} database:{e}")

    # Generate audio using ElevenLabs
    audio_base64 = generate_audio(bot_response, positive=human_score > 0)

    return {'bot_response': bot_response, 'audio_base64': audio_base64, 'original': original, 'ogscore': ogscore}

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

@app.post("/api/sound")
async def sound(request: SoundRequest):
    # return the audio base64 string for the given text snippet
    audio_base64 = generate_audio(request.textsnippet)
    return {'audio_base64': audio_base64}

def check_originality(solution)->Tuple[bool,int]:
    # Check for previous solutions in the database
    cursor.execute('SELECT UNIQUE(solution) FROM answers')
    previous_solutions = [row[0].lower() for row in cursor.fetchall()]
    if solution.lower() in previous_solutions:
        return False, np.random.randint(10, 30)
    # use fuzzywuzzy matching to check for similarity
    boringscores = []
    for prev_solution in previous_solutions:
        boringscore = fuzz.ratio(solution.lower(), prev_solution)
        boringscores.append(boringscore)
        if boringscore > FUZZY_THRESHOLD:
            return False, 100-boringscore
    # Additional originality checks can be added here
    # BE AWARE
    # return True, 100-max(boringscores) is saver..
    return True, 100-round(sum(boringscores)/(len(boringscores)+1))

def generate_sarcastic_response(challenge, solution):
    prompt = f"I have selected {challenge} as the world problem. My boring and predictable suggested solution is {solution}."
    try:
        response = OpenAIClient.chat.completions.create(
            model=settings['llm']['model'],
            temperature=settings['llm']['temperature'],
            messages=[
                {"role": "system", "content": settings['llm']['system_sarcastic']},
                {"role": "user", "content": prompt}
            ],
            max_tokens=settings['llm']['max_tokens']
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Error in generating sarcastic response using OpenAI: {e}, falling back to Anthropic")
        response = AnthropicClient.messages.create(
            max_tokens=settings['anthropic']['max_tokens'],
            temperature=settings['anthropic']['temperature'],
            system=settings['llm']['system_sarcastic'],
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="claude-3-5-sonnet-20240620",
            )
        return response.content[0].strip()


def generate_positive_response(challenge, solution):
    prompt = f"I have selected {challenge} as the problem. my amazing solution is {solution}, which is pretty creative!"
    try:
        response = OpenAIClient.chat.completions.create(
            model=settings['llm']['model'],
            temperature=settings['llm']['temperature'],
            messages=[
                {"role": "system", "content": settings['llm']['system_positive']},
                {"role": "user", "content": prompt}
            ],
            max_tokens=settings['llm']['max_tokens']
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Error in generating sarcastic response using OpenAI: {e}, falling back to Anthropic")
        response = AnthropicClient.messages.create(
            max_tokens=settings['anthropic']['max_tokens'],
            temperature=settings['anthropic']['temperature'],
            system=settings['llm']['system_positive'],
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="claude-3-5-sonnet-20240620",
            )
        return response.content[0].strip()
def generate_audio(text, positive=False):
    if positive:
        settings['tts']['voice_settings']['exaggeration'] = 0.4
        settings['tts']['voice_settings']['stability'] = 0.2
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
    # parse --local argument, if present, run the server locally
    PORT = 8080
    parser = argparse.ArgumentParser()
    parser.add_argument("--local", help="run the server locally", action="store_true")
    args = parser.parse_args()
    if args.local:
        PORT = 1232

    uvicorn.run(app, host="0.0.0.0", port=PORT, log_level="debug")
