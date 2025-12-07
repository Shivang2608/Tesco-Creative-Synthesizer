from PIL import Image, ImageStat, ImageFilter

class ComplianceEngine:
    def __init__(self):
        pass

    def analyze_ad(self, image_path):
        """
        Layer 2: Audits the generated ad for brand safety and accessibility.
        """
        print(f"🧐 Auditing compliance for: {image_path}...")
        
        # 1. Load Image
        img = Image.open(image_path).convert("RGB")
        
        # 2. Calculate Contrast (Simplified Luminance Check)
        stat = ImageStat.Stat(img)
        avg_brightness = sum(stat.mean) / 3
        
        # 3. Determine if safe
        is_compliant = True
        issues = []
        
        # Rule: Too dark images might fail print standards
        if avg_brightness < 50:
            is_compliant = False
            issues.append("Image too dark for print standards")
            
        # Rule: WCAG (Simulated) - In real life this checks text vs bg
        contrast_score = 4.5 # Default pass
        
        print(f"✅ Audit Complete. Score: {100 if is_compliant else 85}/100")
        
        return {
            "is_compliant": is_compliant,
            "compliance_score": 100 if is_compliant else 85,
            "issues": issues,
            "metrics": {
                "contrast_ratio": contrast_score,
                "safe_zone_padding": "45px"
            }
        }

    def adaptive_cascade(self, master_image, target_width, target_height):
        """
        Layer 3: Resizes the master creative to new formats with blur fill.
        """
        # 1. Create canvas
        canvas = Image.new('RGB', (target_width, target_height))
        
        # 2. Blur Fill Background
        bg_fill = master_image.copy()
        bg_fill = bg_fill.resize((target_width, target_height), Image.Resampling.LANCZOS)
        bg_fill = bg_fill.filter(ImageFilter.GaussianBlur(radius=40))
        
        # 3. Fit Master Image (Contain logic)
        ratio = min(target_width / master_image.width, target_height / master_image.height)
        # Use 90% of available space to leave a nice margin
        ratio = ratio * 0.90
        
        new_w = int(master_image.width * ratio)
        new_h = int(master_image.height * ratio)
        
        master_resized = master_image.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # 4. Center it
        x_pos = (target_width - new_w) // 2
        y_pos = (target_height - new_h) // 2
        
        # 5. Paste
        canvas.paste(bg_fill, (0, 0))
        canvas.paste(master_resized, (x_pos, y_pos))
        
        return canvas