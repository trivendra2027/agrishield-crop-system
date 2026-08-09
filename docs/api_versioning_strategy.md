# API Versioning Strategy
Future versions of the API (v2, v3) will be introduced without breaking v1.
- **Router Mapping**: `app.include_router(v2_router, prefix="/api/v2")`
- **Deprecation**: v1 endpoints will include `Deprecation` headers for 6 months prior to sunsetting.
