import io
import os
import requests
from rembg import remove, new_session
from PIL import Image, ImageOps, ImageFilter, ImageDraw, ImageFont
from dotenv import load_dotenv

load_dotenv()

class CreativeCatalyst:
    def __init__(self):
        self.output_dir = "generated_assets"
        os.makedirs(self.output_dir, exist_ok=True)
        # PASTE YOUR STABILITY KEY HERE
        self.stability_key = os.getenv("STABILITY_KEY")
        if not self.stability_key:
             print("⚠️ WARNING: STABILITY_KEY not found in .env file.") 
        self.rembg_session = new_session("u2netp")

        
    def remove_background(self, input_image_path):
        print(f"✂️ Removing background from: {input_image_path}...")
        with open(input_image_path, 'rb') as i:
            input_data = i.read()
        subject_only = remove(input_data, session=self.rembg_session)
        img = Image.open(io.BytesIO(subject_only)).convert("RGBA")
        print("✅ Background removed.")
        return img

    def generate_background_scenery(self, prompt, width=1024, height=1024):
        print(f"🎨 Generating Pro Background...")
        
        # Check env or class var
        if not self.stability_key or "PASTE" in self.stability_key:
             self.stability_key = os.getenv("STABILITY_KEY")
             
        if not self.stability_key:
            print("⚠️ WARNING: No Stability API Key found. Using beige placeholder.")
            return Image.new('RGB', (width, height), color=(255, 230, 200))

        url = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image"

        body = {
            "steps": 50,
            "width": width,
            "height": height,
            "seed": 0,
            "cfg_scale": 8,
            "samples": 1,
            "text_prompts": [
                { "text": prompt, "weight": 1 },
                { "text": "cartoon, illustration, fake, low quality, pixelated, blurry, watermark, text, logo", "weight": -1 }
            ],
        }

        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.stability_key}",
        }

        response = requests.post(url, headers=headers, json=body)

        if response.status_code != 200:
            print(f"❌ Stability API Error: {response.status_code}")
            return Image.new('RGB', (width, height), color=(255, 230, 200))

        data = response.json()
        import base64
        image_data = base64.b64decode(data["artifacts"][0]["base64"])
        background = Image.open(io.BytesIO(image_data))
        print("✅ Background Generated.")
        return background

    def composite_image(self, product_img, background_img):
        bg_w, bg_h = background_img.size
        target_height = int(bg_h * 0.55) 
        aspect_ratio = product_img.width / product_img.height
        target_width = int(target_height * aspect_ratio)
        
        product_resized = product_img.resize((target_width, target_height), Image.Resampling.LANCZOS)
        
        x_pos = (bg_w - target_width) // 2
        y_pos = (bg_h - target_height) // 2 + 50
        
        final_comp = background_img.copy()
        final_comp.paste(product_resized, (x_pos, y_pos), product_resized)
        return final_comp


    def add_smart_text(self, image, headline, cta, is_clubcard=False, price="0", club_price="0", brand="Tesco"):
        draw = ImageDraw.Draw(image)
        w, h = image.size
        
        # Load Fonts (Simplified)
        try:
            font_bold = ImageFont.truetype("arialbd.ttf", 80)
            font_reg = ImageFont.truetype("arial.ttf", 40)
            font_small = ImageFont.truetype("arial.ttf", 30)
        except:
            font_bold = ImageFont.load_default()
            font_reg = ImageFont.load_default()
            font_small = ImageFont.load_default()

        # 1. DRAW CLUBCARD BADGE (The "Home Run" Feature)
        if is_clubcard:
            # Badge Dimensions (Yellow Box)
            badge_w, badge_h = 300, 400
            badge_x, badge_y = w - badge_w - 50, h - badge_h - 50 # Bottom Right
            
            # Yellow Background
            draw.rectangle([badge_x, badge_y, badge_x+badge_w, badge_y+badge_h], fill="#FFCC00")
            
            # Text: "Clubcard Price"
            draw.text((badge_x + 20, badge_y + 20), "Clubcard Price", fill="#00539F", font=font_small)
            
            # Text: Big Price
            draw.text((badge_x + 20, badge_y + 100), f"£{club_price}", fill="black", font=font_bold)
            
            # Text: Regular Price
            draw.text((badge_x + 20, badge_y + 250), f"Regular Price: £{price}", fill="black", font=font_small)
            
            # Logo Area (Blue bit at bottom)
            draw.rectangle([badge_x, badge_y+badge_h-50, badge_x+badge_w, badge_y+badge_h], fill="#00539F")
            draw.text((badge_x + 80, badge_y+badge_h-40), "TESCO", fill="white", font=font_small)

        # 2. DRAW HEADLINE (Brand Color Aware)
        if headline:
            # If Cadbury, use Gold text. If Tesco, use White.
            text_color = "white"
            if brand == "Cadbury": text_color = "#D4AF37" # Gold
            if brand == "Coca-Cola": text_color = "white"
            
            draw.text((50, 100), headline, font=font_bold, fill=text_color)

        # 3. DRAW CTA (Pill)
        if cta:
            btn_w, btn_h = 350, 90
            btn_x, btn_y = (w - btn_w)//2, h - 150
            if is_clubcard: btn_x = 50 # Move left if badge is on right
            
            draw.rounded_rectangle([btn_x, btn_y, btn_x+btn_w, btn_y+btn_h], radius=45, fill="white")
            draw.text((btn_x+50, btn_y+20), cta, fill="black", font=font_reg)

        return image
    
    def adaptive_cascade(self, master_image, target_width, target_height):
        canvas = Image.new('RGB', (target_width, target_height))
        bg_fill = master_image.copy().resize((target_width, target_height), Image.Resampling.LANCZOS)
        bg_fill = bg_fill.filter(ImageFilter.GaussianBlur(radius=40))
        
        ratio = min(target_width / master_image.width, target_height / master_image.height) * 0.90
        new_w = int(master_image.width * ratio)
        new_h = int(master_image.height * ratio)
        master_resized = master_image.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        x_pos = (target_width - new_w) // 2
        y_pos = (target_height - new_h) // 2
        
        canvas.paste(bg_fill, (0, 0))
        canvas.paste(master_resized, (x_pos, y_pos))
        return canvas