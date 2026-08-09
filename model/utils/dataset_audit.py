"""
Agricultural Dataset Category Audit
Scans the entire datasets directory, compiles statistics, groups classes into 40 agricultural domains,
and generates JSON, CSV, and HTML reports.
"""
import os
import sys
import json
import time
import csv

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from model.configs.config import PipelineConfig

WORKSPACE = PipelineConfig.WORKSPACE_ROOT
DATASETS_DIR = os.path.join(WORKSPACE, "datasets")
COMBINED_DIR = PipelineConfig.COMBINED_DIR
REPORTS_DIR = PipelineConfig.REPORTS_DIR
CLASSES_PATH = PipelineConfig.CLASSES_PATH
VALID_EXTS = {'.jpg', '.jpeg', '.png', '.bmp', '.tif', '.tiff'}

DATASET_SOURCES_MAP = {
    "DeepWeeds": "JCU / DeepWeeds",
    "FruitQuality": "Kaggle (mbkinaci, amdatas)",
    "IP102": "IP102 Pest Dataset",
    "NutrientDeficiency": "Kaggle (ashishpatelresearch, guy007, baronn)",
    "PlantCLEF": "LifeCLEF / Kaggle (datajameson)",
    "PlantDoc": "PlantDoc Project",
    "PlantSeedlings": "Kaggle (vbookshelf)",
    "RiceDisease": "Kaggle (vbookshelf)",
    "RiceLeafDisease": "RiceLeafDisease Dataset",
    "plantvillage": "PlantVillage Color Dataset"
}

CATEGORIES_LIST = [
    "Fruit Diseases", "Vegetable Diseases", "Grain Diseases", "Leaf Diseases",
    "Stem Diseases", "Root Diseases", "Flower Diseases", "Fruit Quality",
    "Fruit Maturity", "Fruit Defects", "Healthy Plant Classes", "Pest Species",
    "Pest Life Stages", "Beneficial Insects", "Weed Species", "Nutrient Deficiencies",
    "Fertilizer Deficiencies", "Chemical Damage", "Herbicide Damage", "Pesticide Damage",
    "Soil Types", "Soil Moisture", "Soil Fertility", "Environmental Stress",
    "Weather Damage", "Disease Severity Levels", "Disease Growth Stages",
    "Multi-Disease Images", "Whole Plant Images", "Leaf Images", "Fruit Images",
    "Vegetable Images", "Seed Images", "Seedling Images", "Crop Growth Stages",
    "Canopy Images", "Drone/Aerial Images", "Field Images", "Mobile Camera Images",
    "Mixed Agricultural Images"
]


def get_dir_size_gb(path):
    total = 0
    for root, _, files in os.walk(path):
        for f in files:
            fp = os.path.join(root, f)
            if os.path.exists(fp):
                total += os.path.getsize(fp)
    return round(total / (1024**3), 3)


def get_image_count_and_classes(path):
    classes = 0
    images = 0
    for item in os.listdir(path):
        item_path = os.path.join(path, item)
        if os.path.isdir(item_path) and item != "folds":
            classes += 1
            images += len([f for f in os.listdir(item_path) if os.path.splitext(f)[1].lower() in VALID_EXTS])
    return classes, images


def categorize_class(cls_name):
    name = cls_name.lower().replace("_", " ").replace("-", " ").replace("___", " ")
    categories = []
    
    # 1. Fruit Diseases
    if any(x in name for x in ["apple", "blueberry", "cherry", "grape", "orange", "peach", "pear", "pomegranate", "guava", "mango", "strawberry", "raspberry", "plum"]) and not "healthy" in name:
        categories.append("Fruit Diseases")
        
    # 2. Vegetable Diseases
    if any(x in name for x in ["cabbage", "chilli", "chili", "potato", "squash", "tomato", "pepper", "onion", "eggplant", "cucumber", "pumpkin", "lettuce", "radish", "carrot", "broccoli", "cauliflower"]) and not "healthy" in name:
        categories.append("Vegetable Diseases")
        
    # 3. Grain Diseases
    if any(x in name for x in ["corn", "maize", "rice", "wheat", "soybean", "barley", "oat", "millet", "sorghum"]) and not "healthy" in name:
        categories.append("Grain Diseases")
        
    # 4. Leaf Diseases
    if any(x in name for x in ["leaf", "spot", "blight", "scab", "rust", "mildew", "scorch", "mold", "yellow", "blotch", "canker", "scald", "smut", "mosaic", "virus"]):
        categories.append("Leaf Diseases")
        
    # 5. Stem Diseases
    if any(x in name for x in ["stem", "borer", "wilt", "stalk", "canker"]):
        categories.append("Stem Diseases")
        
    # 6. Root Diseases
    if any(x in name for x in ["root", "damping", "wilt", "rot"]):
        categories.append("Root Diseases")
        
    # 7. Flower Diseases
    if any(x in name for x in ["flower", "blossom", "bud"]):
        categories.append("Flower Diseases")
        
    # 8. Fruit Quality
    if "quality" in name or "grading" in name or "grade" in name:
        categories.append("Fruit Quality")
        
    # 9. Fruit Maturity
    if any(x in name for x in ["maturity", "mature", "ripeness", "ripe", "unripe", "overripe"]):
        categories.append("Fruit Maturity")
        
    # 10. Fruit Defects
    if any(x in name for x in ["defect", "defective", "bruise", "bruised", "crack", "cracked", "sunburn", "bad", "damaged"]):
        categories.append("Fruit Defects")
        
    # 11. Healthy Plant Classes
    if "healthy" in name or "unaffected" in name or "normal" in name or "all absent" in name:
        categories.append("Healthy Plant Classes")
        
    # 12. Pest Species
    if "pest" in name or any(x in name for x in ["aphids", "armyworm", "beetle", "bollworm", "grasshopper", "mites", "mosquito", "sawfly", "stem borer", "whitefly", "caterpillar", "locust", "weevil", "bug", "fruitfly"]):
        categories.append("Pest Species")
        
    # 13. Pest Life Stages
    if any(x in name for x in ["larva", "egg", "nymph", "pupa", "adult"]):
        categories.append("Pest Life Stages")
        
    # 14. Beneficial Insects
    if any(x in name for x in ["bee", "ladybug", "pollinator"]):
        categories.append("Beneficial Insects")
        
    # 15. Weed Species
    if "weed" in name or any(x in name for x in ["chinee apple", "parkinsonia", "parthenium", "prickly acacia", "rubber vine", "siam weed", "snakeweed", "lantana", "charlock", "cleavers", "fat hen", "black grass", "loose silky bent", "scentless mayweed", "shepherd"]):
        categories.append("Weed Species")
        
    # 16. Nutrient Deficiencies
    if "deficiency" in name or any(x in name for x in ["nitrogen", "phosphorus", "potassium", "calcium", "magnesium", "iron", "zinc", "boron", "sulfur", "copper", "manganese", "molybdenum"]):
        categories.append("Nutrient Deficiencies")
        
    # 17. Fertilizer Deficiencies
    if "fertilizer" in name or "npk" in name:
        categories.append("Fertilizer Deficiencies")
        
    # 18. Chemical Damage
    if "chemical" in name or "chemical damage" in name:
        categories.append("Chemical Damage")
        
    # 19. Herbicide Damage
    if "herbicide" in name:
        categories.append("Herbicide Damage")
        
    # 20. Pesticide Damage
    if "pesticide" in name:
        categories.append("Pesticide Damage")
        
    # 21. Soil Types
    if "soil" in name or any(x in name for x in ["sandy", "clay", "loam", "peat", "silt"]):
        categories.append("Soil Types")
        
    # 22. Soil Moisture
    if "moisture" in name or "wet" in name or "dry" in name:
        categories.append("Soil Moisture")
        
    # 23. Soil Fertility
    if "fertility" in name:
        categories.append("Soil Fertility")
        
    # 24. Environmental Stress
    if "stress" in name or "drought" in name or "salinity" in name or "heat" in name or "cold" in name:
        categories.append("Environmental Stress")
        
    # 25. Weather Damage
    if any(x in name for x in ["frost", "wind", "hail", "storm"]):
        categories.append("Weather Damage")
        
    # 26. Disease Severity Levels
    if any(x in name for x in ["severe", "mild", "moderate"]):
        categories.append("Disease Severity Levels")
        
    # 27. Disease Growth Stages
    if "stage" in name and "disease" in name:
        categories.append("Disease Growth Stages")
        
    # 28. Multi-Disease Images
    if "multi" in name or "multiple" in name:
        categories.append("Multi-Disease Images")
        
    # 29. Whole Plant Images
    if any(x in name for x in ["whole", "bush", "tree", "shrub"]):
        categories.append("Whole Plant Images")
        
    # 30. Leaf Images
    if "leaf" in name or "leaves" in name or "scorch" in name or "spot" in name or "blight" in name or "mildew" in name or "rust" in name or "scab" in name:
        categories.append("Leaf Images")
        
    # 31. Fruit Images
    if "fruit" in name or any(x in name for x in ["apple", "banana", "orange", "mango", "grape", "cherry", "peach", "pomegranate", "guava", "strawberry", "raspberry", "plum"]):
        categories.append("Fruit Images")
        
    # 32. Vegetable Images
    if "vegetable" in name or any(x in name for x in ["cabbage", "tomato", "potato", "onion", "chilli", "pepper", "squash", "cucumber", "eggplant", "pumpkin"]):
        categories.append("Vegetable Images")
        
    # 33. Seed Images
    if "seed" in name or "seeds" in name:
        categories.append("Seed Images")
        
    # 34. Seedling Images
    if "seedling" in name or "seedlings" in name:
        categories.append("Seedling Images")
        
    # 35. Crop Growth Stages
    if "growth" in name or "stage" in name:
        categories.append("Crop Growth Stages")
        
    # 36. Canopy Images
    if "canopy" in name:
        categories.append("Canopy Images")
        
    # 37. Drone/Aerial Images
    if "drone" in name or "aerial" in name or "uav" in name:
        categories.append("Drone/Aerial Images")
        
    # 38. Field Images
    if "field" in name:
        categories.append("Field Images")
        
    # 39. Mobile Camera Images
    if "mobile" in name or "phone" in name or "handheld" in name:
        categories.append("Mobile Camera Images")
        
    # 40. Mixed Agricultural Images
    if len(categories) == 0:
        categories.append("Mixed Agricultural Images")
        
    return categories


def main():
    print("=" * 70)
    print("AGRICULTURAL DATASET AUDIT AND VERIFICATION")
    print("=" * 70)
    
    os.makedirs(REPORTS_DIR, exist_ok=True)
    
    # 1. Audit individual datasets
    datasets_audited = {}
    total_raw_storage = 0
    
    for item in sorted(os.listdir(DATASETS_DIR)):
        item_path = os.path.join(DATASETS_DIR, item)
        if os.path.isdir(item_path) and item != "combined_dataset":
            size_gb = get_dir_size_gb(item_path)
            classes, images = get_image_count_and_classes(item_path)
            source = DATASET_SOURCES_MAP.get(item, "Public Repository")
            
            datasets_audited[item] = {
                "name": item,
                "source": source,
                "storage_path": item_path,
                "classes_count": classes,
                "images_count": images,
                "size_gb": size_gb
            }
            total_raw_storage += size_gb
            print(f"Dataset: {item}")
            print(f"  Source: {source}")
            print(f"  Path: {item_path}")
            print(f"  Classes: {classes} | Images: {images:,} | Size: {size_gb:.3f} GB\n")

    # 2. Audit combined dataset and update classes.json
    combined_classes = sorted([c for c in os.listdir(COMBINED_DIR) if os.path.isdir(os.path.join(COMBINED_DIR, c)) and c != "folds"])
    
    with open(CLASSES_PATH, "w") as fp:
        json.dump(combined_classes, fp, indent=2)
    print(f"Synchronized {len(combined_classes)} active classes to model/classes.json.\n")
    
    class_distribution = {}
    total_combined_images = 0
    under_200_count = 0
    under_500_count = 0
    
    for cls in combined_classes:
        cls_dir = os.path.join(COMBINED_DIR, cls)
        count = len([f for f in os.listdir(cls_dir) if os.path.splitext(f)[1].lower() in VALID_EXTS])
        class_distribution[cls] = count
        total_combined_images += count
        if count < 200:
            under_200_count += 1
        if count < 500:
            under_500_count += 1

    # 3. Categorize into 40 domains
    category_summary = {}
    for cat in CATEGORIES_LIST:
        category_summary[cat] = {
            "datasets_included": [],
            "classes": [],
            "images_count": 0,
            "status": "Missing"
        }

    for cls, count in class_distribution.items():
        categories = categorize_class(cls)
        
        # Determine originating dataset
        orig_dataset = "Unknown"
        for ds_name, ds_info in datasets_audited.items():
            ds_path = os.path.join(DATASETS_DIR, ds_name, cls)
            if os.path.exists(ds_path):
                orig_dataset = ds_name
                break
                
        for cat in categories:
            if orig_dataset not in category_summary[cat]["datasets_included"] and orig_dataset != "Unknown":
                category_summary[cat]["datasets_included"].append(orig_dataset)
            category_summary[cat]["classes"].append(cls)
            category_summary[cat]["images_count"] += count

    # Determine status for each category
    missing_categories_count = 0
    for cat, info in category_summary.items():
        cls_len = len(info["classes"])
        img_len = info["images_count"]
        
        if cls_len > 10 and img_len > 1000:
            info["status"] = "Available"
        elif cls_len > 0:
            info["status"] = "Partially Available"
        else:
            info["status"] = "Missing"
            missing_categories_count += 1

    # Write class_distribution.csv
    csv_path = os.path.join(REPORTS_DIR, "class_distribution.csv")
    with open(csv_path, "w", newline="") as fp:
        writer = csv.writer(fp)
        writer.writerow(["Class Name", "Image Count"])
        for cls, count in sorted(class_distribution.items()):
            writer.writerow([cls, count])

    # Write dataset_category_summary.json
    summary_path = os.path.join(REPORTS_DIR, "dataset_category_summary.json")
    with open(summary_path, "w") as fp:
        json.dump(category_summary, fp, indent=2)

    # 4. Generate HTML Completeness Report
    html_path = os.path.join(REPORTS_DIR, "dataset_completeness_report.html")
    
    category_rows = ""
    for cat in CATEGORIES_LIST:
        info = category_summary[cat]
        datasets_str = ", ".join(info["datasets_included"]) if info["datasets_included"] else "None"
        status_cls = info["status"].lower().replace(" ", "-")
        category_rows += f"""
        <tr>
            <td style="font-weight: bold;">{cat}</td>
            <td>{datasets_str}</td>
            <td>{len(info["classes"]):,}</td>
            <td>{info["images_count"]:,}</td>
            <td><span class="status-badge status-{status_cls}">{info["status"]}</span></td>
        </tr>
        """
        
    html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Agricultural Dataset Category Audit & Completeness Report</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8fafc;
            color: #334155;
            margin: 0;
            padding: 40px;
        }}
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background: #ffffff;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        }}
        h1 {{
            color: #0f172a;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 15px;
            margin-top: 0;
        }}
        h2 {{
            color: #1e293b;
            margin-top: 40px;
        }}
        .grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }}
        .card {{
            background: #f1f5f9;
            padding: 20px;
            border-radius: 8px;
            border-left: 5px solid #3b82f6;
        }}
        .card.card-success {{
            border-left-color: #10b981;
        }}
        .card.card-warning {{
            border-left-color: #f59e0b;
        }}
        .card-title {{
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #64748b;
            margin-bottom: 5px;
        }}
        .card-value {{
            font-size: 1.875rem;
            font-weight: bold;
            color: #0f172a;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }}
        th, td {{
            text-align: left;
            padding: 12px 16px;
            border-bottom: 1px solid #e2e8f0;
        }}
        th {{
            background-color: #f8fafc;
            color: #475569;
            font-weight: 600;
        }}
        .status-badge {{
            padding: 4px 8px;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: bold;
            text-transform: uppercase;
        }}
        .status-available {{
            background-color: #d1fae5;
            color: #065f46;
        }}
        .status-partially-available {{
            background-color: #fef3c7;
            color: #92400e;
        }}
        .status-missing {{
            background-color: #fee2e2;
            color: #991b1b;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>Agricultural Dataset Category Audit</h1>
        <p>Generated on: {time.strftime("%Y-%m-%d %H:%M:%S")} (Local Time)</p>
        
        <div class="grid">
            <div class="card card-success">
                <div class="card-title">Total Datasets Audited</div>
                <div class="card-value">{len(datasets_audited)}</div>
            </div>
            <div class="card card-success">
                <div class="card-title">Total Classes</div>
                <div class="card-value">{len(combined_classes):,}</div>
            </div>
            <div class="card card-success">
                <div class="card-title">Total Images</div>
                <div class="card-value">{total_combined_images:,}</div>
            </div>
            <div class="card card-success">
                <div class="card-title">Combined Storage Used</div>
                <div class="card-value">{get_dir_size_gb(COMBINED_DIR):.3f} GB</div>
            </div>
        </div>

        <div class="grid">
            <div class="card card-warning">
                <div class="card-title">Categories Covered</div>
                <div class="card-value">{len(CATEGORIES_LIST) - missing_categories_count} / {len(CATEGORIES_LIST)}</div>
            </div>
            <div class="card card-warning">
                <div class="card-title">Classes with &lt; 200 Images</div>
                <div class="card-value">{under_200_count}</div>
            </div>
            <div class="card card-warning">
                <div class="card-title">Classes with &lt; 500 Images</div>
                <div class="card-value">{under_500_count}</div>
            </div>
        </div>

        <h2>Agricultural Categories Completeness Matrix</h2>
        <table>
            <thead>
                <tr>
                    <th>Category Name</th>
                    <th>Datasets Included</th>
                    <th>Classes</th>
                    <th>Images</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {category_rows}
            </tbody>
        </table>
    </div>
</body>
</html>
"""

    with open(html_path, "w", encoding="utf-8") as fp:
        fp.write(html_content)

    # 5. Output console summary tables
    print("=" * 70)
    print("AGRICULTURAL CATEGORIES COMPLETENESS MATRIX")
    print("=" * 70)
    for cat in CATEGORIES_LIST:
        info = category_summary[cat]
        datasets_str = ", ".join(info["datasets_included"]) if info["datasets_included"] else "None"
        print(f"Category Name:        {cat}")
        print(f"Datasets Included:    {datasets_str}")
        print(f"Classes:              {len(info['classes']):,}")
        print(f"Images:               {info['images_count']:,}")
        print(f"Status:               {info['status']}")
        print("-" * 50)

    print("\n" + "=" * 70)
    print("FINAL SUMMARY REPORT")
    print("=" * 70)
    print(f"• Total datasets downloaded:         {len(datasets_audited)}")
    print(f"• Total agricultural categories:     {len(CATEGORIES_LIST) - missing_categories_count} / {len(CATEGORIES_LIST)} covered")
    print(f"• Total active classes:              {len(combined_classes)}")
    print(f"• Total images:                      {total_combined_images:,}")
    print(f"• Total raw storage used:            {total_raw_storage:.3f} GB")
    print(f"• Combined dataset storage used:     {get_dir_size_gb(COMBINED_DIR):.3f} GB")
    print(f"• Missing categories:                {missing_categories_count}")
    print(f"• Classes with fewer than 200 images: {under_200_count}")
    print(f"• Classes with fewer than 500 images: {under_500_count}")
    print("=" * 70)


if __name__ == "__main__":
    main()
