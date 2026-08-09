# Software Design Document (SDD)
## High-Level Architecture
Client-Server model via REST APIs.
## Design Patterns
- **Repository Pattern**: Abstracted MongoDB access (`db.py`).
- **Singleton Pattern**: Loaded AI model (`_model` caching in `predict.py`).
- **Strategy Pattern**: Selectable `explainer_type` (GradCAM vs ScoreCAM).
