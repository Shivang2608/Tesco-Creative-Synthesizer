import io
import os
import requests
from rembg import remove
from PIL import Image

class CreativeCatalyst:
    def __init__(self):
        self.output_dir = "generated_assets"
        os.makedirs(self.output_dir, exist_ok=True)

    def remove_background(self, input_image_path):
        """
        Layer 1.1: Takes raw product photo, removes background, returns RGBA image.
        """
        print(f"✂️ Removing background from: {input_image_path}...")
        
        with open(input_image_path, 'rb') as i:
            input_data = i.read()
            
        subject_only = remove(input_data)
        img = Image.open(io.BytesIO(subject_only)).convert("RGBA")
        print("✅ Background removed.")
        return img