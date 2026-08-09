# 🗄️ Database Entity-Relationship (ER) Diagram & Schema Specification

## 1. Executive Summary

The **AI Crop Disease Detection System** utilizes a NoSQL document database architecture powered by **MongoDB Community 6.0+**. All database interaction is managed asynchronously via the **Motor** Python driver within the FastAPI backend. 

This document provides the formal **Entity-Relationship (ER) Diagram** and detailed schema specifications for all active database collections, reflecting the exact production-certified data models implemented in `backend/app/models/schemas.py`, `backend/app/models/farm_profile.py`, and `backend/app/routers/devices.py`.

---

## 2. Complete Entity-Relationship Diagram

The following Mermaid ER Diagram maps all core database collections, their attributes, primary/foreign key relationships, and cardinality across the system.

```mermaid
erDiagram
    USERS ||--o{ PREDICTIONS : "submits"
    USERS ||--o{ FARM_PROFILES : "manages"
    USERS ||--o{ DEVICES : "owns"
    DEVICES ||--o{ IOT_TELEMETRY : "emits"
    USERS ||--o{ AUDIT_LOGS : "triggers"
    PREDICTIONS }o--o| FARM_PROFILES : "associated_with"

    USERS {
        ObjectId _id PK "Primary Key"
        string name "User full name (2-100 chars)"
        string email UK "Unique email address"
        string password "Bcrypt hashed password"
        string role "farmer | admin | tester"
        string farm_location "Optional physical location"
        string preferred_language "ISO code: en | hi | te | ta"
        boolean farmer_mode "UI simplified toggle"
        array crop_history "List of historical crop dicts"
        string farming_practices "Conventional | Organic | Integrated"
        boolean farm_profile_completed "Profile onboarding flag"
        string active_farm_id FK "Reference to active FARM_PROFILES._id"
        object notification_settings "Push/email alert preferences"
        datetime created_at "Account registration UTC timestamp"
    }

    PREDICTIONS {
        ObjectId _id PK "Primary Key"
        string user_id FK "Reference to USERS._id"
        string image_path "Relative path to uploads/"
        string crop_name "Parsed crop name (e.g. Tomato)"
        string disease_name "Parsed disease (e.g. Bacterial Spot)"
        float confidence "AI classification confidence (0.0-1.0)"
        string prediction_date "Date string YYYY-MM-DD"
        string prediction_time "Time string HH:MM:SS"
        string prediction_status "healthy | diseased | OOD"
        array top_predictions "Top 5 probability breakdown"
        float prediction_time_ms "Inference execution duration"
        string gradcam_base64 "Base64 encoded GradCAM++ heatmap"
        string heatmap_base64 "Raw attention heatmap overlay"
        string comparison_base64 "Side-by-side comparison image"
        float uncertainty_score "Entropy-based uncertainty (0.0-1.0)"
        string disease_severity "Low | Medium | High | Unknown"
        string most_affected_region "Localized infection zone"
        array possible_causes "Agronomic causes list"
        array similar_diseases "Differential diagnosis list"
        string symptoms "Observed botanical symptoms"
        string disease_stage "Early | Mid | Advanced"
        array prevention_methods "Proactive agronomic steps"
        string organic_treatment "Non-chemical remedies"
        string chemical_treatment "Fungicide/bactericide prescriptions"
        array recommended_pesticides "Specific commercial formulations"
        array recommended_fertilizers "Soil nutrient amendments"
        string safety_precautions "PPE and application safety"
        float estimated_recovery_probability "Prognosis ratio (0.0-1.0)"
        array recommended_follow_up_actions "Post-treatment monitoring steps"
        string irrigation_suggestions "Water management adjustments"
        string environmental_recommendations "Airflow and shading controls"
        object advisor "NVIDIA NIM Llama 3.1 structured advice"
        datetime created_at "Inference UTC timestamp"
    }

    FARM_PROFILES {
        ObjectId _id PK "Primary Key"
        string user_id FK "Reference to USERS._id"
        string farm_name "Farm identifier string"
        float farm_size "Total area magnitude (> 0)"
        string farm_unit "acres | hectares"
        int number_of_fields "Sub-field count (>= 1)"
        string crop_name "Primary cultivated crop"
        string crop_variety "Specific botanical cultivar"
        string growth_stage "Seedling | Vegetative | Flowering | Fruiting | Harvesting"
        string planting_date "Sowing date YYYY-MM-DD"
        string irrigation_method "Drip | Sprinkler | Flood | Rainfed | Manual"
        string water_source "Borewell | Canal | River | Pond | Tank | Rain Water"
        string state "Administrative state/province"
        string district "Administrative district"
        string village "Local village or sector"
        float latitude "GPS latitude (-90.0 to 90.0)"
        float longitude "GPS longitude (-180.0 to 180.0)"
        datetime created_at "Profile creation UTC timestamp"
        datetime updated_at "Last modification UTC timestamp"
    }

    DEVICES {
        ObjectId _id PK "Primary Key"
        string device_id UK "Unique hardware MAC / Node ID"
        string user_id FK "Owner USERS._id (Optional)"
        string firmware_version "Active firmware string (e.g. v2.0)"
        string hardware_model "Board model (e.g. ESP32 DevKit V1)"
        string hardware_version "PCB revision identifier"
        string status "online | offline | maintenance"
        float battery "Last reported battery voltage/percentage"
        int heap "Free SRAM heap in bytes"
        int uptime "System uptime in seconds"
        datetime last_seen "Last heartbeat/telemetry UTC timestamp"
    }

    IOT_TELEMETRY {
        ObjectId _id PK "Primary Key"
        string device_id FK "Reference to DEVICES.device_id"
        string timestamp "ISO 8601 UTC timestamp with Z"
        float temperature "Ambient air temperature (°C)"
        float humidity "Relative air humidity (%)"
        float pressure "Barometric pressure (hPa) [Optional]"
        float soil_moisture "Soil volumetric water content (%)"
        float light_intensity "Ambient luminosity (Lux)"
        int rain_sensor "Binary rain flag (0=No Rain, 1=Rain)"
        float battery_percentage "Remaining battery power (%)"
        float battery_voltage "Raw ADC battery voltage (V)"
        string sd_card_status "mounted | unmounted | error"
        int sd_mounted "Binary SD flag (1=Mounted, 0=Unmounted)"
        float sd_used_mb "SD storage consumed (MB)"
        float sd_total_mb "SD total capacity (MB)"
        int wifi_rssi "WiFi signal strength (dBm)"
        boolean wifi_connected "WiFi link status flag"
        boolean bluetooth_connected "BLE link status flag"
        string firmware_version "Reporting firmware version"
        string device_status "Node operational mode"
        object sensor_health "Diagnostic sensor status dictionary"
    }

    KB_ARTICLES {
        ObjectId _id PK "Primary Key"
        string article_id UK "Unique alphanumeric document ID"
        string title "Agricultural article heading"
        string crop "Associated crop name"
        string disease "Associated disease name"
        string content "Full markdown agronomic text"
        array tags "Searchable keyword tags"
        string source "Origin (PlantVillage / Agronomy Manuals)"
        datetime last_updated "Content revision timestamp"
    }
```

---

## 3. Detailed Collection Specifications

### 3.1 `users` Collection
* **Purpose:** Stores authenticated user accounts, encrypted credentials, role-based authorization levels, and customized farming preferences.
* **Indexes:**
  * `email_1` (Unique Ascending) — Enforces email uniqueness during registration and optimizes login lookups.
  * `role_1` (Ascending) — Facilitates administrative queries filtering by role (`farmer`, `admin`, `tester`).
* **Retention & Security:** Passwords are never stored in plaintext; they are hashed using `bcrypt` via Passlib prior to database insertion.

### 3.2 `predictions` Collection
* **Purpose:** Houses all AI crop disease classification records, generated GradCAM++ attention heatmaps, confidence scores, and structured treatment prescriptions.
* **Indexes:**
  * `user_id_1_created_at_-1` (Compound) — Optimizes paginated history queries (`/api/predict/history`) for individual farmers sorted by most recent diagnosis.
  * `crop_name_1_disease_name_1` (Compound) — Accelerates epidemiological analytics and disease prevalence reporting.
* **Retention Policy:** Images and high-resolution base64 heatmaps (> 6 months old) are candidates for cold storage archiving to conserve active MongoDB WiredTiger cache.

### 3.3 `farm_profiles` Collection
* **Purpose:** Stores geographical, botanical, and infrastructural profiles of agricultural fields managed by farmers.
* **Indexes:**
  * `user_id_1` (Ascending) — Rapid retrieval of all farm sectors associated with a specific user account.
  * `latitude_1_longitude_1` (2d / Compound) — Supports geospatial weather correlation and localized disease outbreak mapping.

### 3.4 `devices` & `iot_telemetry` Collections
* **Purpose:** `devices` maintains the state and health registry of ESP32 microcontrollers; `iot_telemetry` stores high-frequency time-series sensor transmissions (temperature, humidity, soil moisture, light, rain).
* **Indexes:**
  * `device_id_1` (Unique on `devices`) — Fast hardware node authentication and heartbeat updates.
  * `device_id_1_timestamp_-1` (Compound on `iot_telemetry`) — Vital for real-time dashboard charting and sliding-window anomaly detection.
* **Retention Policy:** High-frequency raw sensor telemetry is retained in active storage for 90 days, after which it is aggregated into hourly/daily statistical summaries for long-term seasonal analysis.

### 3.5 `kb_articles` Collection
* **Purpose:** Serves as the document repository for Agricultural Knowledge Base articles utilized during vector embedding generation and RAG prompt enrichment.
* **Indexes:**
  * `article_id_1` (Unique Ascending) — Prevents duplicate knowledge document ingestion.
  * `crop_1_disease_1` (Compound) — Allows fast deterministic keyword fallback lookups when vector search is offline.

---

## 4. Cross-References & Code Alignment

This ER diagram and schema specification directly corresponds to:
* **Backend Data Schemas:** [backend/app/models/schemas.py](file:///c:/AI%20Crop%20Disease%20Detection%20System/backend/app/models/schemas.py)
* **Farm Profile Models:** [backend/app/models/farm_profile.py](file:///c:/AI%20Crop%20Disease%20Detection%20System/backend/app/models/farm_profile.py)
* **Device Registration & Heartbeats:** [backend/app/routers/devices.py](file:///c:/AI%20Crop%20Disease%20Detection%20System/backend/app/routers/devices.py)
* **MongoDB Motor Lifecycle:** [backend/app/db/mongodb.py](file:///c:/AI%20Crop%20Disease%20Detection%20System/backend/app/db/mongodb.py)
* **System Architecture Context:** [Overall Project Information/Software_Architecture.md](file:///c:/AI%20Crop%20Disease%20Detection%20System/Overall%20Project%20Information/Software_Architecture.md)
