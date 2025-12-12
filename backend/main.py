from fastapi import FastAPI, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import uuid
import google.generativeai as genai
from PIL import Image
from dotenv import load_dotenv 

# Import your engines
from creative_engine import CreativeCatalyst
from compliance_engine import ComplianceEngine

load_dotenv() 

# --- 🔑 API CONFIGURATION ---
# PASTE YOUR REAL GEMINI KEY HERE
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    print("❌ ERROR: GOOGLE_API_KEY not found in .env file!")

# Configure Gemini
try:
    genai.configure(api_key=GOOGLE_API_KEY)
except Exception as e:
    print(f"⚠️ API Configuration Error: {e}")

app = FastAPI()

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

@app.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    print(f"👁️ analyzing image content: {file.filename}...")
    
    # Save temp file for Gemini to read
    temp_filename = f"temp_analysis_{uuid.uuid4()}.jpg"
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # 1. LOAD IMAGE (SAFE OPEN)
        # using 'with' ensures it closes after the block
        smart_prompt = ""
        with Image.open(temp_filename) as img:
            
            # 2. CALL GEMINI VISION MODEL
            model = genai.GenerativeModel('gemini-2.5-flash')
            
            prompt = (
                "Look at this product image. Identify what category it belongs to (e.g., beauty, food, fashion, tech). "
                "Based on the category, describe the single BEST commercial background setting for it. "
                "Examples: "
                " - Shampoo -> 'A luxury marble bathroom shelf with soft spa lighting and orchids' "
                " - Sneaker -> 'A gritty concrete urban street with neon city bokeh' "
                " - Juice -> 'A sunny wooden picnic table in an orchard with dappled light' "
                " - Tech/Gadget -> 'A sleek futuristic neon desk setup with cyberpunk lighting' "
                " - Bag/Purse -> 'A high-end fashion boutique display with velvet texture and warm spotlight' "
                "OUTPUT RULES: "
                "1. Do NOT describe the product itself. Only the background. "
                "2. Keep it under 20 words. "
                "3. Focus on MATERIALS (wood, stone, metal) and LIGHTING."
            )
            
            response = model.generate_content([prompt, img])
            smart_prompt = response.text.strip()
            print(f"✅ Gemini Successfully Saw: {smart_prompt}")
        
        # Now it is safe to remove because the 'with' block closed the file
        os.remove(temp_filename)
        
        return {"suggested_prompt": smart_prompt}

    except Exception as e:
        print(f"❌ Gemini Vision FAILED: {e}")
        # Clean up if it failed
        if os.path.exists(temp_filename):
            try:
                os.remove(temp_filename)
            except:
                pass
                
        import random
        backups = [
            "A textured architectural concrete podium with dramatic side lighting and soft shadows",
            "A luxurious white marble surface with soft window lighting from the side",
            "A clean studio backdrop with a soft cinematic color gradient"
        ]
        return {"suggested_prompt": random.choice(backups)}

# ... (Keep existing imports) ...

# ... (Same imports as before) ...

@app.post("/generate-campaign")
async def generate_campaign(
    file: UploadFile = File(...), 
    prompt: str = Form(...),
    headline: str = Form(None),
    cta: str = Form(None),
    brand: str = Form("generic"),
    clubcard: str = Form("false"),
    price: str = Form(None),
    club_price: str = Form(None),
    audience: str = Form("general") # NEW PARAMETER
):
    print(f"🚀 Generating | Brand: {brand} | Audience: {audience}")
    
    # ... (File saving logic remains the same) ...
    unique_id = uuid.uuid4()
    temp_path = f"generated_assets/{unique_id}_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # ---------------------------------------------------------
    # PROMPT ENGINEERING V6: AUDIENCE TARGETING
    # ---------------------------------------------------------
    
    # 1. Base Prompt Logic
    audience_modifiers = {
        "general": "balanced lighting, clean commercial look",
        "price_sensitive": "high contrast, bold colors, red accents, energetic retail atmosphere, sale vibe",
        "health_conscious": "fresh, organic, bright natural sunlight, green foliage accents, airy atmosphere, wellness aesthetic",
        "premium": "luxury, minimalist, moody cinematic lighting, gold and black accents, elegant depth of field",
        "families": "warm lighting, cozy home atmosphere, soft colors, inviting and friendly"
    }
    
    audience_style = audience_modifiers.get(audience, "")
    
    enhanced_prompt = (
        f"Professional commercial photography of {prompt}, "
        f"{audience_style}, " # INJECT AUDIENCE STYLE
        "centered product shot, "
        "hyper-realistic 8k resolution, "
        "hard surface raytracing, "
        "shot on Hasselblad X2D, "
        "50mm prime lens, f/1.8, "
        "global illumination, "
        "intricate texture details, "
        "no floating objects, "
        "award winning advertising photography"
    )
    
    # 2. BRAND DNA INJECTION
    brand_guidelines = {
        "tesco": "clean white and blue theme, supermarket lighting",
        "cadbury": "rich purple #261251 background accents, warm golden lighting",
        "coca-cola": "vibrant red #F40009 energetic lighting, refreshing droplets",
        "heineken": "premium green #008200 tint, stadium lighting"
    }
    brand_prompt = brand_guidelines.get(brand, "")
    
    full_prompt = f"{enhanced_prompt}, {brand_prompt}"
    
    print(f"✨ Final Prompt: {full_prompt}")

    # ... (Rest of the generation logic remains the same) ...
    # LAYER 1
    product_clean = creative_tool.remove_background(temp_path)
    bg_scene = creative_tool.generate_background_scenery(full_prompt) # Use full_prompt
    master_ad = creative_tool.composite_image(product_clean, bg_scene)
    
    # TEXT & CLUBCARD LAYERING
    is_clubcard = clubcard.lower() == 'true'
    if headline or cta or is_clubcard:
        # Note: You can also pass 'audience' here if you want to change font styles based on audience!
        master_ad = creative_tool.add_smart_text(
            master_ad, headline, cta, 
            is_clubcard, price, club_price, brand
        )

    # ... (Save & Return logic remains the same) ...
    master_filename = f"master_{unique_id}.png"
    master_path = f"generated_assets/{master_filename}"
    master_ad.save(master_path)
    
    # ... (Cascade logic remains the same) ...
    formats = {
        "square":    {"w": 1080, "h": 1080, "label": "Social Feed (1:1)"},
        "story":     {"w": 1080, "h": 1920, "label": "Story/Reel (9:16)"},
        "landscape": {"w": 1920, "h": 1080, "label": "Web Banner (16:9)"},
        "portrait":  {"w": 1080, "h": 1350, "label": "Mobile Display (4:5)"}
    }
    
    generated_assets = {}
    
    for key, dims in formats.items():
        if key == "square":
            generated_assets[key] = {
                "url": f"/static/{master_filename}",
                "label": dims["label"]
            }
        else:
            resized_img = creative_tool.adaptive_cascade(master_ad, dims["w"], dims["h"])
            filename = f"{key}_{unique_id}.png"
            path = f"generated_assets/{filename}"
            resized_img.save(path)
            
            generated_assets[key] = {
                "url": f"/static/{filename}",
                "label": dims["label"]
            }
    
    audit_report = auditor.analyze_ad(master_path)
    
    return {
        "status": "success",
        "assets": generated_assets,
        "compliance": audit_report
    }
# ... (Keep rest of file) ...

@app.get("/")
def read_root():
    return {"message": "Tesco Creative Synthesizer API is Online 🟢"}