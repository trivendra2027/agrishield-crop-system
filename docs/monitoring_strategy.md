# Monitoring & Observability
- **Health Checks**: `/api/v1/health` endpoint pinged by UptimeKuma.
- **ESP32 Heartbeats**: Tracked via `last_sync` timestamp in DB.
- **LLM Logs**: Stored in `logs/llm/` for latency analysis and abuse detection.
