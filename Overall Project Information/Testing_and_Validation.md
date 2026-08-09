# 🧪 Testing and Validation – Agri Shield

## Overview

This document describes the testing methodology, expected outputs, and validation procedures for all components of the Agri Shield system.

---

## 1. Hardware Testing

### Sensor Validation Checklist

| Sensor | Test Method | Expected Output | Pass Criteria |
|--------|------------|----------------|---------------|
| AHT10 | Serial monitor | `temp: 25.0–35.0°C, humidity: 40–80%` | Within ±2°C of reference thermometer |
| BH1750 | Vary lighting | Lux increases in bright light, 0 in dark | Changes proportionally with light |
| Soil Moisture | Dry soil vs water | Dry: ~25%, Water: ~95% | ≥60% range difference |
| Rain Sensor | Drip water on pad | `rain_sensor: 1` (rain detected) | Triggers at any water contact |
| Battery Monitor | Multimeter comparison | Voltage within ±0.1V of multimeter | ADC reading matches actual voltage |
| Charging Status | Connect USB | `batteryCharging: true` on CHRG pin LOW | GPIO 4 reads LOW during charge |
| OLED Display | Boot sequence | Boot screen renders correctly | All 4 pages display without artifacts |
| SD Card | Write test | File created on SD card | File readable on PC after test |

### I2C Bus Test
Using the built-in I2C scanner (`scanI2C()` function in firmware test mode):

**Expected I2C devices found:**
```
Address: 0x38 → AHT10 (Temperature + Humidity)
Address: 0x23 → BH1750 (Light Sensor)
Address: 0x3C → SH1106 OLED Display
```

### Hardware Test Mode
Enable `HARDWARE_TEST_OLED` flag in `main.cpp` to run isolated OLED test:
1. Sets dummy sensor values
2. Rotates through all 4 display pages every 3 seconds
3. Reports frame count + heap memory every 5 seconds via Serial

**Expected Serial output:**
```
Heartbeat | Frames Rendered: 150 | Free Heap: 215088 B
```

---

## 2. API Testing

### Prerequisites
- Backend running on `http://localhost:8000`
- MongoDB running on `mongodb://localhost:27017`
- PYTHONPATH set to project root

### Authentication Tests

**Test: Register new user**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Farmer","email":"test@example.com","password":"test123"}'
```
**Expected:** `201 Created` with user object including `id`

**Test: Login**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```
**Expected:** `200 OK` with `access_token` and `user` object

**Test: Invalid login**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrongpassword"}'
```
**Expected:** `401 Unauthorized` with `"Incorrect email or password"`

---

### Prediction Tests

**Test: Image upload**
```bash
curl -X POST http://localhost:8000/api/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@test_leaf.jpg"
```
**Expected:** `201 Created` with `{ "image_path": "uploads/abc123_test_leaf.jpg" }`

**Test: AI Prediction**
```bash
curl -X POST http://localhost:8000/api/predict \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"image_path": "uploads/abc123_test_leaf.jpg", "explainer_type": "gradcam++"}'
```
**Expected:** `200 OK` with full prediction response including `gradcam_base64`

---

### IoT Tests

**Test: Telemetry ingestion**
```bash
curl -X POST http://localhost:8000/api/v1/iot/telemetry \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "ESP32_TEST",
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
    "device_status": "online"
  }'
```
**Expected:** `201 Created` with `{ "status": "success", "message": "Telemetry ingested" }`

---

### Swagger UI Testing
Navigate to `http://localhost:8000/docs` to interactively test all endpoints with built-in Swagger UI.

---

## 3. AI Model Testing

### Inference Test
```python
from model.predict import predict_crop_disease

result = predict_crop_disease("test_leaf.jpg", "gradcam++")
assert result["confidence"] > 0.3
assert result["crop_name"] is not None
assert "gradcam_base64" in result
print(f"Predicted: {result['crop_name']} - {result['disease_name']} ({result['confidence']:.1%})")
```

### Expected Results for Known Test Images

| Image | Expected Crop | Expected Disease | Min Confidence |
|-------|--------------|-----------------|---------------|
| Tomato bacterial spot leaf | Tomato | Bacterial Spot | 70% |
| Healthy tomato leaf | Tomato | Healthy | 60% |
| Potato early blight leaf | Potato | Early Blight | 65% |
| Non-crop image (car, etc.) | Rejected | OOD rejection | N/A |

### OOD Rejection Test
Upload a photo of a car/building → expect `422 Unprocessable Entity` with:
```json
{ "detail": "Low confidence - Please upload another image." }
```

### Model Health Check
```bash
curl http://localhost:8000/api/ai/model/status
```
**Expected:**
```json
{ "ready": true, "status": "Model loaded successfully", "model_type": "MobileNetV3", "num_classes": 85 }
```

---

## 4. Frontend Testing

### Browser Compatibility
| Browser | Expected Support |
|---------|----------------|
| Chrome 90+ | ✅ Full support |
| Firefox 88+ | ✅ Full support |
| Safari 14+ | ✅ Full support |
| Edge 90+ | ✅ Full support |
| IE11 | ❌ Not supported (ES modules) |

### Page Load Tests

| Page | Expected Load Time | Expected Behavior |
|------|--------------------|-------------------|
| LandingPage | < 2s | Hero, features, CTA visible |
| LoginPage | < 1s | Form visible, no console errors |
| DashboardPage | < 3s | Sensor cards populate from API |
| UploadImagePage | < 1s | Drag-drop zone visible |
| PredictionResultPage | < 5s | Loads with heatmap image from base64 |
| AIAssistantPage | < 2s | Chat interface ready |

### UI Flow Test (Manual)

1. Visit `http://localhost:3000/` → Landing page visible
2. Click "Get Started" → /register
3. Register with test credentials → redirect to login
4. Login → redirect to /dashboard
5. View dashboard → sensor cards visible (or "No device connected" if no ESP32)
6. Navigate to /upload → upload test_leaf.jpg
7. Click "Analyze Crop" → redirect to /result
8. Verify heatmap + disease name + confidence displayed
9. Navigate to /assistant → send a test message
10. Navigate to /history → prediction record visible
11. Navigate to /settings → change language → verify UI language changes

---

## 5. Integration Testing

### Full System Integration Test

**Scenario: Sensor → Backend → Dashboard**

1. ESP32 sends telemetry to `/api/v1/iot/telemetry`
2. Verify MongoDB document created in `iot_telemetry` collection
3. Verify `devices` collection updated with `last_seen` and `latest_telemetry`
4. Open dashboard → verify sensor values match what ESP32 sent

**Scenario: Image Upload → Predict → Advice**

1. Upload `test_leaf.jpg` via API
2. Run prediction with `gradcam++`
3. Verify MongoDB `predictions` collection has new document
4. Verify `gradcam_base64` field is a valid base64 string
5. Call farming assistant with prediction result
6. Verify NVIDIA API response (or mock response) is returned

---

## 6. Performance Benchmarks

| Operation | Expected Time | Acceptable Threshold |
|-----------|--------------|---------------------|
| Model inference (CPU) | 800–1500ms | < 3000ms |
| GradCAM++ generation | 200–500ms | < 1000ms |
| API upload response | < 500ms | < 1000ms |
| MongoDB query | < 50ms | < 200ms |
| Dashboard load | < 2s | < 5s |
| NVIDIA API response | 3–8s | < 15s |

---

## 7. Known Issues and Limitations

| Issue | Severity | Status | Workaround |
|-------|---------|--------|------------|
| CPU-only training is slow | Medium | By design | Use GPU if available |
| OLED SSD1306 vs SH1106 driver | Medium | Fixed | Use SH1106 library |
| PYTHONPATH must be set manually | Medium | By design | Add to startup script |
| PDF export has formatting issues | Low | Known bug | Use CSV export |
| Battery % inaccurate at < 3.2V | Low | Hardware limit | Show "LOW" instead of % |
| NVIDIA API rate limit | Medium | External | Mock mode for dev |
