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
async def generate_campaign(file: UploadFile = File(...)), prompt: str = Form(...),
brand: str = Form("generic"),      # New
clubcard: str = Form("false")):
    

    unique_id = uuid.uuid4()
    temp_path = f"generated_assets/{unique_id}_{file.filename}"
    
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    brand_guidelines = {
        "tesco": "clean white and blue theme, supermarket lighting",
        "cadbury": "rich purple #261251 background accents, warm golden lighting",
        "coca-cola": "vibrant red #F40009 energetic lighting, refreshing droplets",
        "heineken": "premium green #008200 tint, stadium lighting"
    }
    brand_prompt = brand_guidelines.get(brand, "")
    full_prompt = f"{prompt}, {brand_prompt}"
    
    # 1. Remove BG
    product_clean = creative_tool.remove_background(temp_path)
    
    # 2. Generate BG
    bg_scene = creative_tool.generate_background_scenery(prompt)
    
    # 3. Composite
    master_ad = creative_tool.composite_image(product_clean, bg_scene)
    
    
    master_filename = f"master_{unique_id}.png"
    master_path= f"generated_assets/{master_filename}"
    master_ad.save(f"generated_assets/{master_filename}")    
    
    audit_report = auditor.analyze_ad(master_path)

    formats = {
        "square":    {"w": 1080, "h": 1080, "label": "Social Feed (1:1)"},
        "story":     {"w": 1080, "h": 1920, "label": "Story/Reel (9:16)"},
        "landscape": {"w": 1920, "h": 1080, "label": "Web Banner (16:9)"},
        "portrait":  {"w": 1080, "h": 1350, "label": "Mobile Display (4:5)"}
    }
    generated_assets = {}
    
    for key, dims in formats.items():
        if key == "square":
            # Master is already square (usually), just link it
            generated_assets[key] = {
                "url": f"http://127.0.0.1:8000/static/{master_filename}",
                "label": dims["label"]
            }
        else:
            # Resize using the new engine
            resized_img = creative_tool.adaptive_cascade(master_ad, dims["w"], dims["h"])
            filename = f"{key}_{unique_id}.png"
            path = f"generated_assets/{filename}"
            resized_img.save(path)
            
            generated_assets[key] = {
                "url": f"http://127.0.0.1:8000/static/{filename}",
                "label": dims["label"]
            }

    return {
        "status": "success",
        "assets": {
            "square": {"url": f"http://127.0.0.1:8000/static/{master_filename}"}
        },
        "compliance": audit_report
    }
