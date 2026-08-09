# AI Pipeline Documentation
1. **Dataset**: PlantVillage + RiceLeafDisease (Consolidated)
2. **Preprocessing**: LAB-CLAHE contrast, HSV leaf masking.
3. **Training**: MobileNetV3 (Student) distilled from EfficientNetV2 (Teacher).
4. **Inference**: Temperature Scaling applied for confidence calibration.
