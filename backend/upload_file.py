from typing import Annotated
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from loguru import logger

app = FastAPI()

@app.get("/test")
def read_root():
    return "Test Completed!!!"


@app.post("/api/user/text")
async def read_item(fileb: UploadFile = File(...)):
    byte_content = fileb.file.read()
    content = byte_content.decode("utf-8")
    return content
