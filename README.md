# DutchDesignBot
Code for the back-end of the human creativity evaluator.

```bash
./start_chat.sh --config_file settings.yaml
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

The _level of suprise_ of the model can be done in several ways:
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
