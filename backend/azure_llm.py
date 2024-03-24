import os
import openai
from loguru import logger
from langchain_openai import AzureChatOpenAI
from langchain.schema import HumanMessage
from dotenv import load_dotenv


# Load environment variables from .env file
load_dotenv()

API_ENDPOINT = "https://allotrac-hackathon2024.openai.azure.com/"  # change this
API_VERSION = "2023-07-01-preview"
API_KEY = os.getenv("azurellm_key")


model = AzureChatOpenAI(
    openai_api_version=API_VERSION,
    azure_deployment="gpt-4",
    model_name="gpt-4",
    azure_endpoint=API_ENDPOINT,
    openai_api_key=API_KEY,
    temperature=0,
)
logger.error(model([HumanMessage(content="Tell me an american Joke")]))
