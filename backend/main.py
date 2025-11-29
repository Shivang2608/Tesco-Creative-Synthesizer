from fastapi import FastAPI, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import uuid
app = FastAPI(title="Tesco Creative Synthesizer")

# Basic CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("generated_assets", exist_ok=True)
app.mount("/static", StaticFiles(directory="generated_assets"), name="static")
@app.post("/generate-campaign")
async def generate_campaign(file: UploadFile = File(...)):
    # Basic upload logic only
    unique_id = uuid.uuid4()
    temp_path = f"generated_assets/{unique_id}_{file.filename}"
    
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"status": "uploaded", "filename": file.filename}

@app.get("/")
def read_root():
    return {"status": "online", "version": "0.1.0"}