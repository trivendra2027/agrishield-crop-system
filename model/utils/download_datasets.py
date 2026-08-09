import os
import sys
import hashlib
import json
import logging
from PIL import Image
import cv2

# Set path configuration
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from model.configs.config import PipelineConfig

logger = logging.getLogger("Dataset_Downloader")
if not logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter('[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s'))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

def compute_md5(file_path):
    """Compute the MD5 hash of a file's content to identify duplicates."""
    hash_md5 = hashlib.md5()
    try:
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
    except Exception:
        return None

def verify_and_clean_image(file_path):
    """Verify if the image file is corrupted or of extremely low quality."""
    try:
        # Check standard opening
        with Image.open(file_path) as img:
            img.verify()
        
        # Reload for reading size and channels
        img_bgr = cv2.imread(file_path)
        if img_bgr is None or img_bgr.size == 0:
            return False, "cv2 failed to load"
            
        h, w, c = img_bgr.shape
        if h < 64 or w < 64:
            return False, "Resolution too low"
            
        return True, "OK"
    except Exception as e:
        return False, str(e)

def download_from_kaggle(dataset_ref, dest_dir):
    """Downloads dataset from Kaggle automatically."""
    try:
        import kagglehub
        logger.info(f"Downloading {dataset_ref} using kagglehub...")
        path = kagglehub.dataset_download(dataset_ref)
        logger.info(f"Downloaded {dataset_ref} to: {path}")
        return path
    except Exception as e:
        logger.warning(f"Failed to download {dataset_ref} using kagglehub: {e}")
        return None

def run_dataset_pipeline(verify_only=False):
    """
    Search, verify, clean, merge and deduplicate agricultural datasets.
    """
    logger.info("Initializing dataset pipeline...")
    
    pv_dir = PipelineConfig.PV_SRC
    rice_dir = PipelineConfig.RICE_SRC
    
    # 1. Download datasets if missing and not verify_only
    if not verify_only:
        if not os.path.exists(pv_dir):
            logger.info("PlantVillage dataset is missing. Attempting Kaggle download...")
            downloaded_path = download_from_kaggle("arjuntejaswi/plantvillage-dataset", pv_dir)
            if downloaded_path and os.path.exists(downloaded_path):
                # Copy or symlink files if needed, or update configs path
                pass
        
        if not os.path.exists(rice_dir):
            logger.info("RiceLeafDisease dataset is missing. Attempting Kaggle download...")
            download_from_kaggle("vbookshelf/rice-leaf-diseases", rice_dir)

    # 2. Check and clean directories
    all_files = []
    for root_dir in [pv_dir, rice_dir]:
        if not os.path.exists(root_dir):
            logger.warning(f"Source directory does not exist: {root_dir}")
            continue
            
        logger.info(f"Scanning directory: {root_dir}")
        for root, _, files in os.walk(root_dir):
            for f in files:
                if f.lower().endswith(('.jpg', '.jpeg', '.png')):
                    all_files.append(os.path.join(root, f))
                    
    logger.info(f"Total images scanned for cleaning/deduplication: {len(all_files)}")
    
    # 3. Clean corrupted and deduplicate
    hashes = {}
    corrupted_count = 0
    duplicate_count = 0
    cleaned_files = []
    
    for f in all_files:
        is_ok, reason = verify_and_clean_image(f)
        if not is_ok:
            logger.info(f"Removing corrupted/low-quality image: {f} (Reason: {reason})")
            try:
                os.remove(f)
            except Exception:
                pass
            corrupted_count += 1
            continue
            
        md5 = compute_md5(f)
        if md5:
            if md5 in hashes:
                logger.info(f"Removing duplicate image: {f} (Matches: {hashes[md5]})")
                try:
                    os.remove(f)
                except Exception:
                    pass
                duplicate_count += 1
                continue
            else:
                hashes[md5] = f
                
        cleaned_files.append(f)
        
    logger.info(f"Dataset verification complete. Corrupted removed: {corrupted_count}, Duplicates removed: {duplicate_count}, Clean samples: {len(cleaned_files)}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--verify_only", action="store_true", help="Only verify existing datasets without downloading")
    args = parser.parse_args()
    
    run_dataset_pipeline(verify_only=args.verify_only)
