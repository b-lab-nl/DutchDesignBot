# main.py

import os
import yaml
import sqlite3
from datetime import datetime
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
import openai
import base64
from elevenlabs import generate  # Import generate function

# Load environment variables and settings
load_dotenv()
with open('settings.yaml', 'r') as f:
    settings = yaml.safe_load(f)

openai.api_key = os.getenv('LLM_OAI_KEY')
elevenlabs_api_key = os.getenv('STT_EL_KEY')  # Get ElevenLabs API key

# Initialize FastAPI app
app = FastAPI()

# Database setup
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
    response = openai.Completion.create(
        engine=settings['llm']['model'],
        prompt=prompt,
        max_tokens=50
    )
    return response.choices[0].text.strip()

def generate_positive_response(challenge, solution):
    prompt = f"You have selected {challenge} as the problem. Your suggested solution is {solution}.\n\nBot: Impressive! That's a novel approach to '{challenge}'. Well done!"
    response = openai.Completion.create(
        engine=settings['llm']['model'],
        prompt=prompt,
        max_tokens=50
    )
    return response.choices[0].text.strip()

def generate_audio(text):
    audio = generate(
        text=text,
        voice=settings['tts']['voice'],
        api_key=elevenlabs_api_key
    )
    # Encode audio to base64 string
    audio_base64 = base64.b64encode(audio).decode('utf-8')
    return audio_base64
