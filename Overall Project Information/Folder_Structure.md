# 📁 Folder Structure – Agri Shield Complete Project

## Root Directory

```
c:\AI Crop Disease Detection System\
│
├── 📁 backend/                        # FastAPI REST API backend
├── 📁 frontend/                       # React + Vite web frontend
├── 📁 hardware/                       # ESP32 firmware (PlatformIO)
├── 📁 model/                          # AI training pipeline + inference
├── 📁 datasets/                       # Training dataset storage
├── 📁 uploads/                        # Uploaded leaf images (runtime)
├── 📁 logs/                           # System and training logs
├── 📁 docs/                           # Legacy design documents
├── 📁 Overall Project Information/    # THIS documentation folder
│
├── model_training                     # Live training log (plain text)
├── model training tables              # Detailed training tables
├── New model training status.md       # Training status snapshot
├── README.md                          # Project setup guide
│
├── PAUSE_TRAINING.bat                 # Pause training script
├── RESUME_TRAINING.bat                # Resume training script
├── CONTINUE_TRAINING.bat              # Continue training script
│
└── .venv/                             # Python virtual environment
```

---

## Backend Structure

```
backend/
├── app/
│   ├── main.py                    # FastAPI app factory, startup, CORS, static files
│   │                              # → Registers all 5 routers
│   │                              # → Connects MongoDB on startup
│   │                              # → Validates TF model on startup
│   │
│   ├── core/
│   │   ├── config.py              # pydantic-settings: reads .env variables
│   │   └── security.py            # bcrypt hashing, JWT creation/decode, OAuth2
│   │
│   ├── db/
│   │   └── mongodb.py             # Motor async MongoDB client
│   │                              # → connect_to_mongo() / close_mongo_connection()
│   │                              # → get_database() dependency
│   │                              # → db_instance singleton
│   │
│   ├── models/
│   │   └── schemas.py             # All Pydantic models:
│   │                              # → UserRegister, UserLogin, UserResponse
│   │                              # → TokenResponse, ProfileUpdate
│   │                              # → PredictionResponse, PredictionHistoryResponse
│   │                              # → FarmingAssistantRequest/Response
│   │                              # → ChatRequest, ChatResponse
│   │
│   ├── routers/
│   │   ├── auth.py                # /api/auth/* endpoints
│   │   │                          # → register, login, get_profile, update_profile
│   │   ├── predict.py             # /api/upload, /api/predict, /api/history
│   │   │                          # → Image upload, ML inference, history CRUD
│   │   ├── ai.py                  # /api/ai/* endpoints
│   │   │                          # → farming-assistant, chat, test
│   │   ├── iot.py                 # /api/v1/iot/* endpoints
│   │   │                          # → telemetry, heartbeat
│   │   └── devices.py             # /api/v1/devices/* endpoints
│   │                              # → register, config, ota, status
│   │
│   ├── services/
│   │   ├── nvidia_service.py      # NVIDIA NIM LLM API client
│   │   │                          # → generate_farming_advice()
│   │   │                          # → chat_with_assistant()
│   │   │                          # → test_connection()
│   │   ├── kb_manager.py          # Agricultural knowledge base loader
│   │   └── recommendation_engine.py # Crop recommendation logic
│   │
│   └── knowledge_base/            # Static agricultural JSON knowledge files
│
├── tests/                         # pytest API integration tests
├── uploads/                       # Uploaded images (served via /uploads/ endpoint)
├── requirements.txt               # Python dependencies list
├── .env                           # Active configuration (DO NOT commit)
└── .env.example                   # Template with documentation
```

---

## Frontend Structure

```
frontend/
├── index.html                     # Vite HTML entrypoint
├── package.json                   # Node package manifest + npm scripts
├── vite.config.js                 # Dev server port (3000), proxy config
├── tailwind.config.js             # Tailwind content scan + color theme
├── postcss.config.js              # PostCSS + Tailwind + autoprefixer
│
└── src/
    ├── main.jsx                   # React root: ReactDOM.createRoot + i18n init
    ├── App.jsx                    # Root: BrowserRouter, AuthProvider, all Routes
    ├── index.css                  # Global CSS (base Tailwind layers)
    │
    ├── context/
    │   └── AuthContext.jsx        # JWT auth state: user, token, login(), logout()
    │
    ├── components/
    │   ├── ProtectedRoute.jsx     # Route guard → redirect to /login if no token
    │   ├── UI.jsx                 # Shared components: Navbar, Sidebar, Footer
    │   └── dashboard/             # Dashboard-specific sub-components
    │       └── (sensor cards, prediction cards, etc.)
    │
    ├── pages/
    │   ├── LandingPage.jsx        # Public hero/marketing page
    │   ├── LoginPage.jsx          # Email + password login
    │   ├── RegisterPage.jsx       # Farmer registration form
    │   ├── DashboardPage.jsx      # Main hub: sensor data, recent predictions
    │   ├── UploadImagePage.jsx    # Drag-drop image upload + preview
    │   ├── PredictionResultPage.jsx # AI diagnosis + GradCAM + advice
    │   ├── HistoryPage.jsx        # Prediction history with search/filter
    │   ├── PredictionHistoryPage.jsx # Alternative history layout
    │   ├── DevicesPage.jsx        # ESP32 device monitoring
    │   ├── AnalyticsPage.jsx      # Charts: disease trends, sensor history
    │   ├── ReportsPage.jsx        # PDF/CSV report generation
    │   ├── AIAssistantPage.jsx    # LLM chatbot interface
    │   ├── NotificationsPage.jsx  # System notifications
    │   ├── ProfilePage.jsx        # User profile management
    │   ├── SettingsPage.jsx       # Language + app preferences
    │   └── NotFoundPage.jsx       # 404 error page
    │
    ├── services/
    │   └── api.js                 # Axios instance, interceptors, base URL config
    │
    └── i18n/
        ├── config.js              # i18next initialization (6 languages)
        └── translations.js        # All translation strings for all 6 languages
```

---

## Hardware (ESP32) Structure

```
hardware/
└── esp32_v1/
    ├── platformio.ini             # Board: esp32dev, framework: arduino, lib_deps
    │
    ├── src/
    │   ├── main.cpp               # Entry point: setup() + loop()
    │   │                          # → Boot sequence: display, sensors, wifi, API
    │   │                          # → Loop: 100ms display update, 10s telemetry, 30s heartbeat
    │   │
    │   ├── core/
    │   │   ├── MemoryManager.h    # ESP32 heap monitoring
    │   │   ├── MemoryManager.cpp  
    │   │   ├── ErrorManager.h     # Error state tracking
    │   │   └── ErrorManager.cpp   
    │   │
    │   ├── constants/             # Pin numbers, thresholds, version strings
    │   └── tests/                 # Isolated hardware test sketches
    │
    └── lib/                       # 18 custom manager libraries
        ├── ApiManager/            # HTTP API calls to backend
        ├── CalibrationManager/    # Sensor calibration constants
        ├── CommunicationManager/  # HTTP/MQTT transport + offline queuing
        ├── DiagnosticsManager/    # Boot self-test routines
        ├── DisplayManager/        # OLED rendering (SH1106)
        ├── EventManager/          # Event pub/sub system
        ├── GraphicsManager/       # Bitmap icon arrays for OLED
        ├── JsonManager/           # JSON payload builder
        ├── Logger/                # Serial debug logger (levels: info/warn/error)
        ├── OTAManager/            # OTA firmware update (planned)
        ├── PowerManager/          # Battery % + charging state
        ├── PreferencesManager/    # NVS key-value persistent storage
        ├── SensorManager/         # Read all 4 sensors
        ├── StorageManager/        # SD card mount/write/queue
        ├── SystemData/            # Global data singleton (all state)
        ├── TimeManager/           # NTP sync + time formatting
        ├── WiFiManager/           # WiFi connection state machine
        └── WidgetManager/         # Reusable OLED UI widgets
```

---

## AI Model Structure

```
model/
├── classes.json                   # 85 disease class names (sorted alphabetically)
├── crop_disease_model.keras       # Production model weights (current best)
├── train.py                       # Master training pipeline coordinator
├── predict.py                     # Inference engine + GradCAM++ + OOD detection
├── prepare_dataset.py             # Dataset scan, validate, clean, split
├── create_dummy_model.py          # Quick placeholder model for development
│
├── configs/
│   └── config.py                  # PipelineConfig: thresholds, paths, hyperparameters
│
├── models/
│   └── (model architecture definitions)
│
├── training/
│   └── (training phase implementations)
│
├── preprocessing/
│   └── (image loading, augmentation, normalization)
│
├── evaluation/
│   └── (validation metrics, confusion matrix, cross-validation)
│
├── production/
│   └── (production export utilities)
│
├── production_output/
│   └── (exported production-ready model files)
│
├── saved_models/
│   └── checkpoints/
│       ├── training_pid.json              # Active training process PID
│       ├── student_model_state.json       # KD student training state
│       └── student_model_checkpoint.keras # Latest KD checkpoint
│
├── logs/                          # Per-epoch training logs
│
└── utils/
    ├── monitor.py                 # Live training file writer (model_training updates)
    ├── control_training.py        # Training control: pause/resume/status
    ├── audit.py                   # Training audit and health checks
    ├── tracker.py                 # Epoch progress tracker
    └── logger.py                  # Training logger utility
```

---

## File Purpose Quick Reference

| File | Purpose |
|------|---------|
| `backend/app/main.py` | FastAPI app factory, startup lifecycle |
| `backend/app/core/security.py` | bcrypt + JWT security utilities |
| `backend/app/models/schemas.py` | All Pydantic data models |
| `backend/app/services/nvidia_service.py` | NVIDIA LLM API client |
| `frontend/src/App.jsx` | React router + layout |
| `frontend/src/context/AuthContext.jsx` | Auth state management |
| `frontend/src/i18n/translations.js` | All 6 language strings |
| `frontend/src/services/api.js` | Axios configuration |
| `hardware/esp32_v1/src/main.cpp` | ESP32 entry point |
| `hardware/esp32_v1/lib/SystemData/` | ESP32 global data singleton |
| `model/train.py` | AI training coordinator |
| `model/predict.py` | Inference engine |
| `model/utils/monitor.py` | Live log file writer |
| `model_training` | Live training progress log |
