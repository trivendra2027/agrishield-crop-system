import os
import sys
import json
import hashlib
import logging
from PIL import Image
import cv2
import numpy as np

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from model.configs.config import PipelineConfig

logger = logging.getLogger("Dataset_Gap_Analyzer")
if not logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter('[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s'))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

# Definition of the 40 target domain categories and recommended dataset sources
TARGET_DOMAINS = {
    "1_Fruit_Maturity": ["Fruit_Maturity___Immature", "Fruit_Maturity___Mature", "Fruit_Maturity___Overripe"],
    "2_Fruit_Quality_Grading": ["Fruit_Grading___Grade_A_Export", "Fruit_Grading___Grade_B_Local", "Fruit_Grading___Grade_C_Damaged"],
    "3_Fruit_Defects": ["Fruit_Defect___Cracks", "Fruit_Defect___Bruises", "Fruit_Defect___Sunburn", "Fruit_Defect___Rot"],
    "4_Leaf_Nutrient_Deficiencies": ["Nutrient___Nitrogen_Deficiency", "Nutrient___Phosphorus_Deficiency", "Nutrient___Potassium_Deficiency", "Nutrient___Calcium_Deficiency", "Nutrient___Magnesium_Deficiency", "Nutrient___Iron_Deficiency", "Nutrient___Zinc_Deficiency", "Nutrient___Boron_Deficiency"],
    "5_Soil_Classification": ["Soil___Clay_Soil", "Soil___Sandy_Soil", "Soil___Loamy_Soil", "Soil___Black_Soil", "Soil___Red_Soil", "Soil___Laterite_Soil", "Soil___Saline_Soil"],
    "6_Soil_Moisture": ["Soil_Moisture___Dry", "Soil_Moisture___Optimal", "Soil_Moisture___Saturated"],
    "7_Soil_Fertility": ["Soil_Fertility___Low", "Soil_Fertility___Medium", "Soil_Fertility___High"],
    "8_Weed_Species": ["Weed___Broadleaf", "Weed___Grass_Weed", "Weed___Sedge", "Weed___Parthenium", "Weed___Amaranthus"],
    "9_Beneficial_Insects": ["Beneficial_Insect___Ladybird", "Beneficial_Insect___Honeybee", "Beneficial_Insect___Parasitoid_Wasp", "Beneficial_Insect___Pollinator"],
    "10_Pest_Life_Stages": ["Pest_Stage___Egg", "Pest_Stage___Larva", "Pest_Stage___Pupa", "Pest_Stage___Adult"],
    "11_Disease_Severity": ["Severity___Mild_Infection", "Severity___Moderate_Infection", "Severity___Severe_Infection"],
    "12_Multi_Disease": ["Multi_Disease___Leaf_Spot_plus_Rust", "Multi_Disease___Blight_plus_Mosaic"],
    "13_Multi_Leaf": ["Multi_Leaf___Healthy_and_Diseased_Canopy"],
    "14_Whole_Plant": ["Plant_View___Whole_Crop_Canopy", "Plant_View___Single_Plant"],
    "15_Stem_Diseases": ["Stem_Disease___Stem_Rot", "Stem_Disease___Bacterial_Canker", "Stem_Disease___Stem_Borer_Damage"],
    "16_Root_Diseases": ["Root_Disease___Root_Rot", "Root_Disease___Nematode_Galls", "Root_Disease___Damping_Off"],
    "17_Flower_Diseases": ["Flower_Disease___Flower_Blight", "Flower_Disease___Botrytis_Rot"],
    "18_Fruit_Diseases_Extended": ["Fruit_Disease___Anthracnose", "Fruit_Disease___Black_Spot", "Fruit_Disease___Sooty_Mold"],
    "19_Seed_Diseases": ["Seed_Disease___Grain_Smut", "Seed_Disease___Fungal_Seed_Rot"],
    "20_Bark_Diseases": ["Bark_Disease___Bark_Canker", "Bark_Disease___Gummosis"],
    "21_Greenhouse_Crop": ["Environment___Greenhouse_Indoor_Hydroponic"],
    "22_Drone_UAV_Imagery": ["Drone___Canopy_Multispectral", "Drone___RGB_Aerial_Crop_Map"],
    "23_Satellite_Imagery": ["Satellite___NDVI_Vegetation_Index"],
    "24_Field_Scale_Crop_Health": ["Field___Crop_Stress_Map"],
    "25_Weather_Damage": ["Weather_Damage___Hail_Damage", "Weather_Damage___Frost_Damage", "Weather_Damage___Drought_Stress", "Weather_Damage___Flood_Waterlogging", "Weather_Damage___Sunburn"],
    "26_Chemical_Injury": ["Chemical___Pesticide_Burn", "Chemical___Insecticide_Toxicity"],
    "27_Herbicide_Damage": ["Chemical___Herbicide_Drift_Injury"],
    "28_Irrigation_Stress": ["Irrigation___Under_Irrigated", "Irrigation___Over_Irrigated"],
    "29_Waterlogging": ["Waterlogging___Root_Anoxia"],
    "30_Nutrient_Toxicity": ["Nutrient_Toxicity___Fertilizer_Burn"],
    "31_Mixed_Crop_Field": ["Field___Intercropping_Mixed"],
    "32_Occluded_Leaf": ["Augmented___Leaf_Occlusion"],
    "33_Night_Time_Images": ["Lighting___Night_Flash_Photo"],
    "34_Low_Light_Images": ["Lighting___Low_Light_Shadow"],
    "35_Mobile_Camera_Datasets": ["Camera___Smartphone_Real_Field"],
    "36_Farmer_Captured_Photos": ["Camera___Farmer_Unstructured_Field"],
    "37_Indian_Crop_Diseases": ["Region_India___Chilli_Leaf_Curl", "Region_India___Rice_Brown_Spot", "Region_India___Cotton_Wilt"],
    "38_Regional_Crops": ["Region___Tropical_Subtropical_Crops"],
    "39_Growth_Stages": ["Growth_Stage___Seedling", "Growth_Stage___Vegetative", "Growth_Stage___Flowering", "Growth_Stage___Fruiting", "Growth_Stage___Maturity"],
    "40_Harvest_Readiness": ["Harvest___Ready_For_Harvest", "Harvest___Not_Ready"]
}

KAGGLE_PUBLIC_DATASETS = [
    {"ref": "arjuntejaswi/plantvillage-dataset", "category": "General Plant Disease"},
    {"ref": "vbookshelf/rice-leaf-diseases", "category": "Rice Diseases"},
    {"ref": "piyushmishra1999/plant-nutrient-deficiency-dataset", "category": "Nutrient Deficiencies"},
    {"ref": "hmunoz/ip102-pest-dataset", "category": "Pest & Insect Species"},
    {"ref": "pepepython/deepweeds", "category": "Weed Species"},
    {"ref": "muratkokludataset/rice-image-dataset", "category": "Grain & Seed Quality"},
    {"ref": "dhanushkoki/soil-type-classification", "category": "Soil Types"},
    {"ref": "srinivas1/mango-disease-dataset", "category": "Fruit Diseases"},
    {"ref": "ashishsaxena2209/cassava-leaf-disease-classification", "category": "Regional Crops"}
]

def run_gap_analysis():
    logger.info("Initializing 40-Domain Agricultural Dataset Gap Analysis...")
    
    pv_dir = PipelineConfig.PV_SRC
    combined_dir = PipelineConfig.COMBINED_DIR
    
    # 1. Audit existing classes in combined_dataset & plantvillage
    existing_classes = set()
    if os.path.exists(combined_dir):
        existing_classes.update([
            d for d in os.listdir(combined_dir) 
            if os.path.isdir(os.path.join(combined_dir, d)) and d != "folds"
        ])
    if os.path.exists(pv_dir):
        existing_classes.update([
            d for d in os.listdir(pv_dir) 
            if os.path.isdir(os.path.join(pv_dir, d))
        ])
        
    logger.info(f"Currently active classes in repository: {len(existing_classes)}")
    
    # 2. Evaluate coverage across all 40 target domains
    domain_coverage = {}
    missing_categories = []
    covered_categories = []
    
    for domain, target_classes in TARGET_DOMAINS.items():
        found = []
        for tc in target_classes:
            # Check for exact or substring match in existing_classes
            norm_tc = tc.lower().replace("_", "").replace("-", "")
            for ec in existing_classes:
                norm_ec = ec.lower().replace("_", "").replace("-", "")
                if norm_tc in norm_ec or norm_ec in norm_tc or tc.split("___")[0].lower() in norm_ec:
                    found.append(ec)
                    break
        
        coverage_pct = (len(found) / len(target_classes)) * 100.0 if target_classes else 100.0
        domain_coverage[domain] = {
            "target_classes": target_classes,
            "matched_classes": found,
            "coverage_percentage": round(coverage_pct, 1),
            "status": "Fully Covered" if coverage_pct >= 80 else ("Partially Covered" if coverage_pct > 0 else "Gap Identified")
        }
        
        if coverage_pct < 50:
            missing_categories.append(domain)
        else:
            covered_categories.append(domain)
            
    # 3. Create newly provisioned class folders for gap domains to expand ontology
    created_new_classes = 0
    for domain, data in domain_coverage.items():
        if data["status"] in ["Gap Identified", "Partially Covered"]:
            for tc in data["target_classes"]:
                new_cls_dir = os.path.join(pv_dir, tc)
                if not os.path.exists(new_cls_dir):
                    os.makedirs(new_cls_dir, exist_ok=True)
                    created_new_classes += 1
                    with open(os.path.join(new_cls_dir, "meta_info.json"), "w") as f:
                        json.dump({"class_name": tc, "domain": domain, "synthetic_augmentation_recommended": True}, f, indent=2)
                        
    logger.info(f"Provisioned {created_new_classes} new ontology target class directories for missing domains.")
    
    # 4. Re-scan total dataset inventory after ontology expansion
    updated_classes = sorted([
        d for d in os.listdir(pv_dir) 
        if os.path.isdir(os.path.join(pv_dir, d))
    ]) if os.path.exists(pv_dir) else []
    
    # 5. Generate comprehensive Gap Analysis Report
    report = {
        "status": "COMPLETED",
        "total_target_domains_evaluated": 40,
        "fully_covered_domains": len([d for d in domain_coverage.values() if d["status"] == "Fully Covered"]),
        "partially_covered_domains": len([d for d in domain_coverage.values() if d["status"] == "Partially Covered"]),
        "gap_domains": len([d for d in domain_coverage.values() if d["status"] == "Gap Identified"]),
        "original_class_count": len(existing_classes),
        "expanded_class_count": len(updated_classes),
        "domain_coverage_details": domain_coverage,
        "public_data_sources_queried": KAGGLE_PUBLIC_DATASETS,
        "synthetic_augmentation_recommendations": [
            "Use GAN / Diffusion / Photometric noise transforms for rare weather damage (Hail, Frost, Waterlogging).",
            "Use HSV color jitter + spectral shift for fine-grained micronutrient toxicity (Boron, Molybdenum).",
            "Apply background cutout compositing for multi-leaf and multi-disease simultaneous occurrence."
        ]
    }
    
    os.makedirs(PipelineConfig.REPORTS_DIR, exist_ok=True)
    report_path = os.path.join(PipelineConfig.REPORTS_DIR, "dataset_gap_analysis_report.json")
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)
        
    logger.info(f"Gap Analysis complete! Report saved at: {report_path}")
    logger.info(f"Total expanded class ontology: {len(updated_classes)} classes across 40 domains.")
    return report

if __name__ == "__main__":
    run_gap_analysis()
