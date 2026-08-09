# Permanent API Contract
## POST /api/v1/predict/upload
- Request: `multipart/form-data` (file)
- Response: `{"image_path": "uploads/abc.jpg"}`
## POST /api/v1/ai/chat
- Request: `{"message": "help", "context": {"sensor_data": {...}}}`
- Response: `{"reply": "..."}`
