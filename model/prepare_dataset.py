import os
import argparse
import shutil
import random
import json

def main():
    parser = argparse.ArgumentParser(description="Prepare consolidated dataset from PlantVillage and RiceLeafDisease.")
    parser.add_argument("--max_samples", type=int, default=200, help="Maximum samples per class (set to 0 for unlimited).")
    args = parser.parse_args()
    
    pv_src = r"c:\AI Crop Disease Detection System\datasets\plantvillage\color"
    rice_src = r"c:\AI Crop Disease Detection System\datasets\RiceLeafDisease"
    dest_dir = r"c:\AI Crop Disease Detection System\datasets\combined_dataset"
    
    max_samples = None if args.max_samples <= 0 else args.max_samples
    
    if os.path.exists(dest_dir):
        print(f"Removing existing combined dataset at {dest_dir}...")
        try:
            shutil.rmtree(dest_dir)
        except Exception as e:
            print(f"Warning: could not fully clean combined_dataset directory: {e}")
            
    os.makedirs(dest_dir, exist_ok=True)
    
    # Process PlantVillage classes
    if not os.path.exists(pv_src):
        print(f"[ERROR] PlantVillage source folder not found at: {pv_src}")
        return
        
    pv_classes = [d for d in os.listdir(pv_src) if os.path.isdir(os.path.join(pv_src, d))]
    print(f"Found {len(pv_classes)} PlantVillage classes.")
    
    for cls in pv_classes:
        src_cls_dir = os.path.join(pv_src, cls)
        dest_cls_dir = os.path.join(dest_dir, cls)
        os.makedirs(dest_cls_dir, exist_ok=True)
        
        files = [f for f in os.listdir(src_cls_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        if max_samples:
            random.seed(42)
            files = random.sample(files, min(len(files), max_samples))
            
        print(f"Copying {len(files)} files for class: {cls}")
        for f in files:
            shutil.copy2(os.path.join(src_cls_dir, f), os.path.join(dest_cls_dir, f))
            
    # Process Rice classes
    if not os.path.exists(rice_src):
        print(f"[ERROR] RiceLeafDisease source folder not found at: {rice_src}")
        return
        
    rice_classes = {
        "Bacterial leaf blight": "Rice___Bacterial_leaf_blight",
        "Brown spot": "Rice___Brown_spot",
        "Leaf smut": "Rice___Leaf_smut"
    }
    
    for src_cls, dest_cls in rice_classes.items():
        src_cls_dir = os.path.join(rice_src, src_cls)
        dest_cls_dir = os.path.join(dest_dir, dest_cls)
        os.makedirs(dest_cls_dir, exist_ok=True)
        
        files = [f for f in os.listdir(src_cls_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        if max_samples:
            random.seed(42)
            files = random.sample(files, min(len(files), max_samples))
            
        print(f"Copying {len(files)} files for class: {dest_cls}")
        for f in files:
            shutil.copy2(os.path.join(src_cls_dir, f), os.path.join(dest_cls_dir, f))
            
    # Update classes.json
    all_classes = sorted(os.listdir(dest_dir))
    classes_json_path = r"c:\AI Crop Disease Detection System\model\classes.json"
    with open(classes_json_path, "w") as f:
        json.dump(all_classes, f, indent=2)
    print(f"Dataset preparation complete. Classes saved to classes.json. Total classes: {len(all_classes)}")

if __name__ == "__main__":
    main()

