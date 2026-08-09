from datetime import timezone
import re
import urllib.parse
from fastapi import Request, Response, status
from starlette.middleware.base import BaseHTTPMiddleware
from backend.app.core.config import settings

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                length = int(content_length)
                max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
                if length > max_bytes:
                    return Response(
                        content='{"detail": "Payload Too Large. Maximum allowed size is 15MB."}',
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        media_type="application/json"
                    )
            except ValueError:
                pass

        raw_query = str(request.query_params)
        if raw_query:
            decoded_query = urllib.parse.unquote(raw_query)
            dangerous_patterns = [r"<script", r"javascript:", r"union\s+select", r"drop\s+table", r"\swhere"]
            for pattern in dangerous_patterns:
                if re.search(pattern, decoded_query, re.IGNORECASE):
                    return Response(
                        content='{"detail": "Malformed or suspicious request query parameters detected."}',
                        status_code=status.HTTP_400_BAD_REQUEST,
                        media_type="application/json"
                    )

        response = await call_next(request)

        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"

        if "Server" in response.headers:
            del response.headers["Server"]
        if "x-powered-by" in response.headers:
            del response.headers["x-powered-by"]

        if settings.ENV.lower() == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
            response.headers["Content-Security-Policy"] = "default-src 'self'; img-src 'self' data: blob:; script-src 'self'; style-src 'self' 'unsafe-inline';"
            response.headers["Cross-Origin-Embedder-Policy"] = "require-corp"
            response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
            response.headers["Cross-Origin-Resource-Policy"] = "same-site"
        else:
            response.headers["Content-Security-Policy"] = "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: http: https: ws:;"
            response.headers["Cross-Origin-Resource-Policy"] = "cross-origin"

        return response
