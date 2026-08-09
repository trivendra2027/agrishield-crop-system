# Apple Scab AI Investigation Report
## Verified Findings
- The model outputs a low confidence (0.45) specifically for the Apple Scab class during certain test cases.
- Precision/Recall analysis shows Apple Scab is often confused with Apple Black Rot.

## Possible Causes
- **Dataset Diversity**: The Apple Scab dataset may lack variation in lighting and backgrounds.
- **Class Imbalance**: There may be significantly fewer Apple Scab images compared to Black Rot.
- **Domain Shift**: Test images (e.g. from Google Images) look radically different from PlantVillage laboratory conditions.
- **Model Uncertainty**: The MobileNetV3 feature extractor may not have enough capacity to differentiate subtle lesion patterns.

## Future Improvements
- Expand the dataset via web scraping to introduce more field conditions (domain shift mitigation).
- Apply heavy brightness/contrast augmentation during training.
