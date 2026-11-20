# Realdha Backend

High-performance REST API service for Realdha built with **Bun** and **Elysia**, containerized and deployed to **Google Cloud Run** via Terraform.

---

## Features

- **Runtime**: [Bun](https://bun.sh/) — ultra-fast JavaScript/TypeScript runtime with native bundler, transpiler, and test runner.
- **Framework**: [Elysia](https://elysiajs.com/) — ergonomic, end-to-end type-safe web framework for Bun.
- **Documentation**: Automatic OpenAPI / Swagger UI at `/swagger`.
- **Cloud Run Ready**: Liveness/readiness probes (`/health`) and graceful SIGTERM/SIGINT shutdown handling.
- **Testing**: Native Bun test runner (`bun:test`).

---

## Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | API status and directory of available endpoints |
| `GET` | `/health` | Liveness & readiness health check for Cloud Run |
| `GET` | `/api/health` | API namespace health check |
| `GET` | `/api/info` | Service details, version, and runtime metadata |
| `GET` | `/swagger` | Interactive Swagger / OpenAPI documentation |

---

## Local Development

### Prerequisites

- [Bun](https://bun.sh) (v1.4.5)

### Installation & Execution

```bash
# Install dependencies
bun install

# Start local development server with hot-reload
bun run dev

# Start production server
bun start

# Run unit tests
bun test

# Type-check TypeScript
bun run typecheck
```

---

## Docker Build & Run

```bash
# Build container image
docker build -t realdha-backend:latest .

# Run container locally on port 8080
docker run -p 8080:8080 -e PORT=8080 realdha-backend:latest
```
