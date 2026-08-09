# 🛠️ Maintenance Guide & Operational Schedules – Agri Shield

## 1. Executive Summary

The **AI Crop Disease Detection System (Agri Shield)** requires routine preventative maintenance to maintain high AI diagnostic accuracy, database query performance, hardware sensor reliability, and software vulnerability defense.

This document establishes the authoritative **Operational Maintenance Guide**, detailing scheduled procedures for AI model retraining, MongoDB database optimization, dependency vulnerability patching, RAG knowledge base synchronization, and physical IoT hardware servicing based exclusively on active system components.

> [!IMPORTANT]
> **Strict Implementation Alignment:** All maintenance tasks detailed below operate directly on the certified production codebase (`backend/`, `frontend/`, `model/`, `knowledge_base/`, and ESP32 hardware firmware). Zero speculative or external cloud dependencies are mandated.

---

## 2. Maintenance Schedule Matrix

| Maintenance Component | Task Description | Recommended Frequency | Target Asset / Module | Responsible Role |
| :--- | :--- | :---: | :--- | :---: |
| **RAG Knowledge Base** | Ingest new agricultural PDF manuals & rebuild FAISS vector index. | Monthly | `kb_manager.py` / `knowledge_base/` | System Admin |
| **MongoDB Database** | Execute collection compaction, index defragmentation, and cache cleanup. | Semi-Annually | `crop_disease_db` / MongoDB Server| System Admin |
| **AI ML Classification Models** | Evaluate diagnostic accuracy against new seasonal data & retrain weights. | Annually (Pre-Season)| `model/train.py` / `model/` | AI / ML Engineer |
| **Software Dependencies**| Audit and patch Python/Node.js package vulnerabilities (`npm audit` / `pip-audit`). | Monthly | `requirements.txt` / `package.json` | DevOps / Developer |
| **IoT Sensor Hardware** | Physical electrode cleaning, optical calibration, and battery inspection. | Quarterly | ESP32 DevKit V1 & Attached Sensors| Field Technician |

---

## 3. Detailed Maintenance Procedures

### 3.1 RAG Knowledge Base Synchronization (`kb_manager.py`)
To ensure the AgriBot chatbot provides up-to-date agronomic advice, administrators must periodically update the local document repository:
1. **Document Ingestion:** Copy new or revised authoritative agricultural PDF manuals directly into `knowledge_base/documents/`.
2. **Trigger Index Rebuild:** Execute a programmatic call or restart the backend service to invoke `KBManager::update_knowledge_base()`.
3. **Verification:** The service automatically calculates MD5 file hashes, extracts text chunks (500 chars / 50 overlap), regenerates 384-dimensional SentenceTransformer embeddings, and overwrites `knowledge_base/vector_store.faiss` and `kb_manifest.json`.

### 3.2 MongoDB Database Optimization & Cleanup
Over extended operational periods, high-frequency IoT telemetry ingestion (`iot_telemetry`) and image classification history (`predictions`) can cause storage fragmentation.
1. **Prune Cache & Temporary Records:**
   ```bash
   # Connect to local MongoDB shell and purge expired weather cache and revoked tokens
   mongosh "mongodb://localhost:27017/crop_disease_db" --eval 'db.weather_cache.deleteMany({}); db.revoked_tokens.deleteMany({"expires_at": {"$lt": new Date()}});'
   ```
2. **Execute Collection Compaction:**
   ```bash
   # Defragment WiredTiger storage and rebuild indexes on high-volume collections
   mongosh "mongodb://localhost:27017/crop_disease_db" --eval 'db.runCommand({compact: "iot_telemetry"}); db.runCommand({compact: "predictions"});'
   ```

### 3.3 AI Model Evaluation & Annual Retraining
Prior to major regional planting seasons, the AI classification model must be evaluated and retrained to incorporate new disease strains and localized leaf data:
1. **Dataset Curation:** Expand the local training dataset (`model/data/`) with validated user-uploaded images harvested from the `uploads/` directory where diagnostic confidence was low or marked as Out-of-Distribution (OOD).
2. **Execute Retraining Pipeline:**
   ```bash
   # Run local model retraining script (supports GPU acceleration if available)
   python model/train.py --dataset model/data/ --epochs 30 --batch-size 32
   ```
3. **Model Health Verification:** Upon model checkpoint generation (`.keras` / `.pt`), invoke `GET /api/ai/model/status` to confirm structural compatibility and inference readiness.

### 3.4 Software Vulnerability Patching
To protect against emerging Common Vulnerabilities and Exposures (CVEs) in open-source packages:
1. **Python Backend Audit:**
   ```bash
   pip install pip-audit
   pip-audit -r backend/requirements.txt
   ```
2. **Node.js Frontend Audit:**
   ```bash
   cd frontend && npm audit fix
   ```

### 3.5 Physical IoT Hardware & Sensor Servicing
Field-deployed ESP32 sensor nodes require routine physical servicing to prevent environmental degradation:
* **Soil Moisture Sensor (Analog GPIO 34):** Clean resistive/capacitive prongs with distilled water and fine sandpaper to remove mineral crusting and galvanic corrosion.
* **BH1750 Light Sensor (I2C 0x23):** Wipe the optical acrylic dome with microfiber cloth to remove dust, pollen, and mud buildup that attenuates lux readings.
* **Rain Sensor Plate (Analog GPIO 35):** Remove oxidized residue and leaf debris from parallel conductive tracks.
* **Power & Battery Inspection:** Measure 18650 lithium battery terminal voltage across the voltage divider (GPIO 36). Replace cells unable to sustain > 3.7V under active WiFi transmission loads.

---

## 4. Cross-References & Code Alignment

This Maintenance Guide aligns with:
* **RAG Knowledge Base Architecture:** [Overall Project Information/RAG_Knowledge_Base_Architecture.md](file:///c:/AI%20Crop%20Disease%20Detection%20System/Overall%20Project%20Information/RAG_Knowledge_Base_Architecture.md)
* **Backup & Recovery Procedures:** [Overall Project Information/Backup_and_Recovery_Strategy.md](file:///c:/AI%20Crop%20Disease%20Detection%20System/Overall%20Project%20Information/Backup_and_Recovery_Strategy.md)
* **AI Disease Detection Pipeline:** [Overall Project Information/AI_Disease_Detection.md](file:///c:/AI%20Crop%20Disease%20Detection%20System/Overall%20Project%20Information/AI_Disease_Detection.md)
* **ESP32 Hardware & Sensor Specifications:** [Overall Project Information/ESP32_Firmware.md](file:///c:/AI%20Crop%20Disease%20Detection%20System/Overall%20Project%20Information/ESP32_Firmware.md)
* **Backend Database Driver Lifecycle:** [backend/app/db/mongodb.py](file:///c:/AI%20Crop%20Disease%20Detection%20System/backend/app/db/mongodb.py)
