# Realdha Backend

High-performance REST API service for Realdha built with **Bun** and **Elysia**, containerized and deployed to **Google Cloud Run** via Terraform. Includes the **Flat Finder** backend for society and flat discovery (Pune & multi-city), powered by PostgreSQL (Drizzle ORM) and a Bun-based Magicbricks + OpenStreetMap scraping and scoring pipeline.

---

## Features

- **Runtime**: [Bun](https://bun.sh/) — ultra-fast JavaScript/TypeScript runtime with native bundler, transpiler, and test runner.
- **Framework**: [Elysia](https://elysiajs.com/) — ergonomic, end-to-end type-safe web framework for Bun.
- **Database**: PostgreSQL 17 with [Drizzle ORM](https://orm.drizzle.team/) using native Bun SQL driver (`drizzle-orm/bun-sql`). Lazy connection keeps app imports lightweight and CI tests database-free.
- **Flat Finder Scraper**: High-performance multi-stage scraper for Magicbricks projects and OpenStreetMap POIs with polite concurrency, backoff, and gzip disk caching.
- **Scoring & Pricing Models**: Automated rental yields, outlier detection, nearest POI distance calculations, and multifaceted 0-10 Flat Finder scores.
- **Documentation**: Automatic OpenAPI / Swagger UI at `/swagger`.
- **Cloud Run Ready**: Liveness/readiness probes (`/health`) and graceful SIGTERM/SIGINT shutdown handling.
- **Testing**: Native Bun test runner (`bun:test`) with comprehensive parser, algorithm, and integration test suites.

---

## Endpoints

### System & Health Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | API status and directory of available endpoints |
| `GET` | `/health` | Liveness & readiness health check for Cloud Run |
| `GET` | `/api/health` | API namespace health check |
| `GET` | `/api/info` | Service details, version, and runtime metadata |
| `GET` | `/swagger` | Interactive Swagger / OpenAPI documentation |

### Flat Finder Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/flats/cities` | List supported cities with active society counts |
| `GET` | `/api/flats/societies` | Search societies with multifaceted filters (BHK, price, rent, amenities, POI proximity, sort) |
| `GET` | `/api/flats/societies/:id` | Full society detail with unit types, BHK prices, sample listings, and reviews |
| `GET` | `/api/flats/localities?city=pune` | Locality breakdown with society counts and median prices |
| `GET` | `/api/flats/compare?ids=mb_1,mb_2` | Side-by-side comparison of 2 to 5 societies |

---

## Database Setup & Drizzle Workflow

Postgres 17 runs locally via Docker Compose or an external Postgres database via `DATABASE_URL`.

### 1. Start Local Postgres
```bash
docker compose up -d
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default connection string:
```env
DATABASE_URL=postgres://realdha:realdha@localhost:5432/realdha
SCRAPER_DELAY_MS=1000
```

### 3. Run Migrations
```bash
# Generate SQL migrations if schema.ts is modified
bun run db:generate

# Apply migrations to database
bun run db:migrate

# Open Drizzle Studio visual browser
bun run db:studio
```

CI does not run migrations. Run `bun run db:migrate` against Cloud SQL (with `DATABASE_URL` set to it) before deploying a change that adds tables.

---

## Property documents (upload, OCR, translation)

`/api/properties` backs the Add Property flow:

1. `POST /api/properties` creates a draft; `PUT /api/properties/:id` updates it.
2. `POST /api/properties/:id/documents` (multipart `file` + `slot`) stores the file in Cloud Storage under `properties/<id>/<slot>/`.
3. `POST /api/properties/:id/documents/:docId/process` reads it with Document AI (Enterprise OCR), detects the language, translates to English with Cloud Translation unless it is already English, extracts key fields (gat, village, owner, area, mutation numbers) and stores everything.
4. `GET /api/properties/:id/documents/:docId` returns the original and English text.

Needs `DOCAI_PROCESSOR_ID` (an `OCR_PROCESSOR` in `DOCAI_LOCATION`, default `us`), the Document AI and Translation APIs enabled, and the roles `roles/documentai.apiUser` and `roles/cloudtranslate.user` for the runtime identity. Terraform creates the processor and grants these. Online OCR reads up to 30 pages per PDF.

---

## Scraper CLI

The scraper collects and scores society data for any supported city (default: `pune`).

```bash
# Full pipeline for Pune (list, projects, osm, build)
bun run scrape pune

# Test run with page and project limits
bun run scrape pune --stage all --pages 2 --limit 10

# Run specific stage only
bun run scrape pune --stage list --pages 3
bun run scrape pune --stage projects --limit 50
bun run scrape pune --stage osm
bun run scrape pune --stage build
```

---

## Local Development

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
docker run -p 8080:8080 -e PORT=8080 -e DATABASE_URL=postgres://user:pass@host:5432/db realdha-backend:latest
```
