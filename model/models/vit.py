import tensorflow as tf
from tensorflow.keras import layers, models
from model.configs.config import PipelineConfig

class Patches(layers.Layer):
    def __init__(self, patch_size):
        super().__init__()
        self.patch_size = patch_size

    def call(self, images):
        batch_size = tf.shape(images)[0]
        patches = tf.image.extract_patches(
            images=images,
            sizes=[1, self.patch_size, self.patch_size, 1],
            strides=[1, self.patch_size, self.patch_size, 1],
            rates=[1, 1, 1, 1],
            padding="VALID",
        )
        patch_dims = patches.shape[-1]
        patches = tf.reshape(patches, [batch_size, -1, patch_dims])
        return patches

    def get_config(self):
        config = super().get_config()
        config.update({"patch_size": self.patch_size})
        return config

class PatchEncoder(layers.Layer):
    def __init__(self, num_patches, projection_dim):
        super().__init__()
        self.num_patches = num_patches
        self.projection = layers.Dense(units=projection_dim)
        self.position_embedding = layers.Embedding(
            input_dim=num_patches, output_dim=projection_dim
        )

    def call(self, patch):
        positions = tf.range(start=0, limit=self.num_patches, delta=1)
        encoded = self.projection(patch) + self.position_embedding(positions)
        return encoded

    def get_config(self):
        config = super().get_config()
        config.update({
            "num_patches": self.num_patches,
            "projection_dim": self.projection.units if hasattr(self, 'projection') else None
        })
        return config

def build_vit_model(num_classes):
    """Constructs a custom Vision Transformer (ViT) model in pure Keras layers."""
    inputs = layers.Input(shape=PipelineConfig.INPUT_SHAPE)
    
    # Calculate patch parameters
    patch_size = PipelineConfig.VIT_PATCH_SIZE
    num_patches = (PipelineConfig.IMAGE_SIZE[0] // patch_size) * (PipelineConfig.IMAGE_SIZE[1] // patch_size)
    
    # Extract patches and project to linear embeddings
    patches = Patches(patch_size)(inputs)
    encoded_patches = PatchEncoder(num_patches, PipelineConfig.VIT_PROJECTION_DIM)(patches)
    
    # Transformer Encoder blocks
    for _ in range(PipelineConfig.VIT_TRANSFORMER_LAYERS):
        # Normalization 1 + Multi-Head Attention
        x1 = layers.LayerNormalization(epsilon=1e-6)(encoded_patches)
        attention_output = layers.MultiHeadAttention(
            num_heads=PipelineConfig.VIT_NUM_HEADS, 
            key_dim=PipelineConfig.VIT_PROJECTION_DIM, 
            dropout=0.1
        )(x1, x1)
        # Skip Connection 1
        x2 = layers.Add()([attention_output, encoded_patches])
        
        # Normalization 2 + MLP FeedForward
        x3 = layers.LayerNormalization(epsilon=1e-6)(x2)
        x3 = layers.Dense(PipelineConfig.VIT_PROJECTION_DIM * 2, activation="gelu")(x3)
        x3 = layers.Dropout(0.1)(x3)
        x3 = layers.Dense(PipelineConfig.VIT_PROJECTION_DIM, activation="gelu")(x3)
        x3 = layers.Dropout(0.1)(x3)
        # Skip Connection 2
        encoded_patches = layers.Add()([x3, x2])
        
    # Pool representation and construct classification MLP head
    representation = layers.LayerNormalization(epsilon=1e-6)(encoded_patches)
    representation = layers.Flatten()(representation)
    representation = layers.Dropout(0.3)(representation)
    
    features = layers.Dense(128, activation="gelu")(representation)
    features = layers.Dropout(0.2)(features)
    logits = layers.Dense(num_classes, activation="softmax", name="prediction_output", dtype="float32")(features)
    
    return models.Model(inputs=inputs, outputs=logits)
