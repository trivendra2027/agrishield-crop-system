# Database Architecture
## MongoDB Collections
1. **users**: Authentication data (email, hashed password, role)
2. **predictions**: Image path, raw label, confidence, gradcam, timestamp
3. **iot_telemetry**: Device status and raw sensor logs
## Retention Policy
Images > 6 months old are offloaded to cold storage. Telemetry data is aggregated monthly.
