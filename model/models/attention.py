import tensorflow as tf
from tensorflow.keras import layers

def squeeze_and_excitation_block(input_tensor, reduction=16):
    """
    Squeeze-and-Excitation (SE) Block.
    Compresses spatial features and excites channel dependencies.
    """
    channel_axis = -1
    filters = input_tensor.shape[channel_axis]
    
    # Squeeze: Global Average Pooling
    se = layers.GlobalAveragePooling2D()(input_tensor)
    se = layers.Reshape((1, 1, filters))(se)
    
    # Excitation: MLP with reduction
    se = layers.Dense(filters // reduction, activation="relu", use_bias=False)(se)
    se = layers.Dense(filters, activation="sigmoid", use_bias=False)(se)
    
    # Scale input tensor
    scaled = layers.Multiply()([input_tensor, se])
    return scaled

def cbam_block(input_tensor, reduction=16):
    """
    Convolutional Block Attention Module (CBAM).
    Applies both channel-wise and spatial attention submodules.
    """
    channel_axis = -1
    filters = input_tensor.shape[channel_axis]
    
    # 1. Channel Attention Submodule
    # Average pooling branch
    avg_pool = layers.GlobalAveragePooling2D()(input_tensor)
    avg_pool = layers.Reshape((1, 1, filters))(avg_pool)
    
    # Max pooling branch
    max_pool = layers.GlobalMaxPooling2D()(input_tensor)
    max_pool = layers.Reshape((1, 1, filters))(max_pool)
    
    # Shared MLP
    shared_dense_one = layers.Dense(filters // reduction, activation="relu", use_bias=False)
    shared_dense_two = layers.Dense(filters, use_bias=False)
    
    avg_out = shared_dense_two(shared_dense_one(avg_pool))
    max_out = shared_dense_two(shared_dense_one(max_pool))
    
    # Sum and activate
    channel_attention = layers.Add()([avg_out, max_out])
    channel_attention = layers.Activation("sigmoid")(channel_attention)
    
    # Scale input by channel attention
    scaled_channels = layers.Multiply()([input_tensor, channel_attention])
    
    # 2. Spatial Attention Submodule
    # Max pool and avg pool across channel dimensions
    avg_spatial = tf.reduce_mean(scaled_channels, axis=channel_axis, keepdims=True)
    max_spatial = tf.reduce_max(scaled_channels, axis=channel_axis, keepdims=True)
    
    # Concatenate and convolve
    concat = layers.Concatenate(axis=channel_axis)([avg_spatial, max_spatial])
    spatial_attention = layers.Conv2D(filters=1, kernel_size=7, padding="same", activation="sigmoid", use_bias=False)(concat)
    
    # Scale input by spatial attention
    scaled_spatial = layers.Multiply()([scaled_channels, spatial_attention])
    return scaled_spatial
