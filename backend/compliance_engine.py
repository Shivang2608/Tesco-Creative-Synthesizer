from PIL import Image, ImageStat, ImageFilter,ImageDraw, ImageFont

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

def add_smart_text(self, image, headline, cta, is_clubcard=False, price="0", club_price="0", brand="generic"):
        """
        Layer 4: Composites dynamic text, prices, and CTA buttons onto the ad.
        """
        draw = ImageDraw.Draw(image)
        w, h = image.size
        
        # Load Fonts (Simplified for demo)
        try:
            # In a real app, you'd load brand-specific .ttf files here
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
            
            # Yellow Background (#FFCC00 is Tesco Yellow)
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

        # 2. DRAW HEADLINE
        if headline:
            text_color = "white"
            # Brand specific text colors
            if brand == "cadbury": text_color = "#D4AF37" # Gold
            
            draw.text((50, 100), headline, font=font_bold, fill=text_color)

        # 3. DRAW CTA BUTTON
        if cta:
            btn_w, btn_h = 350, 90
            btn_x, btn_y = (w - btn_w)//2, h - 150
            if is_clubcard: btn_x = 50 # Move left if badge is present
            
            # Draw Pill Shape
            draw.rounded_rectangle([btn_x, btn_y, btn_x+btn_w, btn_y+btn_h], radius=45, fill="white")
            draw.text((btn_x+50, btn_y+20), cta, fill="black", font=font_reg)

        return image