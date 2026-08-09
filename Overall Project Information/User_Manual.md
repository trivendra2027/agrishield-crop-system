# 📘 User Manual – Agri Shield (AI Crop Disease Detection System)

---

## 1. Introduction

Welcome to the **Agri Shield User Manual**. The AI Crop Disease Detection System is an advanced agricultural intelligence platform designed to empower farmers, agronomists, and field technicians with automated crop disease diagnosis, real-time IoT environmental monitoring, AI-powered agricultural chat advisory, and smart irrigation scheduling.

This document serves as the complete, authoritative operational guide for end users interacting with the web application dashboard, mobile interfaces, and AI diagnostic tools.

---

## 2. System Requirements

To ensure optimal performance and seamless real-time telemetry streaming, client devices accessing the Agri Shield web application should meet the following minimum requirements:

| Component | Minimum Specification | Recommended Specification |
| :--- | :--- | :--- |
| **Web Browser** | Google Chrome 90+, Mozilla Firefox 88+, Safari 14+, Microsoft Edge 90+ (HTML5 & WebSocket support required) | Latest stable release of Chrome, Edge, or Firefox |
| **Client Display** | 1024 × 768 resolution (Tablet / Compact Laptop) | 1920 × 1080 Full HD or responsive mobile touchscreen |
| **Network Connection** | 1 Mbps broadband or 3G/4G cellular data connection | 10 Mbps broadband or 4G/5G stable cellular connection |
| **Hardware Permissions** | File filesystem read access (for uploading diagnostic leaf images) | Camera capture permission (for direct mobile leaf photography) |

---

## 3. Registration

To access the Agri Shield platform, new users must register for an authenticated farmer account:
1. Navigate to the landing page and click the **Get Started** or **Register** button (direct route: `/register`).
2. Fill out the registration form with your **Full Name** and a valid **Email Address**.
3. Create a secure password adhering to the enterprise password security policy:
   * Minimum of **12 characters**.
   * Must contain at least **one uppercase letter** (`A-Z`).
   * Must contain at least **one lowercase letter** (`a-z`).
   * Must contain at least **one number** (`0-9`).
   * Must contain at least **one special symbol** (`!@#$%^&*...`).
4. Select your **Preferred Language** (e.g., English, Spanish, Hindi).
5. Click **Create Account**. Upon successful submission, your credentials will be encrypted, and you will be redirected to the login screen.

---

## 4. Login & Authentication

1. From the login interface (`/login`), enter your registered **Email Address** and **Password**.
2. Click **Sign In**. The system authenticates your credentials against the backend identity server and issues a secure **JSON Web Token (JWT)** session.
3. **Account Lockout Defense:** For security, if you enter an incorrect password **5 consecutive times**, your account will be temporarily locked for **15 minutes** to prevent brute-force intrusion. Contact an administrator if immediate unlock is required.

---

## 5. Dashboard Overview

Upon successful login, you are greeted by the **Main Farmer Dashboard** (`/dashboard`), which aggregates vital agronomic metrics into a centralized control center:
* **Farm Health Score:** Displays an aggregated 0–100 numerical health index calculated from recent disease diagnostic scans and environmental stress indicators.
* **Active Disease Risk Cards:** Highlights real-time localized disease outbreak risks based on recent diagnostic history and weather humidity/temperature conditions.
* **Quick Navigation Action Center:** Direct shortcut buttons to launch an **AI Disease Scan**, open the **AgriBot Advisory Chat**, view **IoT Sensor Telemetry**, or generate **Harvest Reports**.
* **Recent Diagnostic Timeline:** A chronologically ordered feed showing your most recently scanned crop leaves, detected pathogen names, and confidence scores.

---

## 6. Plant Disease Detection & Scan Center

The core AI diagnostic engine allows you to identify crop pathology in seconds:
1. Navigate to the **Scan Center / Upload Image** page (`/upload`).
2. Click the dropzone or select **Browse Files** to upload a clear, focused photograph of an affected crop leaf.
   * **Supported Formats:** `.jpg`, `.jpeg`, `.png`, and `.webp`.
   * **File Size Limit:** Maximum **15 MB** per image.
3. Click **Analyze Image**. The image is securely uploaded, validated against magic-byte headers, and processed by our trained PyTorch neural network.
4. **Reviewing Results (`/predictions/{id}`):** Within seconds, the diagnosis page displays:
   * **Detected Pathology:** The primary pathogen or disease name (e.g., *Tomato Early Blight*, *Potato Late Blight*, or *Healthy*).
   * **AI Confidence Level:** Numerical percentage indicating classification certainty (e.g., *98.4%*).
   * **Actionable Treatment Advice:** Tailored organic and chemical treatment recommendations, fungicide schedules, and cultural control steps.
5. **Agrochemical Product Scanner:** You can also switch to the **Agrochemical Scan** tab to photograph chemical fertilizer or pesticide labels; the OCR engine extracts product intelligence and matches it against our botanical database.

---

## 7. Plant Monitoring & Farm Timeline

The **Plant Monitoring & Farm Timeline** module (`/farm` & `/history`) enables longitudinal tracking of crop development across the growing season:
* **Diagnostic History Feed (`/history`):** Browse a searchable, paginated archive of all past disease predictions. Filter by crop type, disease status, or date range.
* **Farm Timeline Widget:** Visualizes disease outbreak progression over time, allowing farmers to evaluate whether applied fungicide treatments are successfully reducing pathogen spread.
* **Crop Advisory Panel:** Provides seasonal growth stage milestones and proactive care recommendations tailored to your registered farm location.

---

## 8. Smart Irrigation Advisor

The **Smart Irrigation Advisor** (`/analytics` & Intelligence Panel) optimizes field water usage by combining real-time IoT soil moisture sensor data with weather forecast models:
* **Moisture Status Assessment:** Classifies current soil saturation into actionable zones (*Critically Dry*, *Optimal Saturation*, or *Waterlogged*).
* **Automated Scheduling Advice:** Recommends precise irrigation runtimes in minutes and gallons per acre to reach optimal root zone capacity without causing nutrient leaching or root rot.
* **Water Conservation Analytics:** Tracks cumulative water savings achieved by deferring irrigation cycles prior to forecasted rainfall events.

---

## 9. Weather Dashboard

The **Weather Dashboard** widget provides localized meteorological intelligence designed to anticipate disease-conducive environmental conditions:
* **Current Field Conditions:** Live temperature (°C / °F), relative humidity (%), atmospheric pressure (hPa), and UV index.
* **Fungal & Bacterial Risk Forecast:** High relative humidity combined with warm temperatures automatically triggers localized warning badges alerting you to elevated risks of fungal spore germination (such as Blight or Powdery Mildew).

---

## 10. AI Chatbot (AgriBot)

The **AgriBot AI Assistant** (`/assistant` or `/chat`) is an interactive, 24/7 agronomic expert powered by **NVIDIA NIM (Llama 3.1 8B Instruct)** and enriched by our **RAG (Retrieval-Augmented Generation)** knowledge base:
1. Type any agricultural question into the chat input (e.g., *"How do I treat bacterial leaf spot on bell peppers organically?"* or *"What is the ideal soil pH for tomatoes?"*).
2. The chatbot queries authoritative agricultural manuals in milliseconds and delivers customized, scientifically verified agronomic advice.
3. **Context Awareness:** AgriBot automatically reviews your recent disease scan history to provide contextual follow-up guidance on active farm infestations.

---

## 11. IoT Sensor Telemetry Dashboard

For farms equipped with connected ESP32 hardware nodes, the **IoT Devices Dashboard** (`/devices`) provides live visibility into physical field conditions:
* **Real-Time Sensor Cards:** Live numerical gauges displaying:
  * **Ambient Temperature (°C)** and **Relative Humidity (%)**.
  * **Volumetric Soil Moisture (%)**.
  * **Rainfall Intensity (mm/h)** and **Solar Radiation (Lux)**.
* **Hardware Fleet Status:** Displays online/offline operational status, battery voltage levels, and last-seen heartbeat timestamps for each deployed ESP32 node.

---

## 12. Reports & Analytics Export

The **Reports & Analytics Module** (`/reports` & `/analytics`) transforms diagnostic history and sensor data into executive documentation:
* **Custom Report Generation:** Select date ranges, specific crops, and diagnostic statuses to compile structured farm summaries.
* **Export Options:** Download formatted diagnostic summaries for record-keeping, agricultural compliance certification, or sharing with local agricultural extension officers.

---

## 13. Notifications & Alert Center

The **Notifications Center** (`/notifications`) delivers instantaneous alerts regarding farm security and crop health:
* **Real-Time WebSockets:** Live alerts appear instantly without requiring page reloads.
* **Alert Categories:**
  * 🔴 **Severe Outbreak Warnings:** Triggered when consecutive high-confidence disease scans occur in your region.
  * 🟡 **Environmental Stress Alerts:** Warns of extreme temperature spikes, frost risks, or critical soil moisture depletion.
  * 🟢 **System Notifications:** Confirmations of successful report exports or profile updates.

---

## 14. Profile Management

The **Profile Page** (`/profile`) allows you to maintain your professional farmer identity and agricultural preferences:
* **Personal Details:** Update your display name and contact email address.
* **Farm Location & Practices:** Specify your geographic farm location and select your primary farming methodology (*Conventional*, *Organic*, or *Integrated Pest Management*).
* **Password Management:** Securely update your account password by entering your current password and a new compliant password.

---

## 15. Settings & Preferences

The **Settings Module** (`/settings`) allows customization of the application interface:
* **Language Selection:** Toggle between supported UI display languages (English, Spanish, Hindi, etc.) with instant translation rendering.
* **Display Preferences:** Adjust dashboard layout density and alert notification sound preferences.

---

## 16. Common Error Messages & Meaning

| Error Message | HTTP Code | Root Cause & Meaning |
| :--- | :---: | :--- |
| `"Invalid username or password"` | `401 Unauthorized` | Incorrect login credentials submitted. Verify spelling and case sensitivity. |
| `"Account temporarily locked due to excessive failed login attempts"` | `403 Forbidden` | You exceeded 5 consecutive failed login attempts. Wait 15 minutes before retrying. |
| `"Unsupported file extension"` | `400 Bad Request` | Attempted to upload an unsupported document type (e.g., `.pdf`, `.doc`). Only `.jpg`, `.png`, and `.webp` are accepted. |
| `"File size exceeds maximum permitted limit of 15 MB"`| `400 Bad Request`| The image file is too large. Compress or resize the photograph before uploading. |
| `"Rate limit exceeded. Please slow down."` | `429 Too Many Requests`| You are submitting requests or image scans too rapidly. Pause for 60 seconds. |
| `"Authentication required"` / `"Invalid or expired authentication token"` | `401 Unauthorized` | Your login session has timed out (after 2 hours of inactivity). Please log in again. |

---

## 17. Troubleshooting Guide

### Issue: Image upload fails or hangs indefinitely.
* **Step 1:** Check your internet connection stability.
* **Step 2:** Verify that the image filesize is strictly under **15 MB**.
* **Step 3:** Ensure the file is a standard photo (JPEG/PNG) and not a corrupted file or renamed executable.
* **Step 4:** Perform a hard browser refresh (`Ctrl + Shift + R` or `Cmd + Shift + R`) to clear cached scripts and retry.

### Issue: AgriBot AI Chatbot returns "Offline" or generic fallback responses.
* **Step 1:** Verify if your network firewall or VPN is blocking WebSocket or outbound API connections.
* **Step 2:** The backend NVIDIA NIM cloud API may be experiencing temporary latency or credential expiration. The system automatically degrades safely to local agronomic fallback advice until cloud connectivity resumes.

### Issue: IoT Sensor cards display "Offline" or outdated timestamps.
* **Step 1:** Check physical power to the field ESP32 microcontroller unit and inspect 18650 battery voltage.
* **Step 2:** Verify that the field Wi-Fi router or cellular gateway is powered and providing internet access to the ESP32.

---

## 18. Frequently Asked Questions (FAQ)

**Q: Can I use Agri Shield offline in remote fields without cellular service?**  
*A:* Field photos can be taken offline using your mobile camera. Once you return to an area with Wi-Fi or cellular coverage, upload the buffered images to the Scan Center for AI diagnosis.

**Q: How accurate is the AI disease detection model?**  
*A:* Our underlying convolutional neural network has been trained on thousands of curated PlantVillage and field-verified images, achieving over 95% diagnostic accuracy across supported crop species. However, AI results should always be used alongside professional agronomist judgment.

**Q: Are my farm location and crop photos kept private?**  
*A:* Yes. All diagnostic data and farm profiles are isolated within your authenticated user account. Data is encrypted in transit via TLS/HTTPS and stored securely in our MongoDB database.

---

## 19. Best Practices for Leaf Photography

To achieve the highest possible AI classification accuracy, adhere to these photographic guidelines when capturing diagnostic leaf images:
1. **Isolate the Subject:** Focus on a single affected leaf rather than an entire dense plant canopy.
2. **Ensure Optimal Lighting:** Photograph leaves in natural, bright daylight. Avoid harsh shadows, camera flash glare, or deep twilight darkness.
3. **Focus on Pathology:** Ensure the diseased spots, lesions, or fungal molds are sharply in focus and centered in the frame.
4. **Avoid Motion Blur:** Hold the camera steady or use a stabilizing grip to prevent blurry images that degrade neural network edge detection.

---

## 20. Glossary of Agricultural & Technical Terms

* **AI Confidence Score:** A statistical percentage expressing how certain the neural network is regarding its diagnostic prediction.
* **Agrochemical:** A chemical product used in agriculture, including synthetic fertilizers, fungicides, insecticides, and herbicides.
* **BSON / JSON:** Standardized digital data formats used to transmit diagnostic records and IoT telemetry between sensors, servers, and web browsers.
* **ESP32:** A low-cost, low-power microchip with integrated Wi-Fi and Bluetooth used to connect physical field sensors to the Agri Shield cloud.
* **FAISS (Facebook AI Similarity Search):** The high-speed vector search library used by our RAG engine to find relevant agronomic manual chapters in milliseconds.
* **Fungicide:** A specialized biocidal chemical compound or biological organism used to kill or inhibit parasitic fungi or their spores.
* **Inference:** The process of running a trained Artificial Intelligence model on a newly uploaded leaf image to predict its disease status.
* **IoT (Internet of Things):** A network of physical field hardware (temperature sensors, moisture probes) connected wirelessly to the internet.
* **Lesion:** A localized area of abnormal, discolored, or damaged tissue on a crop leaf caused by bacterial or fungal infection.
* **Pathogen:** A biological agent—such as a virus, bacterium, fungus, or nematode—that causes disease in agricultural crops.
* **RAG (Retrieval-Augmented Generation):** An AI architecture that enriches chatbot answers by retrieving factual information from authoritative agricultural manuals before generating a reply.
* **Telemetry:** Automated transmission of environmental measurements (moisture, temperature, rainfall) from remote field sensors to a centralized database.

---

## 21. Cross-References & Technical Alignment

For deeper architectural and operational context, refer to existing system documentation:
* **System Overview:** [Overall Project Information/Software_Architecture.md](file:///c:/AI%20Crop%20Disease%20Detection%20System/Overall%20Project%20Information/Software_Architecture.md)
* **Frontend UI Architecture:** [Overall Project Information/Frontend_Architecture.md](file:///c:/AI%20Crop%20Disease%20Detection%20System/Overall%20Project%20Information/Frontend_Architecture.md)
* **AI & RAG Knowledge Base:** [Overall Project Information/RAG_Knowledge_Base_Architecture.md](file:///c:/AI%20Crop%20Disease%20Detection%20System/Overall%20Project%20Information/RAG_Knowledge_Base_Architecture.md)
* **IoT Hardware Firmware:** [Overall Project Information/ESP32_Firmware.md](file:///c:/AI%20Crop%20Disease%20Detection%20System/Overall%20Project%20Information/ESP32_Firmware.md)
