# PROJECT REPORT – PHASE I
**NEURAL CONSENSUS INTELLIGENCE ORCHESTRATOR / AI-BASED CROP DISEASE DETECTION AND MONITORING SYSTEM**

*(Fill in your cover pages, certificates, and declarations as per your specific university template)*

## ABSTRACT
Crop diseases pose a significant threat to global agricultural productivity and food security. Traditional manual disease identification is time-consuming and prone to human error, while existing technological solutions often lack real-time environmental context. This project presents an integrated AI-Based Crop Disease Detection and Monitoring System that combines Internet of Things (IoT) hardware with Deep Learning (DL). The system utilizes a network of sensors (DHT, Soil Moisture, BH1750 Light, and Rain) to continuously monitor environmental conditions that foster disease growth. Simultaneously, a PyTorch-based Convolutional Neural Network (CNN) analyzes leaf images to accurately classify diseases. To ensure farmer trust, Explainable AI (XAI) techniques are used to generate visual heatmaps of infected leaf regions. Furthermore, the system features an interactive React-based web dashboard that provides real-time analytics and intelligent agrochemical treatment recommendations, offering a complete, end-to-end smart farming solution.

## CHAPTER 1: INTRODUCTION
Agriculture forms the backbone of the global economy, yet it faces constant threats from climate change and crop diseases. The traditional approach to disease management relies heavily on manual inspection by agricultural experts, which is time-consuming, prone to error, and often impossible to scale for large farms. Furthermore, diseases are heavily influenced by environmental factors; a plant may show no visible symptoms, yet the humidity, soil moisture, and light conditions may be perfectly primed for a fungal outbreak. Therefore, modern agriculture requires a proactive, technology-driven approach.

The AI-Based Crop Disease Detection and Monitoring System is developed as a comprehensive smart-farming platform designed to enhance the speed, accuracy, and reliability of disease diagnosis. This project bridges the gap between hardware-based environmental monitoring and software-based predictive artificial intelligence. By utilizing a network of Internet of Things (IoT) sensors—including DHT (Temperature/Humidity), Soil Moisture, Rain, and BH1750 (Light) sensors—the system continuously tracks the micro-climate of the crop environment. 

Simultaneously, the system employs advanced Deep Learning techniques, specifically Convolutional Neural Networks (CNNs), to analyze images of crop leaves. When a farmer uploads a leaf image, the system not only classifies the disease with high accuracy but also generates an Explainable AI (XAI) heatmap, visually highlighting the infected areas. Finally, an intuitive web dashboard provides the farmer with actionable agrochemical recommendations, ensuring that the AI provides an end-to-end solution from detection to treatment.

## CHAPTER 2: LITERATURE SURVEY

**2.1 Inferences from Literature Survey**
The rapid advancement of Artificial Intelligence and IoT has led to numerous smart agriculture frameworks. However, a review of recent literature reveals distinct gaps. While models like standard CNNs have demonstrated remarkable accuracy in classifying leaf diseases in controlled laboratory settings, they often struggle in real-world deployments where environmental context is missing. Furthermore, many existing IoT systems only act as data loggers and do not integrate seamlessly with advanced image processing pipelines. The literature highlights a strong need for hybrid systems that combine sensor data fusion with explainable deep learning models to foster farmer trust and provide actionable treatment steps.

**2.2 Limitations & Research Gaps in Existing System**
*   **Lack of Actionable Output:** Existing systems often stop at identifying the disease name, leaving the farmer to research the appropriate chemical treatments independently.
*   **Black-Box AI Models:** Traditional CNNs do not explain *why* they made a prediction. Without visual proof (heatmaps), farmers are hesitant to trust the AI.
*   **Limited Sensor Integration:** Most base papers (including the 2024 IEEE base paper) rely only on temperature and soil moisture, ignoring critical outbreak factors like prolonged rainfall and light intensity.

## CHAPTER 3: REQUIREMENTS ANALYSIS

**3.1.1.1 Technical Feasibility**
The project is technically feasible as it utilizes established hardware (ESP32 microcontrollers, standard analog/digital sensors) and proven software technologies. The deep learning model is built using PyTorch, a robust framework for computer vision. The backend is handled by Python, ensuring smooth integration with the AI model, while the frontend is built using React, a modern and responsive UI library.

**3.1.1.2 Economic Feasibility**
The project is economically feasible as it primarily relies on open-source software (Python, React, PyTorch). The hardware components (ESP32, DHT, Soil, Rain, and Light sensors) are low-cost, readily available, and highly durable, making the physical deployment affordable for small-to-medium scale farmers.

**3.1.1.3 Operational Feasibility**
The proposed system is designed to be simple, efficient, and user-friendly. Farmers do not need technical knowledge to use the system; they simply view their farm's status on the dashboard and upload a photo if they suspect a disease. The system automatically handles the complex AI processing and returns plain-text agrochemical recommendations.

**3.2 Software & Hardware Requirements**
*   **Hardware:** ESP32 Microcontroller, DHT Sensor, YL-69 Soil Moisture Sensor, Rain Sensor, BH1750 Light Sensor, Battery Module.
*   **Software:** Python (Backend & ML), PyTorch (Deep Learning Framework), React.js (Frontend), MongoDB/SQLite (Database), VS Code.

## CHAPTER 4: DESCRIPTION OF PROPOSED SYSTEM

**4.1 Selected Methodologies**
The project adopts a modular, distributed methodology. The IoT hardware acts as an independent edge node that continuously streams telemetry data. The AI processing is decoupled into a centralized backend, allowing the computationally heavy CNN and Heatmap generation to run efficiently without lagging the web dashboard. This methodology improves maintainability and scalability.

**4.3 Module Description and Workflow**
1.  **Data Acquisition Module (IoT):** The ESP32 gathers real-time metrics (Temp, Humidity, Soil, Light, Rain) and transmits them to the backend server.
2.  **AI Image Processing Module:** A PyTorch CNN processes uploaded leaf images, classifies the disease, and utilizes Grad-CAM to generate a visual heatmap of the diseased area.
3.  **Recommendation Engine Module:** Maps the predicted disease against a database of treatments to output specific agrochemical recommendations.
4.  **Dashboard UI Module:** A React frontend that visualizes the sensor data via charts, displays the XAI heatmaps, and presents the treatment plans.

## REFERENCES
1. Chihaoui, N., et al. (2026). A comprehensive review on AI-based crop disease detection using leaf image classification and explainable AI. Discover Applied Sciences, Springer Nature.
2. Ferentinos, K. P. (2018). Deep learning methods applied for image-based plant disease detection. Computers and Electronics in Agriculture, 145, 311-318.
3. Maheswari, S., Dhilip Kumar, V., Geman, O., & Chiuchisan, I. (2024). Intelligent IoT Environment for Early Crop Disease Prediction and Management. IEEE International Symposium on Sensing and Instrumentation in 5G and IoT Era.
4. Ramesh, S., et al. (2019). Cloud computing in precision agriculture IoT systems: Handling large volumes of data. Journal of Cloud Computing, 8(1), 1-12.
5. Sharma, A., et al. (2025). Deep Learning and IoT for Plant Leaf Disease Detection Towards Smart Agriculture. SGS Engineering & Sciences.
6. Singh, R., et al. (2025). Plant Disease Detection using a Deep Learning approach: a Custom CNN. International Research Journal of Advanced Engineering Hub.
7. Patil, S., & Kale, A. (2020). IoT-based system using parameters like soil moisture, temperature, and humidity measurements. Proceedings of CCIP, 1-5.
8. Panchal, D., et al. (2020). Random Forest Classifiers for crop disease classification using sensor data. International Journal of Agricultural and Biological Engineering, 13(4), 92-97.
9. Babu, S. R., et al. (2019). IoT-ML system for integrated detection and management of crop diseases. Journal of Agricultural Informatics, 10(2), 45-53.
10. Materne, N., & Inoue, M. (2018). IoT monitoring system for early detection of agricultural pests and diseases. Proceedings of SEATUC, 1-5.
11. Khan, S., & Narvekar, M. (2020). Disorder detection of tomato plant using IoT and machine learning. Journal of Physics: Conference Series, 1432.
12. Jayashree, M., et al. (2021). IoT-based precision agriculture with soil and atmosphere sensors. Journal of Agricultural Technology, 17(1), 12-19.
