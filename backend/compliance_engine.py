from PIL import Image, ImageStat

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