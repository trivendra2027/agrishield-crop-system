# 🔄 Project Workflow – Agri Shield End-to-End

## Overview

This document describes the complete end-to-end workflow of the Agri Shield system, from physical sensor readings on the ESP32 hardware to AI-powered diagnosis, multilingual advice generation, and dashboard visualization.

---

## Complete System Workflow

```mermaid
flowchart TD
    subgraph HW["🔌 Hardware Layer"]
        AHT10[AHT10 Sensor\nTemp + Humidity]
        BH1750[BH1750\nLight Intensity]
        Soil[Soil Moisture\nSensor]
        Rain[Rain Sensor]
        Battery[Battery Monitor]
        
        AHT10 & BH1750 & Soil & Rain & Battery --> ESP32[ESP32 Microcontroller]
        ESP32 --> OLED[SH1106 OLED\nDisplay]
        ESP32 --> SD[SD Card\nLocal Logging]
    end

    subgraph NET["📶 Network Layer"]
        ESP32 -- "WiFi JSON POST" --> API[FastAPI Backend\n:8000]
    end

    subgraph BE["⚙️ Backend Layer"]
        API --> Auth[Auth Router\nJWT Validation]
        API --> IoT[IoT Router\nTelemetry Ingestion]
        API --> Predict[Predict Router\nML Inference]
        API --> AIRouter[AI Router\nNVIDIA NIM]
        IoT & Predict & AIRouter --> MongoDB[(MongoDB\nDatabase)]
    end

    subgraph AI["🤖 AI Layer"]
        Predict --> TFModel[TensorFlow\nMobileNetV3 85-class]
        TFModel --> GradCAM[GradCAM++\nHeatmap Generator]
        AIRouter --> NVIDIA[NVIDIA NIM\nLlama 3.1 8B]
    end

    subgraph FE["🖥️ Frontend Layer"]
        Browser[React Web App\n:3000] --> Dashboard[Dashboard Page\nLive Sensor Data]
        Browser --> Upload[Upload Image\nLeaf Photo]
        Browser --> Result[Prediction Result\nDisease + Heatmap + Advice]
        Browser --> Chat[AI Assistant\nChat Interface]
    end

    MongoDB --> FE
    GradCAM --> MongoDB
    NVIDIA --> MongoDB
```

---

## Workflow 1: Sensor Data Collection & Display

```mermaid
sequenceDiagram
    participant Sensors
    participant ESP32
    participant OLED
    participant SD as SD Card
    participant API as FastAPI
    participant DB as MongoDB
    participant Dashboard

    loop Every 10 seconds
        Sensors->>ESP32: AHT10: temperature, humidity
        Sensors->>ESP32: BH1750: light intensity
        Sensors->>ESP32: Soil ADC: moisture %
        Sensors->>ESP32: Rain ADC: rain status
        Sensors->>ESP32: VDiv ADC: battery %
        
        ESP32->>OLED: Update display (10 FPS render)
        
        ESP32->>ESP32: JsonManager.buildTelemetryJson()
        
        alt WiFi Connected
            ESP32->>API: POST /api/v1/iot/telemetry
            API->>DB: Insert iot_telemetry document
            API->>DB: Update device last_seen
        else WiFi Disconnected
            ESP32->>SD: Queue payload to /queue/pending.json
        end
    end

    loop Dashboard polling
        Dashboard->>API: GET /api/v1/devices/status
        API->>DB: Query devices + latest telemetry
        API-->>Dashboard: Device data with sensor readings
        Dashboard-->>Dashboard: Update sensor cards
    end
```

---

## Workflow 2: Disease Detection

```mermaid
sequenceDiagram
    participant Farmer
    participant FE as React Frontend
    participant API as FastAPI
    participant ML as TensorFlow Model
    participant GC as GradCAM++
    participant DB as MongoDB
    participant LLM as NVIDIA NIM

    Farmer->>FE: Select/drag-drop leaf image
    FE->>FE: Validate file type + size
    FE->>API: POST /api/upload (multipart)
    API->>API: Validate extension + magic bytes
    API->>API: Save as UUID_filename.jpg
    API-->>FE: { image_path: "uploads/abc123_leaf.jpg" }

    Farmer->>FE: Click "Analyze Crop" button
    FE->>API: POST /api/predict { image_path, explainer_type: "gradcam++" }
    
    API->>ML: predict_crop_disease(path, "gradcam++")
    ML->>ML: Load image → RGB → 224×224 → normalize
    ML->>ML: model.predict() → softmax[85]
    ML->>ML: Get top-5 classes + confidence scores
    ML->>GC: Generate GradCAM++ heatmap
    GC->>GC: Extract last conv layer gradients
    GC->>GC: Weight + ReLU + resize + colormap
    GC-->>ML: Heatmap array
    ML->>ML: Overlay heatmap on original image
    ML->>ML: Encode to base64 PNG
    ML->>ML: Calculate uncertainty score
    ML-->>API: Full prediction dict

    API->>API: Check OOD + confidence threshold
    API->>DB: Insert prediction record
    API-->>FE: PredictionResponse JSON

    FE->>FE: Navigate to /result page
    FE->>API: POST /api/ai/farming-assistant { crop, disease, confidence }
    API->>LLM: Generate structured advice via NVIDIA NIM
    LLM-->>API: JSON advice object
    API-->>FE: FarmingAssistantResponse

    FE-->>Farmer: Display: heatmap + diagnosis + advice
```

---

## Workflow 3: AI Chatbot Conversation

```mermaid
sequenceDiagram
    participant Farmer
    participant Chat as AIAssistantPage
    participant API as FastAPI
    participant LLM as NVIDIA NIM (Llama 3.1)

    Farmer->>Chat: Opens /assistant page
    Chat->>Chat: Initialize empty history
    Chat->>Chat: Load recent prediction context
    Chat->>Chat: Load latest sensor data context

    loop Conversation
        Farmer->>Chat: Type message + click Send
        Chat->>Chat: Add message to history
        Chat->>API: POST /api/ai/chat\n{ message, history, context }
        API->>API: Build system prompt with farmer persona
        API->>API: Attach context (sensors + prediction)
        API->>LLM: chat.completions.create(Llama 3.1, messages)
        LLM-->>API: Response text
        API-->>Chat: { reply: "..." }
        Chat->>Chat: Append AI reply to display
        Chat-->>Farmer: Show AI response
    end
```

---

## Workflow 4: User Authentication

```mermaid
flowchart TD
    A[Visit any protected page] --> B{Has JWT token\nin localStorage?}
    B -- No --> C[Redirect to /login]
    B -- Yes --> D[Decode JWT expiry]
    D --> E{Token expired?}
    E -- Yes --> C
    E -- No --> F[Attach token to API requests]
    F --> G[Access protected page]

    C --> H[Enter email + password]
    H --> I[POST /api/auth/login]
    I --> J{Valid credentials?}
    J -- No --> K[Show error message]
    J -- Yes --> L[Store JWT in localStorage]
    L --> M[Store user in AuthContext]
    M --> N[Redirect to /dashboard]
```

---

## Workflow 5: ESP32 WiFi State Machine

```mermaid
stateDiagram-v2
    [*] --> DISCONNECTED: Boot
    DISCONNECTED --> SCANNING: WiFiManager::init()
    SCANNING --> CONNECTING: Known SSID found
    SCANNING --> FAILED: Max scan attempts
    CONNECTING --> CONNECTED: Association success
    CONNECTING --> RECONNECTING: Connection failed
    CONNECTED --> RECONNECTING: WiFi dropped
    RECONNECTING --> CONNECTING: Retry
    RECONNECTING --> FAILED: Max retries exceeded
    FAILED --> SCANNING: Periodic retry (5 min)
    CONNECTED --> CONNECTED: Normal operation
    
    note right of CONNECTED
        - Send telemetry every 10s
        - Send heartbeat every 30s
        - Sync NTP time
        - Flush SD queue
    end note
    
    note right of RECONNECTING
        - Queue telemetry to SD card
        - Display WiFi error on OLED
        - Continue sensor readings
    end note
```

---

## Workflow 6: Offline Data Sync

When WiFi is unavailable, the ESP32 queues data to the SD card and syncs when reconnected:

```mermaid
flowchart TD
    A[Sensor data ready] --> B{WiFi Connected?}
    B -- Yes --> C[POST /api/v1/iot/telemetry]
    B -- No --> D[StorageManager::queuePayload]
    D --> E[Save to /queue/pending.json on SD]
    
    F[WiFi Reconnected] --> G[CommunicationManager::flushQueue]
    G --> H[Read all pending payloads from SD]
    H --> I[POST each payload to backend]
    I --> J{Upload success?}
    J -- Yes --> K[Delete payload from SD queue]
    J -- No --> L[Keep in queue, retry next cycle]
    
    C --> M[Insert to MongoDB]
    K --> M
```

---

## Workflow 7: Multi-language Report Generation

```mermaid
flowchart TD
    A[Farmer clicks Download Report] --> B[ReportsPage.jsx]
    B --> C[GET /api/history - fetch all records]
    C --> D[Filter by date range if specified]
    D --> E{Export format?}
    E -- CSV --> F[Build CSV string with headers]
    E -- PDF --> G[jsPDF: create document]
    F --> H[Download CSV file]
    G --> I[jsPDF-AutoTable: add prediction table]
    I --> J[Add farm profile header]
    J --> K[Add charts if applicable]
    K --> L[Download PDF file]
```

---

## Complete Data Flow Summary

```
Physical World
    ↓ (sensors detect environment)
ESP32 Hardware (sensors → AHT10, BH1750, soil, rain, battery)
    ↓ (JSON over WiFi every 10 seconds)
FastAPI Backend (POST /api/v1/iot/telemetry)
    ↓ (insert document)
MongoDB (iot_telemetry collection)
    ↓ (GET /api/v1/devices/status polling)
React Dashboard (live sensor cards update)
    ↓ (farmer views dashboard)
Farmer sees: Temp 28.5°C | Humidity 64% | Soil 42% DRY | No Rain

Farmer uploads leaf photo
    ↓ (POST /api/upload → /api/predict)
TensorFlow MobileNetV3 (85-class inference)
    ↓ (GradCAM++ heatmap)
Prediction saved to MongoDB
    ↓ (POST /api/ai/farming-assistant)
NVIDIA NIM Llama 3.1 (generate structured advice)
    ↓
Farmer sees: Disease: Bacterial Spot 93.4% | Heatmap | Treatment plan

Farmer asks follow-up question
    ↓ (POST /api/ai/chat)
NVIDIA NIM with conversation history + sensor context
    ↓
Farmer gets: Personalized farming advice in their language
```
