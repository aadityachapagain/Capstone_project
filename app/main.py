# from typing import Annotated
import os
import uuid
import json
import urllib.parse
import gridfs
import datetime
from bson import ObjectId
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from loguru import logger
from backend.ml_operation import aiModel
from fastapi.middleware.cors import CORSMiddleware
from database.manage_db import compassDB

from dotenv import load_dotenv


# Load environment variables from .env file
load_dotenv()

# Now you can access the environment variables using os.getenv()
username = urllib.parse.quote_plus(os.getenv("db_username"))
password = urllib.parse.quote_plus(os.getenv("db_password"))

app = FastAPI()
# Initialize the mongoDB
db_obj = compassDB(username=username, password=password)
# InitializeLLM
model_obj = aiModel()

origins = ["http://localhost", "http://localhost:3000", "http://localhost:3000/"]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.get("/test")
def read_root():
    return "Test Completed!!!"


@app.post("/api/user/upload")
async def read_item(fileb: UploadFile = File(...)):
    # test wether filename is txt or not
    if fileb.filename.split(".")[-1] != "txt":
        return HTTPException(status_code=405, detail="Item not found")
    byte_content = fileb.file.read()
    # log timstamp
    timestamp = datetime.datetime.now()
    # Load File into GridFS System
    # Load file into MongoDb and extract a token
    filedb = db_obj.db_client.compass_filedb
    grid_fs = gridfs.GridFS(filedb)
    db_token = grid_fs.put(byte_content, filename=fileb.filename)
    # Add person involved in the meeting
    attendees = model_obj.ner_model.extract_names(byte_content.decode())
    # Extract Summary from the transcribe
    summary = model_obj.summerizer_model.extract_summary(byte_content.decode())
    # load filename and db_token in Database compass_db on collection called file_collection
    db_obj.add_document(
        database="compass_db",
        collection="file_collection",
        json_data={
            "id_": str(db_token),
            "filename": fileb.filename,
            "attendees": ",".join(attendees),
            "source": "transcription",
            "summary": summary,
            "datetime": str(timestamp),
            "status": "In progress",
        },
    )
    return str(db_token)


@app.get("/api/get/filelist")
async def read_item():
    new_val = []
    for value in db_obj.db_client.compass_db.file_collection.find():
        new_val.append(
            {
                "id": value["id_"],
                "filename": value["filename"],
                "attendees": value.get("attendees"),
                "source": value.get("source"),
                "summary": value.get("summary"),
                "datetime": value.get("datetime"),
                "status": value.get("status"),
            }
        )
    return new_val


@app.get("/api/get/mindmap")
async def get_item(transcript_id: str):
    mindmap_response = db_obj.query_document(
        database="compass_db",
        collection="mindmap",
        query={"transcript_id": transcript_id},
    )
    if mindmap_response.get("data", {}):
        json_data = jsonable_encoder(mindmap_response.get("data", {}))
        return JSONResponse(content=json_data)
    logger.info("JSON Not found in DB!!!")
    filedb = db_obj.db_client.compass_filedb
    if db_obj.query_document(
        database="compass_db",
        collection="mindmap",
        query={"transcript_id": transcript_id},
    ):
        return db_obj.query_document(
            database="compass_db",
            collection="mindmap",
            query={"transcript_id": transcript_id},
        )
    grid_fs = gridfs.GridFS(filedb)
    data_obj = grid_fs.get(ObjectId(transcript_id))
    str_data = data_obj.read().decode()
    json_response = eval(model_obj.gpt_model.extract_response(transcribe_data=str_data))
    db_obj.add_document(
        database="compass_db",
        collection="mindmap",
        json_data={"transcript_id": transcript_id, "data": json_response},
    )
    db_obj.update_document(
        database="compass_db",
        collection="file_collection",
        query={"id_": transcript_id},
        updated_value={"$set": {"status": "Completed"}},
    )
    json_data = jsonable_encoder(json_response)
    return JSONResponse(content=json_data)
