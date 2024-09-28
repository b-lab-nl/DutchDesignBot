# DutchDesignBot

The Dutch Design Bot is part of an exhibition on the Dutch Design Week. The setup is basically:
* the user walks into in the setup, a closed of booth with a screen, a keyboard and mouse
* the user sees a minimalistic interface with two carrousels, one displaying a list of challenges, one displaying a list of solutions, with the option to manually enter a solution
* after a selecting both challenge/solution the combination is evaluated or originality and the user is talked to by bot, using ElevenLabs/OpenAI API's. 


# Interface 
* Black background with matrix green letters in robotic font
* Portrait format
* Top-bar: moving carrousel with world problems: climate change, environmental destruction, energy shortage, water shortage, inequality, world hunger, rise of fascism, loss of privacy, rogue AGI, loss of privacy
  * carrousel stops on mouse-over, with glow surrounding the text-box
  * on click; challenge is selected. carrousel stays frozen.
  * if there is no click and mouse moves out of focus, carrousel starts moving again
* Bottom-bar: moving carrousel with solutions, depending on the challenge: invest in renewables,..., fill in your idea
  * carrousel stops on mouse-over, with glow surrounding the text-box
  * on click; solution is selected. carrousel stays frozen.
  * if there is no click and mouse moves out of focus, carrousel starts moving again
* Central div: should contain a glowing, static Lissajous figure with shades of grey/white
  * if both the challenge and the solution are selected, the lissajouse figure starts morphing.
* if the challenge and solution are selected. A bot voice says: "You have selected {challenge} as the problem of your choice. Your suggested solution is {solution}"
* With some delay; the bot responds with an evaluation, whether it finds the solution original given the challenge.
  * if it is deemed as original, points are given to this user and the screens starts blinking. The bot responds by showing respect for the great human brain it just encountered
  * if it is deemed as not original, the bot responds in a sarcastic tone.
    * the user can use the pre-selected solutions twice, both times the bot will respond negatively, after which the user HAS to write a manual solution
    * if the user responds with a manual solution and it is deemed not original, the menu resets.


# Functionality
* timeout if no response, reset to original menu with the moving carrousels and the lissajous figure
* the user get's maximum 2 attempts with the pre-filled options
  * of 2 attempts are reached, user has to manually fill-in the solution
* all answers are stored in SQLlite as datetime, challenge, solution, pre-filled (yes/no)
* Sarcastic bot response if: 
  * if the user manually fills in an answer that is part of the pre-filled option
  * if the user selects any pre-filled option
  * if the manually filled in answer that is _not original_: e.g. using a distance metric based on SBERT with respect to the previous answers (that are in SQLlite)

# Technically

We use an API that receives a dictionary with:
* challenge: e.g. hurricanes, food shortage, global warming, privacy loss, environmental catastrophy
* solution: e.g. storm umbrella's
* pre_filled: no
* attempt_number: 2

* The interface is written in **REACT**.
* The API that interfaces with the frontend script, and with the LLM/TTS/STT providers is written in FastAPI/Python


To start the service run:

```bash
poetry install

cd frontend
npm install
npm start

cd ../backend
./start_chat.sh --config_file ../settings.yaml
```

with a ```settings.yaml``` like

```yaml
port: 1232
llm:
  provider: openai
  model: gpt4o_mini
tts:
  provider: elevenlabs
  voice: david
stt:
  provider: whisper
prompts:
  system: Lorem ipsum
```

with the API keys in an .env file
```
LLM_OAI_KEY=xxx
STT_EL_KEY=xxx
```

Now the app will be available on ```localhost:3000```


The _level of surprise_ of the model can be done in several ways:
- 'ask it': _are you surprised by the response, please indicate how suprised you are by select one of N surprise levels..._
- 'measure it': take document embeddings of the answers it does expect, and extract the distance from the users answer -> this translate this to a score requires the availability of positives/negatives.
- simulate it: in principle we can force the model to give a certain answer, which would be the answer of the user. We can then compare the total relative probability of the generated tokens with


The base prompt-template to extract the "surprise" is 
```python
QUEST_PROBLEM = "zoonosis"
QUEST_PROBLEM_DESCRIPTION = """Humans are over-exploiting the animal kingdom in search for proteins, minerals and for the satisfaction of ancient old superstitions.
This over-exploitation leads to dangerous zoonoses like Covid19, it can lead to collapsing food chains, to barren infertile soil, to reduced biodiversity and it depends on massive suffering of animals.  
"""
SOLUTION_SUGGESTION = "eat less animals"

base_template = f"""We are about to embark on a mission to save the planet from a grave danger. We are to solve the {QUEST_PROBLEM} crisis.
The {QUEST_PROBLEM} crisis is described as follows: {QUEST_PROBLEM_DESCRIPTION}.

Our proposed solution is: {SOLUTION_SUGGESTION}"""
```
