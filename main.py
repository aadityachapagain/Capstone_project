# from typing import Annotated
import os
import uuid
import json
import urllib.parse
import gridfs
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from loguru import logger
from backend.claude_llm import llmModel

from database.manage_db import compassDB

from dotenv import load_dotenv


# Load environment variables from .env file
load_dotenv()

# Now you can access the environment variables using os.getenv()
username = urllib.parse.quote_plus(os.getenv("db_username"))
password = urllib.parse.quote_plus(os.getenv("db_password"))

app = FastAPI()
llm_model = llmModel()
# Initialize the mongoDB
db_obj = compassDB(username=username, password=password)


@app.get("/test")
def read_root():
    return "Test Completed!!!"


@app.post("/api/user/upload")
async def read_item(fileb: UploadFile = File(...)):
    # test wether filename is txt or not
    if fileb.filename.split(".")[-1] != "txt":
        return HTTPException(status_code=405, detail="Item not found")
    byte_content = fileb.file.read()
    # Testing for now
    with open("./backend/final_data.json", "r") as jsn:
        json_data = json.load(jsn)
    # Load File into GridFS System
    # Load file into MongoDb and extract a token
    filedb = db_obj.db_client.compass_filedb
    grid_fs = gridfs.GridFS(filedb)
    db_token = grid_fs.put(byte_content, filename=fileb.filename)
    logger.error(db_token)
    # load filename and db_token in Database compass_db on collection called file_collection
    db_obj.add_collection(
        database="compass_db",
        collection="file_collection",
        json_data={"id_": str(db_token), "filename": fileb.filename},
    )
    return str(db_token)


@app.get("/api/get/filelist")
async def read_item():
    new_val = []
    for value in db_obj.db_client.compass_db.file_collection.find():
        new_val.append({"id": value["id_"], "filename": value["filename"]})
    return new_val
