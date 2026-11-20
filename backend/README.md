# Realdha Backend

Node.js REST API service for Realdha, containerized and configured for automated deployment to **Google Cloud Run** through Terraform.

---

## Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | API status and directory of available endpoints |
| `GET` | `/health` | Liveness & readiness health check for Cloud Run |
| `GET` | `/api/health` | API namespace health check |
| `GET` | `/api/info` | Service details and version |

---

## Local Development

```bash
# Install dependencies
npm install

# Start local server
npm start

# Run unit tests
npm test
```

---

## Docker Build & Run

```bash
# Build container image
docker build -t realdha-backend:latest .

# Run container locally on port 8080
docker run -p 8080:8080 -e PORT=8080 realdha-backend:latest
```
