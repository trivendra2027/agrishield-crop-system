# PPT PRESENTATION CONTENT
**Project: AI-Based Crop Disease Detection and Monitoring System**

## Slide 1: Title Slide
*   **Title:** AI-BASED CROP DISEASE DETECTION AND MONITORING SYSTEM
*   **Project Students:** [Your Name 1, Reg No], [Your Name 2, Reg No]
*   **Guide:** [Your Guide Name], [Designation]
*   **Department:** Computer Science and Engineering with Specialization in [Your Specialization]

## Slide 2: Agenda
*   Abstract
*   Objective(s)
*   Base Paper Details
*   Literature Survey
*   Inferences from Literature Survey
*   Proposed System
*   References

## Slide 3: Abstract
Crop diseases pose a significant threat to global agricultural productivity and food security. Traditional manual disease identification is time-consuming and prone to human error, while existing technological solutions often lack real-time environmental context. This project presents an integrated AI-Based Crop Disease Detection and Monitoring System that combines Internet of Things (IoT) hardware with Deep Learning (DL). The system utilizes a network of sensors (DHT, Soil Moisture, BH1750 Light, and Rain) to continuously monitor environmental conditions that foster disease growth. Simultaneously, a PyTorch-based Convolutional Neural Network (CNN) analyzes leaf images to accurately classify diseases. To ensure farmer trust, Explainable AI (XAI) techniques are used to generate visual heatmaps of infected leaf regions. Furthermore, the system features an interactive React-based web dashboard that provides real-time analytics and intelligent agrochemical treatment recommendations, offering a complete, end-to-end smart farming solution.

## Slide 4: Objective(s)
*   Develop an AI-powered system for accurate crop disease identification using Convolutional Neural Networks (CNN).
*   Integrate IoT hardware (Temperature, Humidity, Soil, Light, and Rain sensors) for real-time environmental monitoring.
*   Implement Explainable AI (XAI) to generate visual heatmaps that highlight diseased areas on leaf images.
*   Build an interactive web dashboard to provide real-time sensor analytics and automated agrochemical recommendations based on the detected disease.

## Slide 5: Base Paper Details
*   **Base Paper Title:** Intelligent IoT Environment for Early Crop Disease Prediction and Management
*   **Year:** 2024
*   **Journal Name:** IEEE Xplore (International Symposium on Sensing and Instrumentation in 5G and IoT Era)
*   **Authors:** S. Maheswari, V. Dhilip Kumar, Oana Geman, Iuliana Chiuchisan

## Slide 6: Literature Survey (Table Part 1)
| Author | Journal Name & Year | Title | Descriptions | Pros | Cons |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **S. Maheswari et al.** | IEEE, 2024 | Intelligent IoT Environment for Early Crop Disease Prediction | Uses IoT sensors and DL for crop health monitoring. | High accuracy, real-time data. | Lacks visual heatmaps and treatment recommendations. |
| **N. Chihaoui et al.** | Springer Nature, 2026 | A comprehensive review on AI-based crop disease detection using leaf image classification and XAI | Reviews CNNs and Grad-CAM for plant disease. | Excellent model interpretability. | Purely software-based, no hardware/IoT integration. |

## Slide 7: Literature Survey (Table Part 2)
| Author | Journal Name & Year | Title | Descriptions | Pros | Cons |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **A. Sharma et al.** | SGS Engineering, 2025 | Deep Learning and IoT for Plant Leaf Disease Detection Towards Smart Agriculture | Proposes scalable DL-IoT frameworks for remote areas. | Good edge-computing focus. | Does not account for light/rain environmental factors. |
| **R. Singh et al.** | IRJAEH, 2025 | Plant Disease Detection using a Deep Learning approach: a Custom CNN | Focuses on custom CNN architectures. | High image classification accuracy. | No farmer-facing dashboard or agrochemical database. |

## Slide 8: Inferences from Literature Survey
*   Convolutional Neural Networks (CNNs) have emerged as the most effective architecture for plant image classification.
*   Existing studies mainly focus on classification accuracy while neglecting practical agrochemical recommendation capabilities.
*   Most IoT systems monitor basic temperature and soil, but fail to integrate broader environmental factors like light intensity and rain.
*   Explainable AI (XAI) is rarely integrated into live IoT dashboards to help farmers visually trust the AI's predictions.

## Slide 9: Proposed System
*   Preprocesses uploaded leaf images and extracts discriminative visual features using a PyTorch CNN model, outputting visual heatmaps.
*   Continuously monitors farm health using a comprehensive IoT node (ESP32, DHT, Soil, Rain, BH1750 sensors).
*   **Advantages of Proposed System:**
    *   Integrates comprehensive environmental monitoring with AI plant recognition.
    *   Generates visual Explainable AI (XAI) heatmaps for trust.
    *   Provides actionable agrochemical recommendations.
    *   Improves practical usability through an interactive React dashboard.

## Slide 10: Proposed System Architecture
*(Insert your Architecture Diagram here showing the ESP32/Sensors sending data to the Backend, the Image going to the CNN, and everything displaying on the React Dashboard)*

## Slide 11: Proposed System (Modules & Activities)
| Modules | Activities |
| :--- | :--- |
| **IoT & Hardware Module** | Collects live data from DHT, Soil, Light, and Rain sensors via ESP32. |
| **Data Preparation & AI Training** | Organizes botanical datasets and trains the CNN for leaf disease classification. |
| **Explainable AI (XAI) Module** | Generates visual heatmaps to highlight diseased regions on the leaf. |
| **System Integration (Web Dashboard)** | Integrates the Python/Flask backend with the React frontend to display sensor analytics and agrochemical recommendations. |

## Slide 12: Proposed System - Algorithm
*   **Algorithm Used:** Convolutional Neural Network (CNN) integrated with Sensor Data Fusion.
*   **Methodology:**
    1.  Image Preprocessing (Resizing, Normalization)
    2.  CNN for Feature Extraction and Disease Classification
    3.  Grad-CAM (Gradient-weighted Class Activation Mapping) for Heatmap Generation
    4.  Sensor Thresholding Algorithm for Environmental Alerts
    5.  Database Mapping for Agrochemical Recommendations

## Slide 13 & 14: References
*(See the references section in the Phase 1 Report)*

## Slide 15: Thank You
We thank God, Our Department, Guide, Panel Members, Supportive Professors, and all Technical and non Technical staff who helped us in our Project.
