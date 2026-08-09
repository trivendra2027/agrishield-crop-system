# 🏗️ Software Architecture – Agri Shield

## Overview

The Agri Shield software stack is a **3-tier local web application** consisting of:
1. **Frontend** – React 18 SPA (Single Page Application) running on Vite dev server
2. **Backend** – FastAPI REST API running with Uvicorn
3. **Database** – MongoDB (local instance)

The AI components (disease detection model and chatbot LLM) are integrated directly into the backend as Python services.

---

## Overall Software Stack Diagram

```mermaid
graph TB
    subgraph Frontend["🖥️ Frontend (React + Vite)"]
        React["React 18 SPA\nhttp://localhost:3000"]
        TW["TailwindCSS Styling"]
        I18N["i18next\n6 Languages"]
        Recharts["Recharts Analytics"]
        jsPDF["jsPDF Reports"]
    end

    subgraph Backend["⚙️ Backend (FastAPI + Python)"]
        Uvicorn["Uvicorn ASGI Server\nhttp://localhost:8000"]
        AuthRouter["Auth Router\n/api/auth"]
        PredictRouter["Predict Router\n/api/predict"]
        AIRouter["AI Router\n/api/ai"]
        IoTRouter["IoT Router\n/api/v1/iot"]
        DevicesRouter["Devices Router\n/api/v1/devices"]
        TFModel["TensorFlow Model\nMobileNetV3 (85 classes)"]
        NVIDIAService["NVIDIA NIM Service\nLlama 3.1 8B"]
    end

    subgraph Database["🗄️ Database (MongoDB)"]
        UsersCol["users collection"]
        PredictionsCol["predictions collection"]
        IoTCol["iot_telemetry collection"]
        DevicesCol["devices collection"]
    end

    subgraph Hardware["🔌 Hardware (ESP32)"]
        ESP32["ESP32 Node\nSensors + OLED"]
    end

    React -- "REST API calls via Axios" --> Uvicorn
    ESP32 -- "JSON Telemetry over WiFi" --> IoTRouter
    ESP32 -- "Heartbeat + Device Registration" --> DevicesRouter
    AuthRouter --> UsersCol
    PredictRouter --> PredictionsCol
    PredictRouter --> TFModel
    AIRouter --> NVIDIAService
    IoTRouter --> IoTCol
    DevicesRouter --> DevicesCol
```

---

## Communication Protocols

| Connection | Protocol | Format | Port |
|------------|----------|--------|------|
| Browser → Backend | HTTP/REST | JSON | 8000 |
| ESP32 → Backend | HTTP/REST | JSON | 8000 |
| Backend → MongoDB | Motor (async) | BSON | 27017 |
| Backend → NVIDIA API | HTTPS | JSON/OpenAI | 443 |
| Frontend Dev Server | HTTP | HTML/JS/CSS | 3000 |

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant F as React Frontend
    participant B as FastAPI Backend
    participant DB as MongoDB

    U->>F: Enter email + password
    F->>B: POST /api/auth/login
    B->>DB: Find user by email
    DB-->>B: User document
    B->>B: bcrypt verify password
    B-->>F: JWT access token + user data
    F->>F: Store token in AuthContext
    F-->>U: Redirect to /dashboard

    Note over F,B: All subsequent requests include Bearer token
    F->>B: GET /api/auth/profile
    B->>B: Decode JWT → get user_id
    B->>DB: Find user by ObjectId
    DB-->>B: User document
    B-->>F: User profile data
```

---

## Image Upload + Disease Prediction Flow

```mermaid
sequenceDiagram
    participant U as Farmer
    participant F as React Frontend
    participant B as FastAPI Backend
    participant ML as TF Model
    participant DB as MongoDB
    participant LLM as NVIDIA LLM

    U->>F: Upload leaf image
    F->>B: POST /api/upload (multipart)
    B->>B: Validate file extension + magic bytes
    B->>B: Save file with UUID name
    B-->>F: { image_path: "uploads/abc123_leaf.jpg" }

    F->>B: POST /api/predict { image_path, explainer_type }
    B->>ML: predict_crop_disease(image_path, "gradcam++")
    ML->>ML: Preprocess image (224×224, normalize)
    ML->>ML: Run inference (MobileNetV3)
    ML->>ML: Apply GradCAM++ heatmap
    ML-->>B: { crop_name, disease_name, confidence, gradcam_base64, ... }
    B->>DB: Insert prediction record
    B-->>F: PredictionResponse JSON

    F->>B: POST /api/ai/farming-assistant
    B->>LLM: Generate advice (crop + disease + confidence)
    LLM-->>B: JSON advice object
    B-->>F: { treatment, prevention, ... }
    F-->>U: Display result + heatmap + advice
```

---

## IoT Telemetry Flow

```mermaid
sequenceDiagram
    participant ESP as ESP32 Node
    participant B as FastAPI Backend
    participant DB as MongoDB
    participant F as React Dashboard

    ESP->>B: POST /api/v1/iot/telemetry (JSON payload)
    B->>DB: Insert into iot_telemetry
    B->>DB: Upsert devices (last_seen, status)
    B-->>ESP: { status: "success" }

    Note over ESP,B: Every 30 seconds
    ESP->>B: POST /api/v1/iot/heartbeat
    B->>DB: Update device uptime
    B-->>ESP: { status: "success" }

    Note over F,DB: Dashboard polls backend
    F->>B: GET /api/v1/devices/status
    B->>DB: Query devices collection
    B-->>F: Device list with latest telemetry
    F-->>F: Update dashboard sensor cards
```

---

## Local Deployment Architecture

All services run on a **single machine** on the local network:

```
┌──────────────────────────────────────────────────────┐
│                  LOCAL MACHINE                       │
│                                                      │
│  ┌────────────────┐   ┌─────────────────────────┐   │
│  │ React Frontend │   │   FastAPI Backend        │   │
│  │ localhost:3000 │──►│   localhost:8000         │   │
│  │ npm run dev    │   │   python -m uvicorn      │   │
│  └────────────────┘   └────────────┬────────────┘   │
│                                    │                 │
│                        ┌───────────▼───────────┐    │
│                        │  MongoDB (local)       │    │
│                        │  localhost:27017       │    │
│                        │  mongod service        │    │
│                        └───────────────────────┘    │
│                                                      │
│  PYTHONPATH = c:\AI Crop Disease Detection System    │
└──────────────────────────────────────────────────────┘
          │
          │ WiFi (same LAN)
          │
┌─────────▼──────────────┐
│  ESP32 Hardware Node   │
│  Backend URL: http://  │
│  192.168.x.x:8000      │
└────────────────────────┘
```

---

## Environment Variables

### Backend `.env`

| Variable | Example Value | Description |
|----------|--------------|-------------|
| `HOST` | `127.0.0.1` | Backend bind host |
| `PORT` | `8000` | Backend bind port |
| `DEBUG` | `True` | Debug mode |
| `JWT_SECRET_KEY` | `<32-char random>` | JWT signing key |
| `JWT_ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | 24-hour token expiry |
| `MONGODB_URI` | `mongodb://localhost:27017/crop_disease_db` | MongoDB connection string |
| `DATABASE_NAME` | `crop_disease_db` | DB name |
| `NVIDIA_API_KEY` | `nvapi-xxxxx` | NVIDIA NIM API key |
| `NVIDIA_API_BASE_URL` | `https://integrate.api.nvidia.com/v1` | NVIDIA API endpoint |
| `NVIDIA_MODEL_NAME` | `meta/llama-3.1-8b-instruct` | LLM model name |

---

## Technology Stack Summary

### Backend
| Technology | Version | Role |
|-----------|---------|------|
| Python | 3.11+ | Language |
| FastAPI | 0.100+ | REST API framework |
| Uvicorn | 0.22+ | ASGI server |
| Motor | 3.2+ | Async MongoDB driver |
| TensorFlow CPU | 2.12+ | ML inference |
| OpenCV | 4.8+ | Image preprocessing + GradCAM |
| Pillow | 9.5+ | Image file handling |
| NumPy | 1.23+ | Array operations |
| passlib[bcrypt] | 1.7+ | Password hashing |
| python-jose | 3.3+ | JWT token operations |
| openai | 1.0+ | NVIDIA NIM API client |
| pydantic | 2.0+ | Schema validation |

### Frontend
| Technology | Version | Role |
|-----------|---------|------|
| React | 18.2 | UI framework |
| Vite | 4.4 | Build tool + dev server |
| TailwindCSS | 3.3 | Utility-first CSS |
| React Router | 6.14 | Client-side routing |
| Axios | 1.4 | HTTP client |
| i18next | 26+ | Internationalization |
| Recharts | 3.9 | Analytics charts |
| Framer Motion | 12+ | Animations |
| jsPDF | 4.2 | PDF report generation |
| Lucide React | 0.263 | Icon library |
| QRCode React | 4.2 | Device QR codes |
