# from typing import Annotated
import os
import shutil
import urllib.parse
import gridfs
import datetime
from bson import ObjectId
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse, FileResponse
from loguru import logger
from backend.ml.ml_operation import aiModel
from fastapi.middleware.cors import CORSMiddleware
from backend.database.manage_db import compassDB
from backend.audio.process_audio import processAudio
from mangum import Mangum
import traceback
from dotenv import load_dotenv
import json

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
# Initialize Audio
audio_obj = processAudio()
# initialize file storage
# upload_txtObj = uploadFile(db=db_obj.db_client.compass_filedb)
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
    try:
        if fileb.filename.split(".")[-1] == "json":
            # byte_content = b'JSON without transcribe'
            timestamp = datetime.datetime.now()
            # Load File into GridFS System
            # Load file into MongoDb and extract a token
            filedb = db_obj.db_client.compass_filedb
            encoded_json = fileb.file.read()
            grid_fs = gridfs.GridFS(filedb)
            db_token = grid_fs.put(encoded_json, filename=fileb.filename)

            # load filename and db_token in Database compass_db on collection called file_collection
            db_obj.add_document(
                database="compass_db",
                collection="file_collection",
                json_data={
                    "id_": str(db_token),
                    "filename": fileb.filename,
                    "attendees": "",
                    "source": "json",
                    "summary": "",
                    "datetime": str(timestamp),
                    "status": "Completed",
                    "audio_token": "",
                },
            )

            db_obj.add_document(
                database="compass_db",
                collection="mindmap",
                json_data={
                    "transcript_id": str(db_token), 
                    "data": json.loads(encoded_json.decode())
                },
            )
            return str(db_token)
        if fileb.filename.split(".")[-1] == "mp3":
            audio_content = fileb.file.read()
            wav_audio = audio_obj.generate_wav(data=audio_content, filepath=fileb.filename)
            audio_text = audio_obj.generate_text(wav_file=wav_audio)
            processed_text = ".\n".join(audio_text.split("."))
            byte_content = processed_text.encode()
            audiodb = db_obj.db_client.compass_audiodb
            grid_as = gridfs.GridFS(audiodb)
            audio_token = grid_as.put(audio_content, filename=fileb.filename)
            source = "audio"
            shutil.rmtree("/tmp/audio")
        elif fileb.filename.split(".")[-1] == "txt":
            byte_content = fileb.file.read()
            audio_token = None
            source = "transcription"
        else:
            return HTTPException(status_code=405, detail="Item not found")
        # log timstamp
        timestamp = datetime.datetime.now()
        # Load File into GridFS System
        # Load file into MongoDb and extract a token
        filedb = db_obj.db_client.compass_filedb
        grid_fs = gridfs.GridFS(filedb)
        db_token = grid_fs.put(byte_content, filename=fileb.filename)
        # # Add person involved in the meeting
        attendees = model_obj.ner_model.extract_names(byte_content.decode())
        # # Extract Summary from the transcribe
        summary = model_obj.summerizer_model.extract_summary(byte_content.decode())
        # load filename and db_token in Database compass_db on collection called file_collection
        db_obj.add_document(
            database="compass_db",
            collection="file_collection",
            json_data={
                "id_": str(db_token),
                "filename": fileb.filename,
                "attendees": ",".join(attendees),
                "source": source,
                "summary": summary,
                "datetime": str(timestamp),
                "status": "In progress",
                "audio_token": str(audio_token),
            },
        )
        return str(db_token)
    except Exception as e:
        logger.error(traceback.format_exc())
        return HTTPException(status_code=405, detail="Item not found")


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
    logger.info("Extracting JSON from Transcribe Data")
    json_response = model_obj.gpt_model.extract_response(transcribe_data=str_data)
    logger.info("JSON Extracted Successfully")
    if isinstance(json_response, dict):
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
    return HTTPException(
        status_code=500,
        detail="chatGPT failed parsing JSON, extracted redundant text with JSON!!",
    )


@app.get("/api/user/play")
async def play_audio(db_token: str):
    # test wether filename is txt or not
    resp = db_obj.query_document(
        database="compass_db", collection="file_collection", query={"id_": db_token}
    )
    audio_token = resp.get("audio_token", None)
    if not os.path.isdir("/tmp/audio"):
        os.mkdir("/tmp/audio")
    if audio_token:
        audiodb = db_obj.db_client.compass_audiodb
        grid_as = gridfs.GridFS(audiodb)
        data_obj = grid_as.get(ObjectId(audio_token))
        byte_audio = data_obj.read()
        with open("/tmp/audio/temp_audio.wav", "wb+") as f:
            f.write(byte_audio)
        return FileResponse("/tmp/audio/temp_audio.wav")
    else:
        return HTTPException(status_code=405, detail="Item not found")


@app.post("/api/user/upload_json")
async def read_item(fileb: UploadFile = File(...)):
    # test wether filename is txt or not

    if fileb.filename.split(".")[-1] == "json":
        # byte_content = b'JSON without transcribe'
        timestamp = datetime.datetime.now()
        # Load File into GridFS System
        # Load file into MongoDb and extract a token
        filedb = db_obj.db_client.compass_filedb
        encoded_json = fileb.file.read()
        grid_fs = gridfs.GridFS(filedb)
        db_token = grid_fs.put(encoded_json, filename=fileb.filename)

        # load filename and db_token in Database compass_db on collection called file_collection
        db_obj.add_document(
            database="compass_db",
            collection="file_collection",
            json_data={
                "id_": str(db_token),
                "filename": fileb.filename,
                "attendees": "",
                "source": "json",
                "summary": "",
                "datetime": str(timestamp),
                "status": "Completed",
                "audio_token": "",
            },
        )

        db_obj.add_document(
            database="compass_db",
            collection="mindmap",
            json_data={"transcript_id": str(db_token), "data": encoded_json.decode()},
        )
        return str(db_token)
    else:
        return HTTPException(status_code=405, detail="Item not found")


@app.get("/api/user/getText")
async def get_text(db_token: str):
    filedb = db_obj.db_client.compass_filedb
    grid_as = gridfs.GridFS(filedb)
    data_obj = grid_as.get(ObjectId(db_token))
    return data_obj.read().decode()


@app.get("/api/user/delete")
async def delete_info(transcript_id: str):
    resp = db_obj.query_document(
        database="compass_db",
        collection="file_collection",
        query={"id_": transcript_id},
    )
    file_database = db_obj.db_client.compass_filedb
    audio_database = db_obj.db_client.compass_audio
    grid_fdb = gridfs.GridFS(file_database)
    grid_adb = gridfs.GridFS(audio_database)
    grid_fdb.delete(ObjectId(transcript_id))
    if resp.get("source") == "audio":
        grid_adb.delete(ObjectId(resp.get("audio_token")))
    db_obj.delete_document(
        database="compass_db",
        collection="mindmap",
        query={"transcript_id": transcript_id},
    )
    db_obj.delete_document(
        database="compass_db",
        collection="file_collection",
        query={"id_": transcript_id},
    )
    return "Success"


handler = Mangum(app)
