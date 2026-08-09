# ⚙️ Environment Configuration Reference – Agri Shield

## 1. Executive Summary

The **AI Crop Disease Detection System (Agri Shield)** utilizes environment-based configuration management to decouple sensitive credentials, API keys, network endpoints, and operational modes from the application codebase. 

This document serves as the exhaustive, definitive reference for every environment variable implemented across the backend FastAPI server (`backend/app/core/config.py`) and the frontend React Vite application (`frontend/src/services/api.js`). 

> [!IMPORTANT]
> **Strict Implementation Alignment:** Every variable listed in this specification corresponds 100% to active code in the production-certified repository. No speculative or unverified configuration keys are included.

---

## 2. Backend Server Configuration (`backend/.env`)

The backend FastAPI application uses `pydantic-settings` (`BaseSettings`) to load and validate environment variables at startup from `.env`.

### 2.1 Core Server & Runtime Settings
| Variable Name | Data Type | Default Value | Required in Production? | Description / Operational Purpose |
| :--- | :---: | :--- | :---: | :--- |
| `ENV` | String | `"development"` | **Yes** | Controls application environment mode (`"development"`, `"staging"`, or `"production"`). In `"production"`, dynamic CORS whitelisting and strict IoT security checks are enforced. |
| `HOST` | String | `"127.0.0.1"` | No | The local network interface address where the Uvicorn ASGI server binds during standalone execution. |
| `PORT` | Integer | `8000` | No | The TCP port number where the backend API listens for incoming HTTP/WebSocket traffic. |
| `DEBUG` | Boolean | `True` | **Yes (`False`)** | Toggles verbose diagnostic stack traces and debug logging. Must be set to `False` in production environments. |

### 2.2 Cryptographic & Authentication Settings (JWT / RBAC)
| Variable Name | Data Type | Default Value | Required in Production? | Description / Operational Purpose |
| :--- | :---: | :--- | :---: | :--- |
| `JWT_SECRET_KEY` | String | *None (Must be set)* | **Yes** | Secret HMAC-SHA256 signing key (minimum 32 characters) used to generate and verify user access tokens. |
| `REFRESH_TOKEN_SECRET_KEY`| String | *None (Must be set)* | **Yes** | Dedicated secret HMAC signing key (minimum 32 characters) used exclusively for long-lived refresh tokens. |
| `JWT_ALGORITHM` | String | `"HS256"` | No | Cryptographic signing algorithm utilized by `python-jose` for JWT encoding and decoding. |
| `JWT_ISSUER` | String | `"crop_disease_detection_api"`| No | Expected `iss` (Issuer) claim embedded inside generated tokens to prevent cross-service token replay. |
| `JWT_AUDIENCE` | String | `"crop_disease_detection_app"`| No | Expected `aud` (Audience) claim verified during token decoding. |
| `ACCESS_TOKEN_EXPIRE_MINUTES`| Integer| `120` | No | Lifespan in minutes for short-lived bearer access tokens (default: 2 hours). |
| `REFRESH_TOKEN_EXPIRE_DAYS`| Integer | `7` | No | Lifespan in days for long-lived refresh tokens stored in client storage (default: 7 days). |
| `MAX_LOGIN_ATTEMPTS` | Integer | `5` | No | Threshold of consecutive failed login attempts before account lockout defense triggers. |
| `LOCKOUT_DURATION_MINUTES`| Integer | `15` | No | Duration in minutes that an account remains locked after exceeding failed login thresholds. |

### 2.3 Database & Storage Configuration
| Variable Name | Data Type | Default Value | Required in Production? | Description / Operational Purpose |
| :--- | :---: | :--- | :---: | :--- |
| `MONGODB_URI` | String | `"mongodb://localhost:27017"` | **Yes** | Standard MongoDB connection string URI pointing to the active MongoDB Community server or replica set. |
| `DATABASE_NAME` | String | `"crop_disease_db"` | No | Name of the primary database where collections (`users`, `predictions`, `devices`, etc.) are created. |
| `UPLOAD_DIR` | String | `"uploads"` | No | Relative or absolute directory path where uploaded crop leaf images are buffered and served. |
| `MAX_UPLOAD_SIZE_MB` | Integer | `15` | No | Maximum permitted image file upload size in megabytes enforced by `upload_validator.py`. |

### 2.4 External AI Intelligence & Weather Services
| Variable Name | Data Type | Default Value | Required in Production? | Description / Operational Purpose |
| :--- | :---: | :--- | :---: | :--- |
| `NVIDIA_API_KEY` | String | `""` (Empty string) | No (Optional) | API key for authenticating with NVIDIA NIM cloud services. If blank, backend operates in fallback/mock advice mode. |
| `NVIDIA_API_BASE_URL` | String | `"https://integrate.api.nvidia.com/v1"` | No | OpenAI-compatible base URL endpoint for NVIDIA NIM LLM inference routing. |
| `NVIDIA_MODEL_NAME` | String | `"meta/llama-3.1-8b-instruct"`| No | Identifier of the generative instruction-tuned LLM utilized for agricultural chatbot and diagnosis reasoning. |
| `OPENWEATHER_API_KEY` | String | `""` (Empty string) | No (Optional) | API key for fetching real-time field weather telemetry. If blank, localized simulated weather intelligence is utilized. |

### 2.5 IoT Hardware Fleet & Security Settings
| Variable Name | Data Type | Default Value | Required in Production? | Description / Operational Purpose |
| :--- | :---: | :--- | :---: | :--- |
| `IOT_API_KEY` | String | `"crop_iot_secure_key_2026"`| **Yes** | Shared secret header (`X-IoT-API-Key`) validated during telemetry ingestion (`POST /api/v1/iot/telemetry`). |
| `IOT_SECURITY_MODE` | String | `"development"` | **Yes (`"production"`)** | In `"production"`, strict API key headers and 5-minute timestamp replay protection are mandatorily enforced. |
| `ALLOWED_ORIGINS` | String | `"http://localhost:3000,..."`| **Yes** | Comma-separated list of permitted CORS client domain origins enforced when `ENV=production`. |

---

## 3. Frontend Application Configuration (`frontend/.env`)

The Vite React frontend application accesses environment variables at runtime via `import.meta.env`. Per Vite conventions, all client-exposed variables must be prefixed with `VITE_`.

| Variable Name | Data Type | Default Value | Required in Production? | Description / Operational Purpose |
| :--- | :---: | :--- | :---: | :--- |
| `VITE_API_URL` | String | `""` (Empty string) | **Yes** | Base URL pointing to the backend API server (e.g., `https://api.agrishield.farm`). If left empty, Axios defaults to relative pathing (`/api`), relying on Nginx reverse proxy routing. |

---

## 4. Operational Best Practices & Secrets Governance

1. **Separation of Secrets:** Never commit `.env` files containing production secrets (`JWT_SECRET_KEY`, `NVIDIA_API_KEY`, `MONGODB_URI`) into source control. All `.env` files must remain explicitly listed in `.gitignore`.
2. **Key Generation:** Generate cryptographic HMAC keys using cryptographically secure random generators (e.g., `openssl rand -hex 32` or Python `secrets.token_hex(32)`).
3. **Environment Parity:** Maintain identical variable key structures across development, staging, and production `.env` templates (`.env.example`) to prevent runtime deployment failures.

---

## 5. Cross-References & Code Alignment

This Environment Configuration reference aligns directly with:
* **Backend Settings Implementation:** [backend/app/core/config.py](file:///c:/AI%20Crop%20Disease%20Detection%20System/backend/app/core/config.py)
* **Frontend HTTP Client Configuration:** [frontend/src/services/api.js](file:///c:/AI%20Crop%20Disease%20Detection%20System/frontend/src/services/api.js)
* **Network & CORS Architecture:** [Overall Project Information/Network_Architecture.md](file:///c:/AI%20Crop%20Disease%20Detection%20System/Overall%20Project%20Information/Network_Architecture.md)
* **Security & Token Lifecycles:** [Overall Project Information/Security_Architecture.md](file:///c:/AI%20Crop%20Disease%20Detection%20System/Overall%20Project%20Information/Security_Architecture.md)
