"""
Agriculture-Vision Dataset Downloader & Integrator
Downloads the Agriculture-Vision dataset (21GB, 6 anomaly classes)
from AWS S3 direct URL, verifies, deduplicates, and merges into combined_dataset.
"""
import os
import sys
import json
import time
import hashlib
import logging
import shutil
import requests
import tarfile
from tqdm import tqdm
from PIL import Image

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from model.configs.config import PipelineConfig

logger = logging.getLogger("AgriVision_Downloader")
if not logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter('[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s'))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

WORKSPACE = PipelineConfig.WORKSPACE_ROOT
PROGRESS_LOG = os.path.join(WORKSPACE, "dataset_download_progress.log")
AV_DIR = os.path.join(WORKSPACE, "datasets", "AgricultureVision")
COMBINED_DIR = PipelineConfig.COMBINED_DIR
REPORTS_DIR = PipelineConfig.REPORTS_DIR
CLASSES_PATH = PipelineConfig.CLASSES_PATH
VALID_EXTS = {'.jpg', '.jpeg', '.png', '.bmp', '.tif', '.tiff'}


def log(msg):
    ts = time.strftime("[%Y-%m-%d %H:%M:%S]")
    line = f"{ts} {msg}\n"
    with open(PROGRESS_LOG, "a", encoding="utf-8") as f:
        f.write(line)
    logger.info(msg)


def md5(path):
    h = hashlib.md5()
    try:
        with open(path, "rb") as f:
            for chunk in iter(lambda: f.read(8192), b""):
                h.update(chunk)
        return h.hexdigest()
    except Exception:
        return None


def verify_image(path):
    try:
        with Image.open(path) as img:
            img.verify()
        return True
    except Exception:
        return False


def download_robust(url, dest_path):
    """Download a file with resume support using requests."""
    headers = {}
    if os.path.exists(dest_path):
        downloaded = os.path.getsize(dest_path)
        headers["Range"] = f"bytes={downloaded}-"
    else:
        downloaded = 0

    response = requests.get(url, headers=headers, stream=True)
    
    if response.status_code == 416: # Range not satisfiable (already fully downloaded)
        log(f"Already downloaded: {dest_path}")
        return True
    elif response.status_code not in (200, 206):
        log(f"Download failed with status: {response.status_code}")
        return False

    total_size = int(response.headers.get("content-length", 0)) + downloaded
    mode = "ab" if downloaded > 0 else "wb"
    
    log(f"Starting/Resuming download of {os.path.basename(dest_path)} ({total_size / (1024**3):.2f} GB)")
    
    with open(dest_path, mode) as f, tqdm(
        desc=os.path.basename(dest_path),
        initial=downloaded,
        total=total_size,
        unit='iB',
        unit_scale=True,
        unit_divisor=1024,
    ) as bar:
        for data in response.iter_content(chunk_size=1024 * 1024): # 1MB chunks
            size = f.write(data)
            bar.update(size)
    
    return True


def download_from_aws():
    """Download from direct AWS S3 URL."""
    raw_dir = os.path.join(AV_DIR, "raw")
    os.makedirs(raw_dir, exist_ok=True)
    
    url = "https://intelinair-data-releases.s3.amazonaws.com/agriculture-vision/cvpr_challenge_2021/supervised/Agriculture-Vision-2021.tar.gz"
    local_path = os.path.join(raw_dir, "Agriculture-Vision-2021.tar.gz")
    
    if not download_robust(url, local_path):
        return None
        
    # Only extract if we haven't already
    extracted_marker = os.path.join(raw_dir, ".extracted")
    if not os.path.exists(extracted_marker):
        log(f"Extracting {local_path}...")
        try:
            with tarfile.open(local_path, 'r:gz') as tar:
                tar.extractall(raw_dir)
            with open(extracted_marker, 'w') as f:
                f.write("done")
            log("Extraction complete.")
        except Exception as e:
            log(f"Extraction error: {e}")
            return None
            
    return raw_dir


def integrate(dl_root):
    os.makedirs(COMBINED_DIR, exist_ok=True)

    # Pre-hash existing combined images
    seen = set()
    log("Pre-hashing existing combined_dataset images for dedup...")
    hash_count = 0
    hash_start = time.time()
    for root, _, files in os.walk(COMBINED_DIR):
        for f in files:
            if os.path.splitext(f)[1].lower() in VALID_EXTS:
                h = md5(os.path.join(root, f))
                if h:
                    seen.add(h)
                hash_count += 1
                if hash_count % 10000 == 0:
                    log(f"  Pre-hashed {hash_count:,} images so far...")
    log(f"Pre-hashed {len(seen):,} existing images in {round(time.time()-hash_start)}s.")

    # Load current classes
    existing_classes = []
    if os.path.exists(CLASSES_PATH):
        with open(CLASSES_PATH) as fp:
            existing_classes = json.load(fp)
    existing_set = set(existing_classes)

    new_classes_added = []
    total_added = 0
    total_corrupt = 0
    total_dup = 0
    start = time.time()
    last_report = start

    # Find all image-containing directories
    class_dirs = []
    for root, dirs, files in os.walk(dl_root):
        img_files = [f for f in files if os.path.splitext(f)[1].lower() in VALID_EXTS]
        if img_files and len(img_files) >= 3:
            class_dirs.append((root, img_files))

    total_cls = len(class_dirs)
    log(f"Found {total_cls} image-containing folders in Agriculture-Vision download.")

    cls_processed = 0
    for cls_root, img_files in class_dirs:
        cls_processed += 1
        folder_name = os.path.basename(cls_root).replace(" ", "_")

        # Map known Agriculture-Vision label names
        name_lower = folder_name.lower()
        if "cloud" in name_lower and "shadow" in name_lower:
            cls_name = "Cloud_Shadow"
        elif "double" in name_lower and "plant" in name_lower:
            cls_name = "Double_Plant"
        elif "planter" in name_lower and "skip" in name_lower:
            cls_name = "Planter_Skip"
        elif "standing" in name_lower and "water" in name_lower:
            cls_name = "Standing_Water"
        elif "waterway" in name_lower:
            cls_name = "Waterway"
        elif "weed" in name_lower and "cluster" in name_lower:
            cls_name = "Weed_Cluster"
        else:
            parent = os.path.basename(os.path.dirname(cls_root))
            if parent.lower() in ('images', 'rgb', 'nir', 'train', 'val', 'test'):
                cls_name = f"AgriVision_{folder_name}"
            else:
                cls_name = folder_name

        av_cls = os.path.join(AV_DIR, cls_name)
        combined_cls = os.path.join(COMBINED_DIR, cls_name)
        os.makedirs(av_cls, exist_ok=True)
        os.makedirs(combined_cls, exist_ok=True)

        if cls_name not in existing_set:
            new_classes_added.append(cls_name)
            existing_classes.append(cls_name)
            existing_set.add(cls_name)

        cls_added = 0
        for fname in img_files:
            src = os.path.join(cls_root, fname)
            if not verify_image(src):
                total_corrupt += 1
                continue
            h = md5(src)
            if h and h in seen:
                total_dup += 1
                continue
            if h:
                seen.add(h)

            dst_av = os.path.join(av_cls, fname)
            dst_cb = os.path.join(combined_cls, fname)
            if not os.path.exists(dst_av):
                shutil.copy2(src, dst_av)
            if not os.path.exists(dst_cb):
                shutil.copy2(src, dst_cb)
            cls_added += 1
            total_added += 1

        now = time.time()
        if now - last_report >= 120 or cls_processed == total_cls:
            pct = round(cls_processed / max(1, total_cls) * 100, 1)
            elapsed = round((now - start) / 60, 1)
            log(f"\n{'='*60}\n"
                f"AGRICULTURE-VISION PROGRESS\n"
                f"{'='*60}\n"
                f"• Progress: {pct}% ({cls_processed}/{total_cls})\n"
                f"• Images verified: {total_added:,}\n"
                f"• Corrupted: {total_corrupt}\n"
                f"• Duplicates: {total_dup}\n"
                f"• Latest: {cls_name} (+{cls_added})\n"
                f"• Elapsed: {elapsed} min\n"
                f"{'='*60}\n")
            last_report = now

    return new_classes_added, total_added, total_corrupt, total_dup


def update_reports(new_classes, images_added):
    os.makedirs(REPORTS_DIR, exist_ok=True)
    all_classes = []
    if os.path.exists(CLASSES_PATH):
        with open(CLASSES_PATH) as fp:
            all_classes = json.load(fp)

    class_counts = {}
    total_images = 0
    for cls in sorted(os.listdir(COMBINED_DIR)):
        p = os.path.join(COMBINED_DIR, cls)
        if os.path.isdir(p) and cls != "folds":
            n = len([f for f in os.listdir(p) if os.path.splitext(f)[1].lower() in VALID_EXTS])
            class_counts[cls] = n
            total_images += n

    active = [c for c, n in class_counts.items() if n > 0]
    missing = [c for c in all_classes if class_counts.get(c, 0) == 0]
    completeness = round(len(active) / max(1, len(all_classes)) * 100, 1)

    with open(os.path.join(REPORTS_DIR, "dataset_inventory.json"), "w") as fp:
        json.dump({"total_ontology_classes": len(all_classes), "completed_classes": len(active),
                    "missing_classes_count": len(missing), "total_images_retained": total_images,
                    "completeness_score_pct": completeness}, fp, indent=2)

    with open(os.path.join(REPORTS_DIR, "dataset_statistics.json"), "w") as fp:
        json.dump({"total_classes": len(active), "total_images": total_images,
                    "empty_classes": len(missing), "new_from_agrivision": len(new_classes),
                    "images_from_agrivision": images_added}, fp, indent=2)

    sources_path = os.path.join(REPORTS_DIR, "dataset_sources.json")
    sources = {"sources": []}
    if os.path.exists(sources_path):
        with open(sources_path) as fp:
            sources = json.load(fp)
    if not any("Agriculture" in (s.get("name", s) if isinstance(s, dict) else s) for s in sources["sources"]):
        sources["sources"].append({"name": "Agriculture-Vision Dataset", "type": "AWS / Academic",
                                    "classes": 6, "images": images_added, "status": "Active & Verified"})
    with open(sources_path, "w") as fp:
        json.dump(sources, fp, indent=2)

    with open(os.path.join(REPORTS_DIR, "missing_classes.json"), "w") as fp:
        json.dump(missing, fp, indent=2)
    with open(CLASSES_PATH, "w") as fp:
        json.dump(sorted(set(all_classes)), fp, indent=2)
    return total_images, len(active), completeness


def main():
    log("=" * 70)
    log("AGRICULTURE-VISION DATASET DOWNLOAD & INTEGRATION — START")
    log("=" * 70)
    t0 = time.time()
    os.makedirs(AV_DIR, exist_ok=True)

    dl_path = download_from_aws()
    if not dl_path:
        log("ERROR: Could not download Agriculture-Vision. Aborting.")
        return

    new_classes, added, corrupt, dups = integrate(dl_path)

    av_size = sum(os.path.getsize(os.path.join(root, f)) for root, _, files in os.walk(AV_DIR) for f in files)
    av_size_gb = round(av_size / (1024**3), 2)
    total_imgs, total_cls, completeness = update_reports(new_classes, added)
    elapsed = round((time.time() - t0) / 60, 1)

    summary = (
        f"\n{'='*70}\n"
        f"AGRICULTURE-VISION INTEGRATION — COMPLETE\n"
        f"{'='*70}\n"
        f"• New classes added:                   {len(new_classes)}\n"
        f"• Total images downloaded & verified:  {added:,}\n"
        f"• Corrupted images removed:            {corrupt}\n"
        f"• Duplicate images skipped:            {dups}\n"
        f"• AgriVision storage used:             {av_size_gb} GB\n"
        f"• Storage location:                    datasets/AgricultureVision/\n"
        f"• Updated total images in dataset:     {total_imgs:,}\n"
        f"• Updated total active classes:        {total_cls}\n"
        f"• Dataset completeness:                {completeness}%\n"
        f"• Elapsed time:                        {elapsed} min\n"
        f"{'='*70}\n"
    )
    if new_classes:
        summary += "\nNew classes added:\n"
        for i, c in enumerate(new_classes, 1):
            summary += f"  {i}. {c}\n"
    log(summary)


if __name__ == "__main__":
    main()
