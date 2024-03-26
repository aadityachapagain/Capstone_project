import os
import openai
from loguru import logger
from langchain_openai import AzureChatOpenAI
from langchain.schema import HumanMessage


class azureLLM:
    def __init__(self, **kwargs):
        self.model = AzureChatOpenAI(
            openai_api_version=kwargs.get("api_version", "2023-07-01-preview"),
            azure_deployment=kwargs.get("api_version", "gpt-4"),
            model_name=kwargs.get("model_name", "gpt-4"),
            azure_endpoint=kwargs.get(
                "azure_endpoint", "https://allotrac-hackathon2024.openai.azure.com/"
            ),
            openai_api_key=kwargs.get("api_key"),
            temperature=kwargs.get("temperature", 0),
        )
        self.prompt_path = kwargs.get("prompt_path", "./backend/prompt.txt")

    def extract_response(self, transcribe_data):
        with open(self.prompt_path, "r") as prompt_file:
            prompt_data = prompt_file.read()
        final_prompt = transcribe_data + "\n" + prompt_data
        return self.model([HumanMessage(content=final_prompt)]).content
