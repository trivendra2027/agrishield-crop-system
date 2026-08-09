import tensorflow as tf
from tensorflow.keras import layers, models

class SimCLRModel(tf.keras.Model):
    def __init__(self, base_model, projection_dim=128, temperature=0.1):
        super().__init__()
        self.base_model = base_model
        self.temperature = temperature
        
        # Projection Head: Global Average Pooling + 2-layer MLP
        self.projection_head = tf.keras.Sequential([
            layers.GlobalAveragePooling2D(),
            layers.Dense(256, activation="relu"),
            layers.Dense(projection_dim)
        ], name="simclr_projection_head")
        
    def compile(self, optimizer):
        super().compile()
        self.optimizer = optimizer
        
    def train_step(self, data):
        # Yields twin augmented batches
        x_i, x_j = data
        
        with tf.GradientTape() as tape:
            # Forward pass through base model feature extractor
            h_i = self.base_model(x_i, training=True)
            h_j = self.base_model(x_j, training=True)
            
            # Forward pass through projection head + normalize representations
            z_i = tf.math.l2_normalize(self.projection_head(h_i, training=True), axis=1)
            z_j = tf.math.l2_normalize(self.projection_head(h_j, training=True), axis=1)
            
            batch_size = tf.shape(z_i)[0]
            representations = tf.concat([z_i, z_j], axis=0)
            similarity_matrix = tf.matmul(representations, representations, transpose_b=True)
            
            # Apply scaling temperature
            similarity_matrix = similarity_matrix / self.temperature
            
            # Targets: index i corresponds to index i + batch_size (positive pairs)
            labels = tf.range(batch_size)
            labels = tf.concat([labels + batch_size, labels], axis=0)
            
            # Mask out self-similarity diagonal elements
            mask = tf.one_hot(tf.range(2 * batch_size), 2 * batch_size)
            logits = similarity_matrix - (mask * 1e9)
            
            # Compute NT-Xent Loss via cross-entropy
            loss = tf.reduce_mean(
                tf.keras.losses.sparse_categorical_crossentropy(labels, logits, from_logits=True)
            )
            
        gradients = tape.gradient(loss, self.trainable_variables)
        self.optimizer.apply_gradients(zip(gradients, self.trainable_variables))
        return {"loss": loss}
