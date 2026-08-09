import tensorflow as tf
from tensorflow.keras import layers

def conv_block(x, filters, kernel_size, stride):
    x = layers.Conv2D(filters, kernel_size, strides=stride, padding="same", use_bias=False)(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation("swish")(x)
    return x

def bottleneck(x, filters, shortcut=True):
    y = conv_block(x, filters, 1, 1)
    y = conv_block(y, filters, 3, 1)
    if shortcut:
        x = layers.Add()([x, y])
    else:
        x = y
    return x

def c2f(x, filters, n=1):
    c = filters // 2
    y1 = conv_block(x, c, 1, 1)
    y2 = conv_block(x, c, 1, 1)
    
    outputs = [y1, y2]
    curr = y2
    for _ in range(n):
        curr = bottleneck(curr, c, shortcut=True)
        outputs.append(curr)
        
    out = layers.Concatenate()(outputs)
    out = conv_block(out, filters, 1, 1)
    return out

def sppf(x, filters, k=5):
    c = filters // 2
    x1 = conv_block(x, c, 1, 1)
    p1 = layers.MaxPooling2D(pool_size=k, strides=1, padding="same")(x1)
    p2 = layers.MaxPooling2D(pool_size=k, strides=1, padding="same")(p1)
    p3 = layers.MaxPooling2D(pool_size=k, strides=1, padding="same")(p2)
    out = layers.Concatenate()([x1, p1, p2, p3])
    out = conv_block(out, filters, 1, 1)
    return out

def build_yolo_backbone(inputs):
    """Constructs a custom CSPDarknet backbone resembling YOLOv11."""
    # Stem
    x = conv_block(inputs, 16, 3, 2)
    x = conv_block(x, 32, 3, 2)
    
    # Stages
    x = c2f(x, 32, n=1)
    x = conv_block(x, 64, 3, 2)
    x = c2f(x, 64, n=2)
    x = conv_block(x, 128, 3, 2)
    x = c2f(x, 128, n=2)
    x = conv_block(x, 256, 3, 2)
    x = c2f(x, 256, n=1)
    
    # SPPF
    x = sppf(x, 256)
    return x
