import os
import anthropic
from loguru import logger
from joblib import Parallel, delayed
from transformers import pipeline
from joblib import Parallel, delayed
from transformers import AutoTokenizer, AutoModelForTokenClassification
from langchain_openai import AzureChatOpenAI
from langchain.schema import HumanMessage


class aiModel:
    def __init__(self):
        self.gpt_model = gptModel()
        self.ner_model = NameEntityExtraction()
        self.summerizer_model = claudeSummarization()


class gptModel:
    def __init__(self, **kwargs):
        self.llm_model = AzureChatOpenAI(
            openai_api_version=kwargs.get("api_version", "2023-07-01-preview"),
            azure_deployment=kwargs.get("api_version", "gpt-4"),
            model_name=kwargs.get("model_name", "gpt-4"),
            azure_endpoint=kwargs.get(
                "azure_endpoint", "https://allotrac-hackathon2024.openai.azure.com/"
            ),
            openai_api_key=os.getenv("azurellm_key"),
            temperature=kwargs.get("temperature", 0),
        )
        self.prompt_path = kwargs.get("prompt_path", "./prompt.txt")

    def extract_response(self, transcribe_data):
        with open(self.prompt_path, "r") as prompt_file:
            prompt_data = prompt_file.read()
        final_prompt = transcribe_data + "\n" + prompt_data
        return self.llm_model([HumanMessage(content=final_prompt)]).content


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
        self.prompt_path = kwargs.get("prompt_path", "./summerizer_prompt.txt")

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
