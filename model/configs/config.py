import os

class PipelineConfig:
    # Directory paths
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    WORKSPACE_ROOT = os.path.dirname(BASE_DIR)
    
    PV_SRC = os.path.join(WORKSPACE_ROOT, "datasets", "plantvillage", "color")
    RICE_SRC = os.path.join(WORKSPACE_ROOT, "datasets", "RiceLeafDisease")
    COMBINED_DIR = os.path.join(WORKSPACE_ROOT, "datasets", "combined_dataset")
    
    # 5-Fold Stratified Cross-Validation directory
    FOLDS_DIR = os.path.join(COMBINED_DIR, "folds")
    
    SAVED_MODELS_DIR = os.path.join(BASE_DIR, "saved_models")
    REPORTS_DIR = os.path.join(BASE_DIR, "evaluation", "reports")
    TB_LOGS_DIR = os.path.join(BASE_DIR, "logs", "tb_logs")
    CLASSES_PATH = os.path.join(BASE_DIR, "classes.json")
    TENSORFLOW_MODEL_PATH = os.path.join(SAVED_MODELS_DIR, "best_model.keras")
    PYTORCH_MODEL_PATH = os.path.join(SAVED_MODELS_DIR, "best_model.pth")
    MODEL_BACKEND = "dual_pytorch"
    BEST_MODEL_PATH = PYTORCH_MODEL_PATH

    # Hyperparameters & Model settings (Full Training Mode)
    IMAGE_SIZE = (224, 224)
    INPUT_SHAPE = (224, 224, 3)
    BATCH_SIZE = 64
    EPOCHS = 15
    FINE_TUNE_EPOCHS = 25
    LEARNING_RATE = 1e-3
    FINE_TUNE_LR = 1e-5
    SEED = 42

    # Reproducibility settings
    REPRODUCIBILITY = True

    # Image Preprocessing & Segmentation parameters (Optimized for Ultra Fast Speed)
    USE_HSV_LEAF_SEGMENTATION = False
    HSV_GREEN_LOWER = [30, 35, 35]
    HSV_GREEN_UPPER = [90, 255, 255]

    # Advanced Optimizers & Training parameters
    OPTIMIZER = "AdamW"  # "AdamW", "Adam", "SGD"
    WEIGHT_DECAY = 1e-4
    LABEL_SMOOTHING = 0.1
    USE_EMA = True
    EMA_MOMENTUM = 0.99
    
    # Research Features: Attention mechanisms
    # Options: None, "se" (Squeeze-and-Excitation), "cbam" (Convolutional Block Attention Module)
    ATTENTION_MECHANISM = "se" 
    
    # Vision Transformer settings
    VIT_PATCH_SIZE = 16
    VIT_NUM_HEADS = 4
    VIT_TRANSFORMER_LAYERS = 2
    VIT_PROJECTION_DIM = 64
    
    # Schedulers
    # Options: "cosine", "onecycle"
    LR_SCHEDULER = "cosine"

    # Self-Supervised pretraining (SimCLR)
    RUN_SIMCLR_PRETRAINING = False # Comprehensive contrastive pretraining
    SIMCLR_EPOCHS = 5
    SIMCLR_PROJ_DIM = 128
    SIMCLR_TEMPERATURE = 0.1
    
    # Knowledge Distillation settings
    RUN_KNOWLEDGE_DISTILLATION = True
    DISTILL_TEMPERATURE = 3.0
    DISTILL_ALPHA = 0.7  # Teacher soft target weight vs. hard label target weight

    # Test-Time Augmentation (TTA)
    USE_TTA = True
    TTA_PASSES = 3  # Original, rot90, horizontal flip

    # Calibration & OOD parameters
    CALIBRATION_TEMPERATURE = 1.0
    OOD_ENTROPY_THRESHOLD = 10.0
    OOD_CONFIDENCE_THRESHOLD = 0.35
    CONFIDENCE_REJECTION_THRESHOLD = 0.35 # Under 35% returns "Low Confidence - Unsupported Image"


    # Models to compare
    ARCHITECTURES = ["MobileNetV3", "EfficientNetV2"]

    # Full Training Dataset Configuration
    MAX_SAMPLES_PER_CLASS = None 
    TEST_RATIO = 0.15 
 
