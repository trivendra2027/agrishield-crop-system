# 🛠️ Installation Guide – Agri Shield (Local Setup)

## Overview

This guide explains how to set up and run the **complete Agri Shield system locally** on a Windows machine — no cloud, no Docker, no CI/CD required.

> [!IMPORTANT]
> All services (frontend, backend, MongoDB, model training) run locally on your machine. The only external service used is the NVIDIA NIM API (optional — mock mode works without it).

---

## Prerequisites

### System Requirements
| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| OS | Windows 10 (64-bit) | Windows 11 |
| RAM | 8 GB | 16 GB |
| CPU | Intel i5 / AMD Ryzen 5 | Intel i7 / AMD Ryzen 7 |
| Storage | 20 GB free | 50 GB free |
| GPU | Not required | NVIDIA GPU (for faster training) |

### Required Software

| Software | Version | Download |
|----------|---------|----------|
| Python | 3.11+ | python.org |
| Node.js | 18+ (LTS) | nodejs.org |
| MongoDB Community | 6.0+ | mongodb.com |
| Git | Any | git-scm.com |
| PlatformIO | Latest | platformio.org (for hardware) |
| VS Code | Latest | code.visualstudio.com (recommended) |

---

## Step 1: Clone / Open the Project

If working from a ZIP or cloned repository:
```powershell
# Navigate to the project directory
cd "c:\AI Crop Disease Detection System"
```

---

## Step 2: Setup MongoDB

1. **Install MongoDB Community Edition** from [mongodb.com](https://www.mongodb.com/try/download/community)

2. **Start MongoDB service:**
   ```powershell
   # If installed as Windows service (auto-start):
   net start MongoDB

   # Or start manually:
   mongod --dbpath "C:\data\db"
   ```

3. **Verify MongoDB is running:**
   ```powershell
   mongosh
   # Should show: Connecting to: mongodb://127.0.0.1:27017
   ```

4. **Create the database** (MongoDB creates it automatically on first use):
   ```
   use crop_disease_db
   ```

> [!NOTE]
> MongoDB will automatically create the `crop_disease_db` database and all collections when the backend starts for the first time.

---

## Step 3: Setup Python Backend

### 3.1 Create Python Virtual Environment
```powershell
cd "c:\AI Crop Disease Detection System"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

> [!NOTE]
> On Windows, if you get "execution policy" error, run:
> `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### 3.2 Install Backend Dependencies
```powershell
cd backend
pip install -r requirements.txt
```

This installs:
- `fastapi`, `uvicorn` – API server
- `motor`, `pymongo` – MongoDB driver
- `tensorflow-cpu` – ML inference
- `opencv-python` – Image processing + GradCAM
- `pillow`, `numpy` – Image handling
- `passlib[bcrypt]`, `python-jose` – Auth security
- `openai` – NVIDIA NIM client
- `pydantic[email]` – Schema validation

### 3.3 Configure Environment Variables
```powershell
cd "c:\AI Crop Disease Detection System\backend"
copy .env.example .env
```

Edit `.env` with your values:
```ini
HOST=127.0.0.1
PORT=8000
DEBUG=True
JWT_SECRET_KEY=your-random-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
MONGODB_URI=mongodb://localhost:27017/crop_disease_db
DATABASE_NAME=crop_disease_db
NVIDIA_API_KEY=nvapi-your-key-here
NVIDIA_API_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL_NAME=meta/llama-3.1-8b-instruct
```

> [!TIP]
> Generate a secure JWT secret: `python -c "import secrets; print(secrets.token_hex(32))"`

> [!NOTE]
> If you don't have an NVIDIA API key, leave it as the placeholder. The system will run in mock mode for AI responses.

### 3.4 Create Placeholder AI Model (First-Time Setup)
```powershell
cd "c:\AI Crop Disease Detection System"
python model/create_dummy_model.py
```
This creates `model/crop_disease_model.keras` so the backend can start without errors before the real model is trained.

### 3.5 Start the Backend
```powershell
cd "c:\AI Crop Disease Detection System\backend"
$env:PYTHONPATH = "c:\AI Crop Disease Detection System"
python -m uvicorn app.main:app --port 8000
```

**Verify backend is running:**
- Open `http://localhost:8000/` → should return: `{ "status": "healthy" }`
- Open `http://localhost:8000/docs` → Swagger UI

---

## Step 4: Setup React Frontend

### 4.1 Install Node Dependencies
```powershell
cd "c:\AI Crop Disease Detection System\frontend"
npm install
```

### 4.2 Start Frontend Development Server
```powershell
npm run dev
```

**Expected output:**
```
VITE v4.5.x  ready in 12198 ms
➜  Local:   http://localhost:3000/
➜  Network: http://192.168.x.x:3000/
```

---

## Step 5: Setup ESP32 Hardware (Optional)

### 5.1 Install PlatformIO
- Install [VS Code](https://code.visualstudio.com/)
- Install PlatformIO Extension from VS Code marketplace

### 5.2 Configure Backend URL on ESP32
Edit the `PreferencesManager` or constants file to set your local backend URL:
```cpp
// In lib/PreferencesManager or constants
const char* BACKEND_URL = "http://192.168.1.x:8000";
// Use your local machine IP (not localhost - ESP32 can't resolve localhost)
```

Find your local IP:
```powershell
ipconfig | findstr "IPv4"
# Example: 192.168.1.105
```

### 5.3 Flash ESP32
```powershell
cd "c:\AI Crop Disease Detection System\hardware\esp32_v1"
# In PlatformIO: Upload (Ctrl+Alt+U) or:
pio run --target upload
```

### 5.4 Monitor Serial Output
```powershell
pio device monitor --baud 115200
```

---

## Step 6: Run AI Model Training (Optional)

> [!WARNING]
> Training takes **15+ hours on CPU**. Ensure laptop is plugged in and laptop sleep is disabled.

```powershell
cd "c:\AI Crop Disease Detection System"
python -m model.train
```

**Control training:**
```powershell
# Check status
python -m model.utils.control_training status

# Pause training
python -m model.utils.control_training pause
# OR double-click: PAUSE_TRAINING.bat

# Resume training
python -m model.utils.control_training continue
# OR double-click: RESUME_TRAINING.bat
```

---

## Complete Startup Script

Save as `start_agrishield.ps1` and run to start all services:

```powershell
# Start MongoDB (if not running as Windows service)
# Start-Service MongoDB

# Start Backend (in new window)
Start-Process powershell -ArgumentList @(
  '-NoExit',
  '-Command',
  '$env:PYTHONPATH="c:\AI Crop Disease Detection System"; cd "c:\AI Crop Disease Detection System\backend"; python -m uvicorn app.main:app --port 8000'
)

Start-Sleep -Seconds 5  # Wait for backend to initialize

# Start Frontend (in new window)
Start-Process powershell -ArgumentList @(
  '-NoExit',
  '-Command',
  'cd "c:\AI Crop Disease Detection System\frontend"; npm run dev'
)

Write-Host "Agri Shield starting..."
Write-Host "Backend: http://localhost:8000"
Write-Host "Frontend: http://localhost:3000"
Write-Host "API Docs: http://localhost:8000/docs"
```

---

## Quick Verification Checklist

| Check | How to Verify |
|-------|--------------|
| MongoDB running | `mongosh` connects without error |
| Backend API running | `http://localhost:8000/` returns `{ "status": "healthy" }` |
| AI model loaded | `http://localhost:8000/api/ai/model/status` returns `ready: true` |
| Frontend running | `http://localhost:3000/` shows Agri Shield landing page |
| Backend accessible | Register a new user at `http://localhost:3000/register` |
| Database working | Login at `http://localhost:3000/login` succeeds |
| AI prediction | Upload test_leaf.jpg → get prediction result |
| IoT telemetry | POST test data to `/api/v1/iot/telemetry` → see in devices page |

---

## Troubleshooting

| Problem | Solution |
|---------|---------|
| `ModuleNotFoundError: No module named 'model'` | Set `PYTHONPATH="c:\AI Crop Disease Detection System"` before running uvicorn |
| Backend crashes on startup | Verify `model/crop_disease_model.keras` exists (run `create_dummy_model.py`) |
| MongoDB connection refused | Start MongoDB service: `net start MongoDB` |
| Frontend can't connect to API | Verify backend is running on port 8000, check CORS settings |
| ESP32 can't reach backend | Use machine's local IP (e.g., 192.168.1.x:8000) not localhost |
| NVIDIA API error | Leave key as placeholder; mock mode activates automatically |
| Port 8000 already in use | Kill existing process: `netstat -ano | findstr :8000` then `taskkill /PID <pid> /F` |
| Port 3000 already in use | `npm run dev -- --port 3001` |
