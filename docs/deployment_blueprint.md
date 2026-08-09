# Deployment Blueprint
1. **Docker**: `docker-compose up -d --build` (spins up frontend, backend, mongodb).
2. **Nginx**: Reverse proxy mapping port 80/443 to frontend (3000) and API (8000).
3. **HTTPS**: Certbot Let's Encrypt automated SSL.
4. **Monitoring**: Prometheus + Grafana for API latencies.
