from datetime import timezone
# FAO-56 Agronomic Crop Coefficients (Kc) for Growth Stages
CROP_KC = {
    "tomato": {"Germination": 0.45, "Vegetative": 0.75, "Flowering": 1.15, "Fruiting": 1.10, "Harvesting": 0.80},
    "potato": {"Germination": 0.40, "Vegetative": 0.70, "Flowering": 1.15, "Fruiting": 1.05, "Harvesting": 0.75},
    "wheat":  {"Germination": 0.35, "Vegetative": 0.70, "Flowering": 1.10, "Fruiting": 1.00, "Harvesting": 0.40},
    "rice":   {"Germination": 1.05, "Vegetative": 1.20, "Flowering": 1.30, "Fruiting": 1.25, "Harvesting": 0.95},
    "corn":   {"Germination": 0.40, "Vegetative": 0.80, "Flowering": 1.20, "Fruiting": 1.15, "Harvesting": 0.60},
    "cotton": {"Germination": 0.40, "Vegetative": 0.75, "Flowering": 1.15, "Fruiting": 1.00, "Harvesting": 0.65},
    "default":{"Germination": 0.40, "Vegetative": 0.75, "Flowering": 1.10, "Fruiting": 1.05, "Harvesting": 0.70}
}

# Optimal Soil Moisture Target (%)
SOIL_TARGET_MOISTURE = {
    "tomato": 65.0,
    "potato": 70.0,
    "wheat":  55.0,
    "rice":   85.0,
    "corn":   60.0,
    "cotton": 55.0,
    "default":60.0
}

def get_crop_kc(crop: str, stage: str) -> float:
    crop_lower = crop.lower() if crop else "default"
    stages = CROP_KC.get(crop_lower, CROP_KC["default"])
    return stages.get(stage, 0.75)

def get_target_soil_moisture(crop: str) -> float:
    crop_lower = crop.lower() if crop else "default"
    return SOIL_TARGET_MOISTURE.get(crop_lower, SOIL_TARGET_MOISTURE["default"])
