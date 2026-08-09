import tensorflow as tf
from tensorflow.keras import layers, models

def load_and_extend_model(model_path, new_classes_count, l2_reg=1e-5):
    """Loads a saved model, enlarges the prediction node size, and maps previous weights to prevent forgetting."""
    # Load model
    model = tf.keras.models.load_model(model_path)
    
    # Extract previous weights from output layer
    try:
        output_layer = model.get_layer("prediction_output")
    except ValueError:
        # Fallback to last layer if name doesn't match
        output_layer = model.layers[-1]
        
    old_weights, old_biases = output_layer.get_weights()
    old_classes = old_weights.shape[1]
    
    # Construct new output layer
    new_output = layers.Dense(
        new_classes_count,
        activation="softmax",
        kernel_regularizer=tf.keras.regularizers.l2(l2_reg),
        name="prediction_output",
        dtype="float32"
    )
    
    # Reassemble the sequential model
    # Replace last layer
    new_layers = model.layers[:-1] + [new_output]
    new_model = models.Sequential(new_layers)
    
    # Build layers by running placeholder pass
    dummy_input = tf.zeros((1, 224, 224, 3))
    _ = new_model(dummy_input)
    
    # Retrieve initialized weights from new layer
    new_weights, new_biases = new_output.get_weights()
    
    # Map previous weights to retain learned states
    new_weights[:, :old_classes] = old_weights
    new_biases[:old_classes] = old_biases
    
    # Set weights
    new_output.set_weights([new_weights, new_biases])
    
    return new_model
