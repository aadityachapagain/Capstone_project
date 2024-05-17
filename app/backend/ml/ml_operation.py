import os
import anthropic
from loguru import logger
from joblib import Parallel, delayed
from transformers import pipeline
from retry import retry
from joblib import Parallel, delayed
from transformers import AutoTokenizer, AutoModelForTokenClassification
from openai import OpenAI
from dotenv import load_dotenv


# Load environment variables from .env file
load_dotenv()


class aiModel:
    def __init__(self):
        self.gpt_model = gptModel()
        self.ner_model = NameEntityExtraction()
        self.summerizer_model = claudeSummarization()


class gptModel:
    def __init__(self, **kwargs):
        self.llm_model = OpenAI(api_key=os.getenv("llm_key"))
        self.prompt_path = kwargs.get("prompt_path", "./backend/ml/prompt.txt")

    @retry(Exception, tries=4, delay=2)
    def extract_response(self, transcribe_data):
        with open(self.prompt_path, "r") as prompt_file:
            prompt_data = prompt_file.read()
        final_prompt = transcribe_data + "\n" + prompt_data
        try:
            response = self.llm_model.chat.completions.create(
                model="gpt-4", messages=[{"role": "system", "content": final_prompt}]
            )
            logger.info(response.choices[0].message.content)
            json_response = eval(response.choices[0].message.content)
            return json_response
        except Exception as e:
            logger.error(f"{e} found!!!")
            raise Exception


class NameEntityExtraction:
    def __init__(self):
        self.tokenizer = AutoTokenizer.from_pretrained("dslim/bert-base-NER")
        self.model = AutoModelForTokenClassification.from_pretrained(
            "dslim/bert-base-NER"
        )
        self.infer_ner = pipeline("ner", model=self.model, tokenizer=self.tokenizer)

    def extract_names(self, data):
        splitted_data = data.split("\n")
        ner_result = Parallel(n_jobs=6, backend="threading")(
            delayed(self.infer_ner)(lines) for lines in splitted_data
        )
        ner_result = sum(ner_result, [])
        ner_person = filter(lambda x: x.get("entity") == "B-PER", ner_result)
        unique_person = set(map(lambda x: x.get("word"), ner_person))
        return self.drop_random_names(list(unique_person))

    def drop_random_names(self, unique_person):
        bad_names = ["Con"]
        return list(filter(lambda x: x not in bad_names, unique_person))


class claudeSummarization:
    def __init__(self, **kwargs):
        self.model = anthropic.Anthropic(api_key=os.getenv("claude_token"))
        self.prompt_path = kwargs.get(
            "prompt_path", "./backend/ml/summerizer_prompt.txt"
        )

    def extract_summary(self, transcript):
        with open(self.prompt_path, "r") as prompt_file:
            prompt_data = prompt_file.read()
        message = self.model.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=4096,
            temperature=0.2,
            system=prompt_data,
            messages=[
                {"role": "user", "content": [{"type": "text", "text": transcript}]}
            ],
        )
        if message.content[0].text.split("\n\n")[-1]:
            return message.content[0].text.split("\n\n")[-1]
        return message.content[0].text
