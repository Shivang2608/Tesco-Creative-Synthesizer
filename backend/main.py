from fastapi import FastAPI, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import uuid
from creative_engine import CreativeCatalyst
from compliance_engine import ComplianceEngine 

app = FastAPI()

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

creative_tool = CreativeCatalyst()
auditor = ComplianceEngine()
@app.post("/generate-campaign")
async def generate_campaign(file: UploadFile = File(...)), prompt: str = Form(...)):
    # Basic upload logic only
    unique_id = uuid.uuid4()
    temp_path = f"generated_assets/{unique_id}_{file.filename}"
    
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 1. Remove BG
    product_clean = creative_tool.remove_background(temp_path)
    
    # 2. Generate BG
    bg_scene = creative_tool.generate_background_scenery(prompt)
    
    # 3. Composite
    master_ad = creative_tool.composite_image(product_clean, bg_scene)
    audit_report = auditor.analyze_ad(master_path)
    master_filename = f"master_{unique_id}.png"
    master_ad.save(f"generated_assets/{master_filename}")    
    
    return {
        "status": "success",
        "assets": {
            "square": {"url": f"http://127.0.0.1:8000/static/{master_filename}"}
        },
        "compliance": audit_report
    }
