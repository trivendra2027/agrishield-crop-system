# AgriShield AI - API Documentation

The backend service is powered by a high-performance FastAPI server communicating over REST. By default, it runs on port `8000` under localhost.

Interactive API exploration is hosted on:
* **Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🔒 Authentication API

### 1. User Registration
* **Endpoint:** `POST /api/auth/register`
* **Content-Type:** `application/json`
* **Request Body:**
  ```json
  {
    "name": "Farmer John",
    "email": "john@farmer.com",
    "password": "securepassword123",
    "role": "farmer"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "name": "Farmer John",
    "email": "john@farmer.com",
    "role": "farmer",
    "id": "649a1d48c08ea3f350c37f48",
    "created_at": "2026-06-26T14:10:00Z"
  }
  ```

### 2. User Login
* **Endpoint:** `POST /api/auth/login`
* **Content-Type:** `application/json`
* **Request Body:**
  ```json
  {
    "email": "john@farmer.com",
    "password": "securepassword123",
    "remember_me": true
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user": {
      "name": "Farmer John",
      "email": "john@farmer.com",
      "role": "farmer",
      "id": "649a1d48c08ea3f350c37f48",
      "created_at": "2026-06-26T14:10:00Z"
    }
  }
  ```

### 3. Retrieve User Profile
* **Endpoint:** `GET /api/auth/profile`
* **Headers:** `Authorization: Bearer <access_token>`
* **Response (200 OK):**
  ```json
  {
    "name": "Farmer John",
    "email": "john@farmer.com",
    "role": "farmer",
    "id": "649a1d48c08ea3f350c37f48",
    "created_at": "2026-06-26T14:10:00Z"
  }
  ```

### 4. Update Profile Settings
* **Endpoint:** `PUT /api/auth/profile`
* **Headers:** `Authorization: Bearer <access_token>`
* **Content-Type:** `application/json`
* **Request Body:** (All fields optional)
  ```json
  {
    "name": "Farmer John Updated",
    "password": "newsecurepassword456"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "name": "Farmer John Updated",
    "email": "john@farmer.com",
    "role": "farmer",
    "id": "649a1d48c08ea3f350c37f48",
    "created_at": "2026-06-26T14:10:00Z"
  }
  ```

---

## 🍃 Crop Diagnosis & History API

### 1. Upload Leaf Image
* **Endpoint:** `POST /api/upload`
* **Headers:** `Authorization: Bearer <access_token>`
* **Content-Type:** `multipart/form-data`
* **Payload:** `file` (Multipart Binary, PNG/JPG/JPEG formats, size ≤ 10MB)
* **Response (201 Created):**
  ```json
  {
    "image_path": "uploads/d4f29a08e1a84f3ab66601ad892f3922.png"
  }
  ```

### 2. Predict Leaf Health Status
* **Endpoint:** `POST /api/predict`
* **Headers:** `Authorization: Bearer <access_token>`
* **Content-Type:** `application/json`
* **Request Body:**
  ```json
  {
    "image_path": "uploads/d4f29a08e1a84f3ab66601ad892f3922.png"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "id": "649a2a5fc08ea3f350c37f52",
    "image_path": "uploads/d4f29a08e1a84f3ab66601ad892f3922.png",
    "crop_name": "Tomato",
    "disease_name": "Tomato___Early_blight",
    "confidence": 0.967,
    "prediction_date": "2026-06-26",
    "prediction_time": "14:15:30",
    "prediction_status": "diseased",
    "created_at": "2026-06-26T14:15:30.123000Z"
  }
  ```

### 3. List Scan History Logs
* **Endpoint:** `GET /api/history`
* **Headers:** `Authorization: Bearer <access_token>`
* **Query Parameters:**
  * `page` (int, default: 1)
  * `limit` (int, default: 10)
  * `search` (string, filter crop or disease names)
  * `status` (string, filter by `healthy` or `diseased`)
* **Response (200 OK):**
  ```json
  {
    "predictions": [
      {
        "id": "649a2a5fc08ea3f350c37f52",
        "image_path": "uploads/d4f29a08e1a84f3ab66601ad892f3922.png",
        "crop_name": "Tomato",
        "disease_name": "Tomato___Early_blight",
        "confidence": 0.967,
        "prediction_date": "2026-06-26",
        "prediction_time": "14:15:30",
        "prediction_status": "diseased",
        "created_at": "2026-06-26T14:15:30.123000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pages": 1
  }
  ```

### 4. Delete Scan Record
* **Endpoint:** `DELETE /api/history/{id}`
* **Headers:** `Authorization: Bearer <access_token>`
* **Response (200 OK):**
  ```json
  {
    "message": "Record successfully deleted."
  }
  ```

---

## 🤖 AI Farming Assistant API (NVIDIA NIM)

### 1. Generate Agronomic Advice
* **Endpoint:** `POST /api/ai/farming-assistant`
* **Headers:** `Authorization: Bearer <access_token>`
* **Content-Type:** `application/json`
* **Request Body:**
  ```json
  {
    "crop_name": "Tomato",
    "disease_name": "Tomato___Early_blight",
    "confidence": 0.95
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "disease_explanation": "Early blight is a common fungal disease caused by Alternaria solani that damages foliage and crops.",
    "possible_causes": [
      "High humidity combined with mild temperatures",
      "Spore transfer from infected plant waste on soil"
    ],
    "severity": "Medium",
    "organic_treatment": "Apply organic copper-based soap solutions to affected areas.",
    "chemical_treatment": "Spray systemic fungicides containing chlorothalonil in early morning.",
    "prevention_methods": [
      "Maintain a 3-year crop rotation schedule",
      "Prune the bottom 3 leaf nodes of the crop to restrict splash"
    ],
    "best_farming_practices": [
      "Irrigate strictly at soil level using drip systems",
      "Clear all organic weed trash from crop rows"
    ],
    "farmer_friendly_advice": "Check crops frequently. Timely pruning can halt this infestation quickly. You can do this!"
  }
  ```

### 2. Verify NVIDIA API Connection
* **Endpoint:** `GET /api/ai/test`
* **Response (200 OK):**
  ```json
  {
    "status": "connected",
    "model": "meta/llama-3.1-8b-instruct",
    "response": "pong"
  }
  ```

