import io
import os
import requests
from rembg import remove
from PIL import Image
from dotenv import load_dotenv
load_dotenv()
class CreativeCatalyst:
    def __init__(self):
        self.output_dir = "generated_assets"
        os.makedirs(self.output_dir, exist_ok=True)
        self.stability_key = os.getenv("STABILITY_KEY")

    def remove_background(self, input_image_path):
        """
        Layer 1.1: Takes raw product photo, removes background, returns RGBA image.
        """
        print(f"✂️ Removing background from: {input_image_path}...")
        
        with open(input_image_path, 'rb') as i:
            input_data = i.read()
            
        subject_only = remove(input_data)
        return Image.open(io.BytesIO(subject_only)).convert("RGBA")
    
    def generate_background_scenery(self, prompt, width=1024, height=1024):
        print(f"🎨 Generating Background: {prompt}")
        url = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image"
        
        if not self.stability_key:
            return Image.new('RGB', (width, height), (200, 200, 200)) # Fallback

        body = {
            "steps": 40,
            "width": width,
            "height": height,
            "seed": 0,
            "cfg_scale": 7,
            "samples": 1,
            "text_prompts": [{"text": prompt, "weight": 1}],
        }
        
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.stability_key}",
        }

        response = requests.post(url, headers=headers, json=body)
        if response.status_code != 200:
            print("Error generating image")
            return Image.new('RGB', (width, height), (200, 200, 200))

        data = response.json()
        import base64
        image_data = base64.b64decode(data["artifacts"][0]["base64"])
        return Image.open(io.BytesIO(image_data))

    def composite_image(self, product_img, background_img):
        bg_w, bg_h = background_img.size
        # Resize product to 50% height
        target_height = int(bg_h * 0.5) 
        aspect_ratio = product_img.width / product_img.height
        target_width = int(target_height * aspect_ratio)
        
        product_resized = product_img.resize((target_width, target_height), Image.Resampling.LANCZOS)
        
        x_pos = (bg_w - target_width) // 2
        y_pos = (bg_h - target_height) // 2 + 50
        
        final_comp = background_img.copy()
        final_comp.paste(product_resized, (x_pos, y_pos), product_resized)
        return final_comp