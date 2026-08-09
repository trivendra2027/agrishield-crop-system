# Maintenance Guide
- **AI Models**: Retrain annually prior to spring planting using updated PlantVillage datasets.
- **Database**: Run `.compact()` on MongoDB collections semi-annually.
- **Dependencies**: Monthly `npm audit fix` and `pip-audit`.
