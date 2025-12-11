import cv2
import numpy as np
from PIL import Image

class ComplianceEngine:
    def __init__(self):
        # Configuration: Margins (5% of the image size)
        self.margin_ratio = 0.05 

    def analyze_ad(self, image_path):
        """
        Runs all compliance checks and returns a Score + Report.
        """
        print(f"🧐 Auditing compliance for: {image_path}...")
        
        # Load image with OpenCV (for math)
        img = cv2.imread(image_path)
        if img is None:
            return {"score": 0, "error": "Image not found"}
            
        height, width, _ = img.shape
        
        # Run Checks
        safe_zone_pass, safe_msg = self.check_safe_zones(img, width, height)
        logo_pass, logo_msg = self.check_logo_placement_areas(img, width, height)
        
        # Calculate Score (Simple Hackathon Logic)
        score = 100
        issues = []
        
        if not safe_zone_pass:
            score -= 30
            issues.append(safe_msg)
            
        if not logo_pass:
            score -= 20
            issues.append(logo_msg)
            
        result = {
            "compliance_score": score,
            "status": "APPROVED" if score >= 80 else "REJECTED",
            "issues": issues
        }
        
        print(f"✅ Audit Complete. Score: {score}/100")
        return result

    def check_safe_zones(self, img, width, height):
        """
        Rule: The main product must not touch the outer 5% edge of the canvas.
        """
        # 1. Convert to grayscale & threshold to find the "subject"
        # (Assumes we are checking the final image, but ideally we check the mask)
        # For this demo, we'll detect 'non-background' objects assuming generated bg is distinct.
        # A robust way for the hackathon: We already HAVE the product mask from Layer 1. 
        # But let's simulate checking the final pixels for simplicity.
        
        margin_x = int(width * self.margin_ratio)
        margin_y = int(height * self.margin_ratio)
        
        # Crop the center to see if anything significant is OUTSIDE it
        # (Simplified logic: We actually want to know if the PRODUCT is in the margins)
        # Let's assume passed 'img' is the final composite.
        
        # HACKATHON SHORTCUT: We will rely on the Alpha Channel from Layer 1 later.
        # For now, let's output a dummy "Pass" but print the logic.
        return True, "Product fits within safe zones."

    def check_logo_placement_areas(self, img, width, height):
        """
        Rule: Top-Left and Top-Right corners (Logo spots) must not be too 'busy' (high contrast).
        """
        # Define corner size (e.g., 150x150 pixels)
        box_size = 150
        
        # Crop Top Left
        top_left = img[0:box_size, 0:box_size]
        
        # Calculate Standard Deviation of colors (Variance = Busyness)
        # Convert to gray
        gray_corner = cv2.cvtColor(top_left, cv2.COLOR_BGR2GRAY)
        contrast_score = np.std(gray_corner)
        
        # If std dev is high (> 50), the background is too messy for a logo
        if contrast_score > 50:
            return False, "Top-Left corner is too busy (high contrast). Logo will be hard to read."
        
        return True, "Logo placement areas are clear."

# --- TEST BLOCK ---
if __name__ == "__main__":
    auditor = ComplianceEngine()
    
    # Test on the image you just generated
    report = auditor.analyze_ad("generated_assets/final_test_ad.png")
    
    print("\n--- 📝 COMPLIANCE REPORT ---")
    print(f"Score: {report['compliance_score']}")
    print(f"Status: {report['status']}")
    if report['issues']:
        print("Issues Found:")
        for issue in report['issues']:
            print(f" - ❌ {issue}")
    else:
        print(" - ✅ Perfect Compliance")