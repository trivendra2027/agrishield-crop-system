from datetime import timezone
import json
import os
from typing import List, Dict, Tuple

class ClassMapper:
    def __init__(self, classes_json_path: str = None):
        if classes_json_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
            classes_json_path = os.path.join(base_dir, "model", "classes.json")
            
        self.classes_json_path = classes_json_path
        self.classes: List[str] = self._load_classes()
        self.num_classes = len(self.classes)

    def _load_classes(self) -> List[str]:
        if not os.path.exists(self.classes_json_path):
            raise FileNotFoundError(f"Classes JSON file not found at: {self.classes_json_path}")
        with open(self.classes_json_path, 'r', encoding='utf-8') as f:
            classes = json.load(f)
        return classes

    def get_class_name(self, index: int) -> str:
        if 0 <= index < self.num_classes:
            return self.classes[index]
        return f"Unknown_Class_{index}"

    def parse_class_details(self, class_label: str) -> Tuple[str, str, str]:
        """
        Parses class string e.g. 'Tomato___Early_blight' -> ('Tomato', 'Early Blight', 'diseased')
        """
        clean_label = class_label.strip()
        
        # Handle known pest edge-cases that lack crop prefixes
        known_rice_pests = ["Brown_Planthopper", "Small_Brown_Planthopper", "White_Backed_Planthopper"]
        if clean_label in known_rice_pests:
            return "Rice", clean_label.replace("_", " ").title(), "diseased"
            
        known_general_pests = ["Tarnished_Plant_Bug", "Green_Stinkbug"]
        if clean_label in known_general_pests:
            return "General Plant", clean_label.replace("_", " ").title(), "diseased"
        
        if "___" in clean_label:
            parts = clean_label.split("___")
            crop = parts[0].replace("_", " ").strip().title()
            disease_raw = parts[1].replace("_", " ").strip()
        elif "_" in clean_label:
            parts = clean_label.split("_")
            crop = parts[0].strip().title()
            disease_raw = " ".join(parts[1:]).strip()
        else:
            crop = clean_label.title()
            disease_raw = "General Condition"

        # Sanitize crop name formatting
        if "Pepper" in crop:
            crop = "Bell Pepper"
        elif "Corn" in crop:
            crop = "Corn (Maize)"

        if disease_raw.lower() in ["healthy", "normal"]:
            disease_name = "Healthy"
            status = "healthy"
        else:
            disease_name = disease_raw.replace("_", " ").title()
            status = "diseased"

        return crop, disease_name, status
