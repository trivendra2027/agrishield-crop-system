import os
import json
import tensorflow as tf
from tensorflow.keras import layers, models

def main():
    print("Initializing dummy model creation...")
    
    # Load class labels
    current_dir = os.path.dirname(os.path.abspath(__file__))
    classes_path = os.path.join(current_dir, "classes.json")
    
    with open(classes_path, "r") as f:
        classes = json.load(f)
        
    num_classes = len(classes)
    print(f"Detected {num_classes} crop classes from classes.json.")

    # Create a lightweight convolutional neural network matching the input shape of 224x224x3
    # This acts as a placeholder for testing backend integration before full training
    model = models.Sequential([
        layers.Input(shape=(224, 224, 3), name="input_image"),
        layers.Conv2D(16, (3, 3), activation="relu"),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(32, (3, 3), activation="relu"),
        layers.MaxPooling2D((2, 2)),
        layers.Flatten(),
        layers.Dense(64, activation="relu"),
        layers.Dense(num_classes, activation="softmax", name="output_probabilities")
    ])

    model.compile(
        optimizer="adam",
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )

    # Define save path
    model_save_path = os.path.join(current_dir, "crop_disease_model.keras")
    
    print("Compiling and saving placeholder model...")
    model.save(model_save_path)
    print(f"Dummy model successfully saved at: {model_save_path}")

if __name__ == "__main__":
    main()
