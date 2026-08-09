# 📊 Logging & Monitoring Strategy – Agri Shield

## 1. Executive Summary

The **AI Crop Disease Detection System (Agri Shield)** incorporates a continuous observability and audit logging architecture designed to track system health, monitor AI classification throughput, record IoT sensor heartbeats, and capture security events.

This document establishes the authoritative **Logging and Monitoring Strategy**, explicitly distinguishing between **actively implemented features** in `backend/app/core/audit_logger.py` and optional recommendations for future enterprise scalability.

> [!IMPORTANT]
> **Strict Implementation Alignment:** Sections 2 and 3 document the exact logging and monitoring mechanisms currently operating in the certified production codebase. Optional third-party integrations (Prometheus, Grafana, ELK Stack, UptimeKuma) are strictly categorized in Section 4 as future architecture enhancements.

---

## 2. Actively Implemented Logging Architecture

The core logging engine is implemented in `backend/app/core/audit_logger.py`, which initializes an asynchronous, file-backed security audit logger (`security_logger`) writing to `backend/logs/security_audit.log`.

### 2.1 Structured Audit Log Format
All log entries are formatted as structured JSON strings containing ISO 8601 UTC timestamps (`Z` suffix), standardized event type identifiers, originating client IP addresses, and diagnostic detail dictionaries:

```json
{
  "timestamp": "2026-07-26T21:58:04.123456Z",
  "event_type": "LOGIN_SUCCESS",
  "client_ip": "192.168.1.100",
  "details": {
    "user_id": "64a7f9c2e1d2b3a4c5d6e7f8",
    "role": "farmer",
    "auth_method": "jwt_password"
  }
}
```

### 2.2 Standardized Event Type Registry
The audit logger actively captures eight core system events:
1. `LOGIN_SUCCESS`: Authenticated user login session initiated.
2. `LOGIN_FAILED`: Invalid credentials submitted during authentication.
3. `ACCOUNT_LOCKED`: Failed login threshold exceeded (`MAX_LOGIN_ATTEMPTS = 5`), triggering temporary lockout.
4. `PREDICTION_REQUEST`: AI crop disease classification inference requested by client.
5. `AI_PROMPT_BLOCKED`: Malicious or adversarial prompt injection attempt intercepted by guardrails.
6. `FILE_UPLOAD_BLOCKED`: Dangerous file upload (double extension, excessive size, invalid magic bytes) intercepted by `upload_validator.py`.
7. `RATE_LIMIT_EXCEEDED`: Client IP or device MAC ID exceeded sliding-window rate limits (`HTTP 429`).
8. `IOT_DATA_RECEIVED`: Valid sensor telemetry payload ingested from ESP32 hardware node.

### 2.3 Automated PII & Sensitive Data Redaction
To maintain data privacy and compliance, `audit_logger.py` executes `mask_sensitive_data()` prior to serialization. Any dictionary key matching `password`, `password_hash`, `access_token`, `refresh_token`, `jwt`, `api_key`, `secret`, or `token` is automatically replaced with `"***REDACTED***"`.

---

## 3. Actively Implemented Health & Telemetry Monitoring

### 3.1 Application & AI Model Health Polling
The backend exposes two lightweight HTTP GET endpoints for active health verification and automated readiness probing:
* **System Health (`GET /api/v1/health`):** Returns instantaneous database connectivity status, active environment mode, and server uptime.
* **AI Model Readiness (`GET /api/ai/model/status`):** Probes the ML inference pipeline (`model/predict.py`) to confirm that PyTorch / Keras model weights are loaded in memory and capable of processing leaf tensors (`ready: true`).

### 3.2 IoT Hardware Node Heartbeats & Telemetry
Implemented in `backend/app/routers/devices.py`, field-deployed ESP32 microcontrollers continuously report operational health via scheduled HTTP POST pings to `/api/v1/devices/heartbeat`.
* **Tracked Telemetry:** Battery voltage/percentage (`battery`), free SRAM heap capacity (`heap`), and node runtime seconds (`uptime`).
* **Online/Offline Transition:** Each heartbeat updates the `last_seen` UTC timestamp in the MongoDB `devices` collection. Nodes failing to report within threshold windows are automatically flagged as `status: "offline"` on administrator dashboards.

---

## 4. Optional Future Monitoring Enhancements (Not Present)

> [!NOTE]
> **Optional Future Enhancements:** The following third-party observability tools are **not implemented** in the current standalone project release. They are documented here solely as architectural recommendations for future scaling.

* **Prometheus & Grafana (Optional):** The FastAPI backend can be extended with `prometheus-fastapi-instrumentator` to expose a `/metrics` scraping endpoint, enabling Grafana dashboards to chart real-time API latency histograms, memory consumption, and Uvicorn event loop saturation.
* **Centralized Log Aggregation (Optional):** For multi-server clusters, local `security_audit.log` files can be forwarded via Filebeat or Fluentd to an Elasticsearch/Logstash/Kibana (ELK) stack or Datadog cloud console for centralized searching and anomaly alerting.
* **UptimeKuma Polling (Optional):** Automated external UptimeKuma instances can be configured to ping `/api/v1/health` at 60-second intervals to trigger Discord or SMS notifications upon server downtime.

---

## 5. Cross-References & Code Alignment

This Logging & Monitoring Strategy aligns with:
* **Audit Logger Implementation:** [backend/app/core/audit_logger.py](file:///c:/AI%20Crop%20Disease%20Detection%20System/backend/app/core/audit_logger.py)
* **Device Heartbeat Router:** [backend/app/routers/devices.py](file:///c:/AI%20Crop%20Disease%20Detection%20System/backend/app/routers/devices.py)
* **Rate Limiting Defenses:** [backend/app/core/rate_limiter.py](file:///c:/AI%20Crop%20Disease%20Detection%20System/backend/app/core/rate_limiter.py)
* **Security Architecture Defenses:** [Overall Project Information/Security_Architecture.md](file:///c:/AI%20Crop%20Disease%20Detection%20System/Overall%20Project%20Information/Security_Architecture.md)
* **Environment Configuration Reference:** [Overall Project Information/Environment_Configuration.md](file:///c:/AI%20Crop%20Disease%20Detection%20System/Overall%20Project%20Information/Environment_Configuration.md)
