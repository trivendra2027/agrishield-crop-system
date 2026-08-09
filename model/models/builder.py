import tensorflow as tf
from tensorflow.keras import layers, models
from model.configs.config import PipelineConfig
from model.models.attention import squeeze_and_excitation_block, cbam_block
from model.models.vit import build_vit_model
from model.utils.logger import get_logger

logger = get_logger("Model_Builder")

def setup_mixed_precision():
    """Configure mixed precision training policy for compatible GPU acceleration."""
    gpus = tf.config.list_physical_devices('GPU')
    if gpus:
        try:
            policy = tf.keras.mixed_precision.Policy('mixed_float16')
            tf.keras.mixed_precision.set_global_policy(policy)
            logger.info("Mixed precision globally enabled (mixed_float16).")
            return True
        except Exception as e:
            logger.warning(f"Could not enable mixed precision: {e}")
    else:
        logger.info("Mixed precision disabled (no CUDA devices detected).")
    return False

def get_base_architecture(name: str):
    """Retrieve pre-trained convolutional base architectures (ImageNet weights, exclude classification head)."""
    name_lower = name.lower()
    
    if "efficientnetv2" in name_lower:
        return tf.keras.applications.EfficientNetV2B0(
            weights="imagenet", include_top=False, input_shape=PipelineConfig.INPUT_SHAPE
        )
    elif "efficientnetb3" in name_lower:
        return tf.keras.applications.EfficientNetB3(
            weights="imagenet", include_top=False, input_shape=PipelineConfig.INPUT_SHAPE
        )
    elif "mobilenetv3" in name_lower:
        return tf.keras.applications.MobileNetV3Large(
            weights="imagenet", include_top=False, input_shape=PipelineConfig.INPUT_SHAPE
        )
    elif "resnet50" in name_lower:
        return tf.keras.applications.ResNet50(
            weights="imagenet", include_top=False, input_shape=PipelineConfig.INPUT_SHAPE
        )
    elif "densenet121" in name_lower:
        return tf.keras.applications.DenseNet121(
            weights="imagenet", include_top=False, input_shape=PipelineConfig.INPUT_SHAPE
        )
    elif "convnext" in name_lower:
        # ConvNeXt Tiny
        return tf.keras.applications.ConvNeXtTiny(
            weights="imagenet", include_top=False, input_shape=PipelineConfig.INPUT_SHAPE
        )
    else:
        raise ValueError(f"Unsupported base convolutional architecture selection: {name}")

def build_model(architecture_name: str, num_classes: int, trainable_base=False):
    """Builds the final Keras functional model wrapping CNN bases, Attention blocks, or ViTs."""
    name_lower = architecture_name.lower()
    
    if name_lower == "vit":
        logger.info("Building custom Vision Transformer (ViT-B16) architecture...")
        return build_vit_model(num_classes)
        
    inputs = layers.Input(shape=PipelineConfig.INPUT_SHAPE)
    
    if "yolo" in name_lower:
        logger.info("Building custom YOLOv11 classification architecture...")
        from model.models.yolo import build_yolo_backbone
        x = build_yolo_backbone(inputs)
    else:
        base_model = get_base_architecture(architecture_name)
        base_model.trainable = trainable_base
        x = base_model(inputs)
    
    # Inject Squeeze-and-Excitation or CBAM blocks on feature maps
    if PipelineConfig.ATTENTION_MECHANISM == "se" and "yolo" not in name_lower:
        logger.info(f"Injecting Squeeze-and-Excitation (SE) attention block into {architecture_name}...")
        x = squeeze_and_excitation_block(x)
    elif PipelineConfig.ATTENTION_MECHANISM == "cbam" and "yolo" not in name_lower:
        logger.info(f"Injecting Convolutional Block Attention Module (CBAM) attention block into {architecture_name}...")
        x = cbam_block(x)
        
    # Global Pooling + Classification Head
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.3)(x)
    x = layers.Dense(256, activation="relu")(x)
    x = layers.Dropout(0.2)(x)
    
    # Output activation layer in Float32 to prevent numeric instability under mixed precision
    logits = layers.Dense(num_classes, activation="softmax", name="prediction_output", dtype="float32")(x)
    
    model = models.Model(inputs=inputs, outputs=logits)
    return model
