import os
from loguru import logger
from dotenv import load_dotenv


# Load environment variables from .env file
load_dotenv()

# Now you can access the environment variables using os.getenv()
llm_token = os.getenv("claude_token")
import anthropic

with open("./Prompt-network_graph.txt") as txt_file:
    prompt = txt_file.read()
client = anthropic.Client(api_key=llm_token)

message = client.messages.create(
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": prompt,
        }
    ],
    model="claude-3-opus-20240229",
)
print(message.content)

