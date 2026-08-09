# 📡 API Specifications – Agri Shield REST API

## Overview

The Agri Shield backend exposes a REST API built with **FastAPI**. All endpoints return **JSON** responses. Authentication is handled via **JWT Bearer tokens**.

**Base URL (local):** `http://localhost:8000`  
**API Documentation:** `http://localhost:8000/docs` (Swagger UI)

---

## Authentication

### Headers Required
All protected endpoints require:
```
Authorization: Bearer <jwt_access_token>
Content-Type: application/json
```

---

## 1. Authentication API

**Base path:** `/api/auth`

---

### `POST /api/auth/register`
Register a new farmer account.

**Request Body:**
```json
{
  "name": "Ravi Kumar",
  "email": "ravi@example.com",
  "password": "secure123",
  "role": "farmer",
  "farm_location": "Hyderabad, Telangana",
  "preferred_language": "te",
  "farming_practices": "Organic",
  "crop_history": []
}
```

**Response `201 Created`:**
```json
{
  "id": "64abc123def456...",
  "name": "Ravi Kumar",
  "email": "ravi@example.com",
  "role": "farmer",
  "farm_location": "Hyderabad, Telangana",
  "preferred_language": "te",
  "farming_practices": "Organic",
  "crop_history": [],
  "created_at": "2026-07-16T18:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Email already exists → `{ "detail": "A user with this email already exists" }`
- `422 Unprocessable Entity`: Invalid fields (password too short, invalid email)

---

### `POST /api/auth/login`
Log in and receive a JWT token.

**Request Body:**
```json
{
  "email": "ravi@example.com",
  "password": "secure123",
  "remember_me": false
}
```

**Response `200 OK`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "64abc123...",
    "name": "Ravi Kumar",
    "email": "ravi@example.com",
    "role": "farmer",
    "preferred_language": "te",
    "farm_location": "Hyderabad, Telangana"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Wrong credentials → `{ "detail": "Incorrect email or password" }`

---

### `GET /api/auth/profile` 🔐
Get current user's profile.

**Response `200 OK`:** (same as UserResponse schema)

---

### `PUT /api/auth/profile` 🔐
Update user profile.

**Request Body:**
```json
{
  "name": "Ravi Kumar Updated",
  "password": "newpassword123",
  "farm_location": "Warangal, Telangana",
  "preferred_language": "hi",
  "farming_practices": "Conventional"
}
```

**Response `200 OK`:** Updated user profile

---

## 2. Image Upload API

### `POST /api/upload` 🔐
Upload a crop leaf image for analysis.

**Content-Type:** `multipart/form-data`

**Form Field:** `file` (JPG/PNG, max 10MB)

**Validation:**
- File extension: `.jpg`, `.jpeg`, `.png` only
- Magic bytes verified (actual file header checked)
- Size limit: 10MB

**Response `201 Created`:**
```json
{
  "image_path": "uploads/abc123def456_leaf_photo.jpg"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid extension or corrupted file
- `413 Request Entity Too Large`: File > 10MB

---

## 3. Disease Detection API

### `POST /api/predict` 🔐
Run AI disease prediction on an uploaded image.

**Request Body:**
```json
{
  "image_path": "uploads/abc123_leaf.jpg",
  "explainer_type": "gradcam++"
}
```

**Explainer Types:**
| Value | Method |
|-------|--------|
| `gradcam` | GradCAM (basic) |
| `gradcam++` | GradCAM++ (default, best quality) |
| `scorecam` | Score-CAM (slower but more accurate) |

**Response `200 OK`:**
```json
{
  "id": "64abc123...",
  "image_path": "uploads/abc123_leaf.jpg",
  "crop_name": "Tomato",
  "disease_name": "Bacterial Spot",
  "confidence": 0.934,
  "prediction_date": "2026-07-16",
  "prediction_time": "18:00:00",
  "prediction_status": "diseased",
  "top_predictions": [
    { "class_name": "Tomato___Bacterial_spot", "crop_name": "Tomato", "disease_name": "Bacterial Spot", "confidence": 0.934 },
    { "class_name": "Tomato___Late_blight", "crop_name": "Tomato", "disease_name": "Late Blight", "confidence": 0.041 }
  ],
  "prediction_time_ms": 1240.5,
  "gradcam_base64": "data:image/png;base64,...",
  "heatmap_base64": "data:image/png;base64,...",
  "comparison_base64": "data:image/png;base64,...",
  "uncertainty_score": 0.066,
  "disease_severity": "Medium",
  "most_affected_region": "Upper leaf surface",
  "possible_causes": ["High humidity", "Rain splash"],
  "similar_diseases": ["Bacterial canker"],
  "created_at": "2026-07-16T18:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Image file not found on server
- `422 Unprocessable Entity`: Low confidence or OOD image

---

### `GET /api/history` 🔐
Fetch paginated prediction history.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `limit` | int | 10 | Records per page (max 100) |
| `search` | string | None | Search by crop or disease name |
| `status` | string | None | Filter: `healthy` or `diseased` |

**Response `200 OK`:**
```json
{
  "predictions": [ {...}, {...} ],
  "total": 42,
  "page": 1,
  "pages": 5
}
```

---

### `DELETE /api/history/{id}` 🔐
Delete a prediction record and its uploaded image.

**Path Parameter:** `id` (MongoDB ObjectId string)

**Response `200 OK`:**
```json
{ "message": "Record successfully deleted." }
```

**Error Responses:**
- `400 Bad Request`: Invalid ID format
- `403 Forbidden`: Attempting to delete another user's record
- `404 Not Found`: Record not found

---

### `GET /api/ai/model/status`
Check AI model health status.

**Response `200 OK`:**
```json
{
  "ready": true,
  "status": "Model loaded successfully",
  "model_type": "MobileNetV3",
  "num_classes": 85
}
```

---

## 4. AI Chatbot API

### `POST /api/ai/farming-assistant` 🔐
Generate structured agronomic advice for a detected disease.

**Request Body:**
```json
{
  "crop_name": "Tomato",
  "disease_name": "Bacterial Spot",
  "confidence": 93.4
}
```

**Response `200 OK`:**
```json
{
  "disease_explanation": "Bacterial spot is caused by Xanthomonas...",
  "possible_causes": ["High humidity", "Rain splash"],
  "severity": "Medium",
  "organic_treatment": "Apply copper-based spray...",
  "chemical_treatment": "Apply Mancozeb 75% WP...",
  "prevention_methods": ["Use certified seeds", "Drip irrigation"],
  "best_farming_practices": ["Apply mulch", "Sanitize tools"],
  "farmer_friendly_advice": "Your tomato plants can recover with timely action!"
}
```

---

### `POST /api/ai/chat` 🔐
Send a chat message to the agricultural assistant.

**Request Body:**
```json
{
  "message": "What is the best time to irrigate tomatoes?",
  "history": [
    { "role": "user", "content": "My plants look pale" },
    { "role": "assistant", "content": "This could be nitrogen deficiency..." }
  ],
  "context": {
    "recent_prediction": { "crop_name": "Tomato", "disease_name": "Bacterial Spot", "confidence": 93.4 },
    "sensor_data": { "temperature": 28.5, "humidity": 64.2, "soil_moisture": 42.5 }
  }
}
```

**Response `200 OK`:**
```json
{
  "reply": "Based on your current sensor readings and the bacterial spot infection..."
}
```

---

### `GET /api/ai/test`
Test NVIDIA API connectivity.

**Response `200 OK`:**
```json
{ "status": "connected", "model": "meta/llama-3.1-8b-instruct" }
```

---

## 5. IoT Telemetry API

### `POST /api/v1/iot/telemetry`
Ingest sensor telemetry from ESP32 hardware node.

**Request Body:**
```json
{
  "device_id": "ESP32_AA:BB:CC:DD:EE:FF",
  "timestamp": "2026-07-16T18:00:00Z",
  "temperature": 28.5,
  "humidity": 64.2,
  "soil_moisture": 42.5,
  "light_intensity": 8542.0,
  "rain_sensor": 0,
  "battery_percentage": 78.0,
  "sd_card_status": "mounted",
  "wifi_rssi": -52,
  "firmware_version": "v2.4.1",
  "device_status": "online",
  "sensor_health": {
    "aht10": "ok",
    "bh1750": "ok",
    "soil": "ok",
    "rain": "ok"
  }
}
```

**Response `201 Created`:**
```json
{ "status": "success", "message": "Telemetry ingested" }
```

---

### `POST /api/v1/iot/heartbeat`
Send device heartbeat to confirm uptime.

**Request Body:**
```json
{
  "device_id": "ESP32_AA:BB:CC:DD:EE:FF",
  "timestamp": "2026-07-16T18:30:00Z",
  "status": "online",
  "uptime_ms": 3600000
}
```

**Response `200 OK`:**
```json
{ "status": "success", "message": "Heartbeat acknowledged" }
```

---

## 6. Device Management API

### `POST /api/v1/devices/register`
Register or update an ESP32 device.

**Request Body:**
```json
{
  "device_id": "ESP32_AA:BB:CC:DD:EE:FF",
  "firmware_version": "v2.4.1",
  "hardware_model": "ESP32-WROOM-32"
}
```

**Response `200 OK`:**
```json
{ "status": "success", "message": "Device registered" }
```

---

### `GET /api/v1/devices/status`
Get status of all registered devices.

**Response `200 OK`:**
```json
[
  {
    "device_id": "ESP32_AA:BB:CC:DD:EE:FF",
    "firmware_version": "v2.4.1",
    "hardware_model": "ESP32-WROOM-32",
    "status": "online",
    "last_seen": "2026-07-16T18:30:00Z",
    "uptime_ms": 3600000,
    "latest_telemetry": { ...telemetry_doc... }
  }
]
```

---

### `GET /api/v1/devices/{device_id}/config`
Retrieve backend-driven configuration for an ESP32.

**Response `200 OK`:**
```json
{
  "update_interval_ms": 60000,
  "deep_sleep_enabled": false,
  "sensor_calibration": {}
}
```

---

### `GET /api/v1/devices/{device_id}/ota`
Check if a firmware update is available.

**Query Parameters:** `current_version` (string, e.g., `v2.4.1`)

**Response `200 OK`:**
```json
{
  "update_available": false,
  "latest_version": "v2.4.1",
  "download_url": ""
}
```

---

## API Summary Table

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login + get JWT |
| GET | `/api/auth/profile` | ✅ | Get user profile |
| PUT | `/api/auth/profile` | ✅ | Update profile |
| POST | `/api/upload` | ✅ | Upload leaf image |
| POST | `/api/predict` | ✅ | AI disease prediction |
| GET | `/api/history` | ✅ | Prediction history |
| DELETE | `/api/history/{id}` | ✅ | Delete prediction |
| GET | `/api/ai/model/status` | ❌ | AI model health |
| POST | `/api/ai/farming-assistant` | ✅ | Get farming advice |
| POST | `/api/ai/chat` | ✅ | Chat with assistant |
| GET | `/api/ai/test` | ❌ | Test NVIDIA API |
| POST | `/api/v1/iot/telemetry` | ❌ | Ingest sensor data |
| POST | `/api/v1/iot/heartbeat` | ❌ | Device heartbeat |
| POST | `/api/v1/devices/register` | ❌ | Register device |
| GET | `/api/v1/devices/status` | ❌ | All devices status |
| GET | `/api/v1/devices/{id}/config` | ❌ | Device config |
| GET | `/api/v1/devices/{id}/ota` | ❌ | OTA update check |

> [!NOTE]
> IoT endpoints don't require JWT auth because the ESP32 cannot easily manage Bearer tokens. In Phase 2, consider implementing device-level API keys.
