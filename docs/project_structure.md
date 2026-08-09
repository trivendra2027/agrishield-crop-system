# Project Structure Audit
- `backend/`: FastAPI application, routers, services.
- `frontend/`: React SPA, pages, components.
- `model/`: TensorFlow training and inference scripts.
- `evaluation/`: Output matrices, ROC curves, calibration metrics.
- `docs/`: Master documentation suite.
Recommendation: Redundant `tests/` folders in subdirectories should be consolidated to a root `tests/` directory.
