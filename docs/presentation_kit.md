# Project Presentation Kit (Viva Prep)
## Elevator Pitch
AgriShield is an end-to-end precision agriculture platform combining edge AI (MobileNetV3) with generative AI (NVIDIA NIM) and live IoT telemetry to diagnose crop diseases and deliver highly contextual, actionable farming advice.

## Expected Viva Questions
- **Q**: Why MobileNetV3 over ResNet50? 
- **A**: MobileNetV3 uses Depthwise Separable Convolutions, dropping parameters from 25M to 3M, allowing deployment on resource-constrained hubs without sacrificing accuracy via Knowledge Distillation.
- **Q**: How does GradCAM work? 
- **A**: It computes the gradient of the predicted class score with respect to the last spatial convolution layer, highlighting the regions the model looked at.
