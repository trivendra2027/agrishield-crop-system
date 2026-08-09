import threading
import cv2
import numpy as np
import tensorflow as tf
from model.configs.config import PipelineConfig

_py_loader_lock = threading.Lock()

def apply_advanced_enhancements(img_bgr):
    """Executes HSV segmentation, Gray-World WB, Bilateral Denoising, Gamma correction, and LAB-CLAHE contrast normalization."""
    # 1. HSV Leaf Segmentation (Isolate leaf structure)
    if PipelineConfig.USE_HSV_LEAF_SEGMENTATION:
        hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
        lower_green = np.array(PipelineConfig.HSV_GREEN_LOWER)
        upper_green = np.array(PipelineConfig.HSV_GREEN_UPPER)
        mask = cv2.inRange(hsv, lower_green, upper_green)
        
        # Clean up morphological noise
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
        
        # Mask image
        img_bgr = cv2.bitwise_and(img_bgr, img_bgr, mask=mask)

    # 2. Gray-World White Balance Correction
    avg_b = np.mean(img_bgr[:, :, 0])
    avg_g = np.mean(img_bgr[:, :, 1])
    avg_r = np.mean(img_bgr[:, :, 2])
    avg_gray = (avg_b + avg_g + avg_r) / 3.0
    
    k_b = avg_gray / avg_b if avg_b > 0 else 1.0
    k_g = avg_gray / avg_g if avg_g > 0 else 1.0
    k_r = avg_gray / avg_r if avg_r > 0 else 1.0
    
    img_wb = img_bgr.copy().astype(np.float32)
    img_wb[:, :, 0] *= k_b
    img_wb[:, :, 1] *= k_g
    img_wb[:, :, 2] *= k_r
    img_wb = np.clip(img_wb, 0, 255).astype(np.uint8)

    # 3. Bilateral Edge-Preserving Denoising
    denoised = cv2.bilateralFilter(img_wb, d=5, sigmaColor=50, sigmaSpace=50)

    # 4. Adaptive Gamma Correction
    gray = cv2.cvtColor(denoised, cv2.COLOR_BGR2GRAY)
    mean_int = np.mean(gray)
    gamma = 1.0
    if mean_int < 90:
        gamma = 0.65  # Brighten
    elif mean_int > 160:
        gamma = 1.35  # Darken
        
    if gamma != 1.0:
        inv_gamma = 1.0 / gamma
        table = np.array([((i / 255.0) ** inv_gamma) * 255 for i in np.arange(0, 256)]).astype("uint8")
        denoised = cv2.LUT(denoised, table)

    # 5. LAB-CLAHE Contrast Enhancement
    lab = cv2.cvtColor(denoised, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    cl = clahe.apply(l)
    merged = cv2.merge((cl, a, b))
    enhanced_rgb = cv2.cvtColor(merged, cv2.COLOR_LAB2RGB)
    
    return enhanced_rgb

def load_and_preprocess_image(file_path, label):
    """tf.data image loader using OpenCV advanced enhancements."""
    def _py_loader(path_tensor):
        with _py_loader_lock:
            path_str = path_tensor.numpy().decode('utf-8')
            img_bgr = cv2.imread(path_str)
            if img_bgr is None:
                # Fallback blank image
                enhanced = np.zeros(PipelineConfig.INPUT_SHAPE, dtype=np.uint8)
            else:
                enhanced = apply_advanced_enhancements(img_bgr)
                enhanced = cv2.resize(enhanced, PipelineConfig.IMAGE_SIZE)
                
            return enhanced.astype(np.float32) / 255.0

    img_tensor = tf.py_function(_py_loader, [file_path], tf.float32)
    img_tensor.set_shape(PipelineConfig.INPUT_SHAPE)
    return img_tensor, label

def augment_image(image, label):
    """TensorFlow operations for data augmentation (rotations, flips, zoom, noise)."""
    # 1. Random Flips
    image = tf.image.random_flip_left_right(image)
    image = tf.image.random_flip_up_down(image)
    
    # 2. Random Brightness & Contrast
    image = tf.image.random_brightness(image, max_delta=0.15)
    image = tf.image.random_contrast(image, lower=0.85, upper=1.15)
    
    # 3. Saturation Adjustment
    image = tf.image.random_saturation(image, lower=0.85, upper=1.15)
    
    # 4. Zoom & Crop
    pad_h = int(PipelineConfig.IMAGE_SIZE[0] * 0.1)
    pad_w = int(PipelineConfig.IMAGE_SIZE[1] * 0.1)
    image = tf.image.resize_with_crop_or_pad(
        image, 
        PipelineConfig.IMAGE_SIZE[0] + pad_h, 
        PipelineConfig.IMAGE_SIZE[1] + pad_w
    )
    image = tf.image.random_crop(image, size=PipelineConfig.INPUT_SHAPE)
    
    # 5. Gaussian Noise Addition
    noise = tf.random.normal(shape=tf.shape(image), mean=0.0, stddev=0.03, dtype=tf.float32)
    image = image + noise
    image = tf.clip_by_value(image, 0.0, 1.0)
    
    # 6. Advanced Field-Condition Shadow Simulation
    if tf.random.uniform([]) > 0.5:
        mask_type = tf.random.uniform([], 0, 2, dtype=tf.int32)
        if mask_type == 0:
            boundary = tf.random.uniform([], 0.2, 0.8)
            grid = tf.linspace(0.0, 1.0, PipelineConfig.IMAGE_SIZE[0])
            shadow_mask = tf.cast(grid[:, tf.newaxis, tf.newaxis] < boundary, tf.float32)
        else:
            boundary = tf.random.uniform([], 0.2, 0.8)
            grid = tf.linspace(0.0, 1.0, PipelineConfig.IMAGE_SIZE[1])
            shadow_mask = tf.cast(grid[tf.newaxis, :, tf.newaxis] < boundary, tf.float32)
        
        factor = tf.random.uniform([], 0.5, 0.85)
        image = image * (1.0 - shadow_mask * (1.0 - factor))
        
    # 7. Focus Blur Simulation
    if tf.random.uniform([]) > 0.7:
        pooled = tf.nn.avg_pool2d(tf.expand_dims(image, axis=0), ksize=3, strides=1, padding='SAME')
        image = tf.squeeze(pooled, axis=0)

    # 8. Occlusion / Cutout Simulation
    if tf.random.uniform([]) > 0.5:
        h, w = PipelineConfig.IMAGE_SIZE
        occ_h = tf.random.uniform([], int(h*0.1), int(h*0.3), dtype=tf.int32)
        occ_w = tf.random.uniform([], int(w*0.1), int(w*0.3), dtype=tf.int32)
        y = tf.random.uniform([], 0, h - occ_h, dtype=tf.int32)
        x = tf.random.uniform([], 0, w - occ_w, dtype=tf.int32)
        mask_y = tf.cast(tf.range(h)[:, tf.newaxis] >= y, tf.float32) * tf.cast(tf.range(h)[:, tf.newaxis] < y + occ_h, tf.float32)
        mask_x = tf.cast(tf.range(w)[tf.newaxis, :] >= x, tf.float32) * tf.cast(tf.range(w)[tf.newaxis, :] < x + occ_w, tf.float32)
        mask = mask_y * mask_x
        image = image * (1.0 - mask[..., tf.newaxis])

    # 9. Dust/Rain Streaks Simulation
    if tf.random.uniform([]) > 0.8:
        streaks = tf.random.uniform(shape=tf.shape(image), minval=0.0, maxval=0.15)
        image = tf.clip_by_value(image + streaks, 0.0, 1.0)
        
    return image, label

def create_tf_dataset(image_paths, labels, batch_size, augment=False, shuffle=False):
    """Create optimized tf.data.Dataset pipeline with caching, prefetching, and parallel maps."""
    dataset = tf.data.Dataset.from_tensor_slices((image_paths, labels))
    
    if shuffle:
        dataset = dataset.shuffle(buffer_size=len(image_paths), seed=PipelineConfig.SEED if PipelineConfig.REPRODUCIBILITY else None)
        
    dataset = dataset.map(load_and_preprocess_image, num_parallel_calls=tf.data.AUTOTUNE)
    
    if augment:
        dataset = dataset.map(augment_image, num_parallel_calls=tf.data.AUTOTUNE)
        
    dataset = dataset.batch(batch_size)
    dataset = dataset.prefetch(buffer_size=tf.data.AUTOTUNE)
    return dataset
