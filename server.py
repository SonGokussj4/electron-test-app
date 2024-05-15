import json
import os

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()
data_file = "data.json"


class TextData(BaseModel):
    text: str


@app.get("/get-text")
async def get_text():
    if os.path.exists(data_file):
        with open(data_file, "r") as file:
            data = json.load(file)
            return {"text": data.get("text", "")}
    return {"text": ""}


@app.post("/set-text")
async def set_text(text_data: TextData):
    with open(data_file, "w") as file:
        json.dump({"text": text_data.text}, file)
    return {"message": "Text updated successfully"}
