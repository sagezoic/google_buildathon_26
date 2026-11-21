# Realdha Full Stack - Google Cloud Terraform Deployment (US)

This Terraform configuration automates the deployment of both the **Frontend (`realdha-ui`)** and **Backend (`backend`)** applications to **Google Cloud US** using **Cloud Run (v2)** and **Artifact Registry**.

Automated CI/CD is provided via **GitHub Actions** located in `.github/workflows/deploy.yml`.

---

## Architecture Overview

- **Compute**: Google Cloud Run (v2) serverless containers for both Frontend and Backend API.
- **Container Registry**: Google Cloud Artifact Registry (Docker format) hosted in a US region (default: `us-central1`).
- **Security & IAM**:
  - Dedicated least-privilege runtime Service Accounts: `realdha-ui-sa` and `realdha-backend-sa`.
  - Configurable unauthenticated access (`roles/run.invoker` for `allUsers`).
- **Networking**: Cloud Run HTTPS ingress endpoints automatically provisioned with Google-managed SSL.
- **Service Integration**: The UI service is automatically injected with the backend's Cloud Run URL (`BACKEND_URL`).
- **Events (Pub/Sub)**: topics `document-ingest`, `chain-anchor`, `analytics-events` and a `dead-letter` queue (pull subscriptions, 5 delivery attempts). Uploads to `gcs_bucket_name` are announced on `document-ingest`. See `pubsub.tf`.
- **Analytics (BigQuery)**: dataset `realdha_analytics` (US) with a `pubsub_events` table that `analytics-events` streams into. See `bigquery.tf`.
- **Static assets (Cloud Storage + Cloud CDN)**: a public `realdha-cdn-<project-id>` bucket behind a global HTTP(S) load balancer with Cloud CDN. HTTP on a reserved IP by default; set `cdn_domain` for a managed certificate and HTTPS. Do not store private documents there. See `cdn.tf`.
- **Cost Optimization**: Default auto-scaling configured with `min_instances = 0` (scale-to-zero when idle) up to `max_instances = 10`.

---

## Directory Structure

```text
├── .github/
│   └── workflows/
│       ├── deploy.yml            # Automated CD on push to main
│       └── terraform-plan.yml    # Linting & PR speculative plan
├── backend/                      # Node.js REST API with Dockerfile
├── docs/
│   └── github-actions-setup.md   # Step-by-step GitHub Secrets & WIF guide
├── realdha-ui/                   # React + Vite frontend with Dockerfile
└── terraform/
    ├── locals.tf                 # Labels, image resolution, and endpoints
    ├── main.tf                   # Cloud Run, Artifact Registry, IAM & APIs
    ├── pubsub.tf                 # Pub/Sub topics, subscriptions, dead-letter, GCS notification
    ├── bigquery.tf               # BigQuery dataset, events table, Pub/Sub streaming
    ├── cdn.tf                    # Public assets bucket + Cloud CDN load balancer
    ├── vertex.tf                 # Gemini on Vertex AI: backend IAM and model env vars
    ├── outputs.tf                # Service URLs and Docker push commands
    ├── providers.tf              # Google provider configuration
    ├── terraform.tf              # Required providers & version
    ├── terraform.tfvars.example  # Configuration template
    └── variables.tf              # Input variables (US region validation)
```

---

## CI/CD Deployment with GitHub Actions (Recommended)

Every push to `main` triggers `.github/workflows/deploy.yml`, which:
1. Validates and tests both Frontend and Backend applications.
2. Authenticates to Google Cloud via Workload Identity Federation or Service Account Key.
3. Automatically provisions GCP APIs and Artifact Registry repositories.
4. Builds and pushes versioned Docker container images for both services.
5. Deploys updated Cloud Run services through Terraform.
6. Publishes the live service URLs to GitHub Step Summary.

See [docs/github-actions-setup.md](../docs/github-actions-setup.md) for detailed credentials and IAM setup.

---

## Manual Quickstart Deployment

### Step 1: Configure Variables

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your project ID:

```hcl
project_id = "your-gcp-project-id"
region     = "us-central1"
```

### Step 2: Initialize Terraform & Create Repositories

```bash
terraform init
terraform apply -target=google_project_service.services -target=google_artifact_registry_repository.ui -target=google_artifact_registry_repository.backend
```

### Step 3: Build & Push Container Images

```bash
# Authenticate Docker with Artifact Registry
gcloud auth configure-docker us-central1-docker.pkg.dev

# 1. Build & Push UI
cd ../realdha-ui
docker build -t us-central1-docker.pkg.dev/<PROJECT_ID>/realdha-ui/realdha-ui:latest .
docker push us-central1-docker.pkg.dev/<PROJECT_ID>/realdha-ui/realdha-ui:latest

# 2. Build & Push Backend
cd ../backend
docker build -t us-central1-docker.pkg.dev/<PROJECT_ID>/realdha-backend/realdha-backend:latest .
docker push us-central1-docker.pkg.dev/<PROJECT_ID>/realdha-backend/realdha-backend:latest
```

### Step 4: Apply Full Infrastructure

```bash
cd ../terraform
terraform apply
```

After deployment completes, Terraform outputs the public HTTPS URLs:

```bash
Outputs:

ui_service_url      = "https://realdha-ui-xxxxxxxxxx-uc.a.run.app"
backend_service_url = "https://realdha-backend-xxxxxxxxxx-uc.a.run.app"
```

---

## Inputs & Variables

| Name | Description | Type | Default |
| :--- | :--- | :--- | :--- |
| `project_id` | **(Required)** Google Cloud project ID | `string` | - |
| `region` | US region for deployment | `string` | `"us-central1"` |
| `service_name` | Name of UI Cloud Run service | `string` | `"realdha-ui"` |
| `ui_container_image` | Docker image URI for UI | `string` | `""` |
| `deploy_backend` | Whether to deploy backend service | `bool` | `true` |
| `backend_service_name`| Name of Backend Cloud Run service | `string` | `"realdha-backend"` |
| `backend_container_image`| Docker image URI for Backend | `string` | `""` |
| `allow_unauthenticated` | Enable public UI access | `bool` | `true` |
| `backend_allow_unauthenticated` | Enable public Backend access | `bool` | `true` |
| `min_instance_count` | Minimum instances (0 = scale to zero) | `number` | `0` |
| `max_instance_count` | Maximum instances for auto-scale | `number` | `10` |
| `create_artifact_registry` | Manage Artifact Registry repos | `bool` | `true` |
| `enable_apis` | Automatically enable GCP APIs | `bool` | `true` |
| `environment` | Environment label (`dev`, `prod`) | `string` | `"prod"` |
| `deploy_database` | Provision Cloud SQL PostgreSQL | `bool` | `true` |
| `db_instance_name` | Instance name (empty for auto-suffix) | `string` | `""` |
| `db_version` | PostgreSQL database version | `string` | `"POSTGRES_16"` |
| `db_edition` | Cloud SQL edition (`ENTERPRISE` or `ENTERPRISE_PLUS`) | `string` | `"ENTERPRISE"` |
| `db_tier` | Cloud SQL machine tier | `string` | `"db-f1-micro"` |
| `db_name` | Default PostgreSQL database name | `string` | `"realdha"` |
| `db_user` | PostgreSQL database user | `string` | `"realdha"` |
| `db_password` | Database password (empty = auto-generate) | `string` | `""` |
| `db_authorized_networks` | CIDRs allowed direct access | `list(object)` | `0.0.0.0/0` |
| `enable_pubsub` | Create Pub/Sub topics, subscriptions and dead-letter queue | `bool` | `true` |
| `enable_bigquery` | Create the BigQuery dataset and events table | `bool` | `true` |
| `bigquery_dataset_id` | BigQuery dataset id | `string` | `"realdha_analytics"` |
| `bigquery_location` | BigQuery location (`US` or `us-*`) | `string` | `"US"` |
| `bigquery_deletion_protection` | Block destroy of the events table | `bool` | `false` |
| `enable_cdn` | Create the assets bucket and Cloud CDN load balancer | `bool` | `true` |
| `cdn_bucket_name` | Assets bucket name (empty = `realdha-cdn-<project_id>`) | `string` | `""` |
| `cdn_domain` | Custom domain for HTTPS (empty = HTTP on the reserved IP) | `string` | `""` |
| `cdn_cors_origins` | Origins allowed to fetch assets (CORS) | `list(string)` | `["*"]` |
| `enable_gemini` | Enable Vertex AI and grant the backend `roles/aiplatform.user` | `bool` | `true` |
| `vertex_location` | Vertex AI location for Gemini (`us-*` or `global`) | `string` | `"us-central1"` |
| `gemini_verify_model` | Model for document checks (STOP / PROCEED report) | `string` | `"gemini-3.8-flash"` |
| `gemini_chat_model` | Model for chat about a property's documents | `string` | `"gemini-3.8-flash"` |

---

## Outputs

| Name | Description |
| :--- | :--- |
| `ui_service_url` | Public HTTPS endpoint for the Frontend UI |
| `backend_service_url` | Public HTTPS endpoint for the Backend API |
| `ui_artifact_registry_repository_url` | Docker repo URL for UI container images |
| `backend_artifact_registry_repository_url` | Docker repo URL for Backend container images |
| `docker_push_commands` | Ready-to-run bash commands to build & push images |
| `service_account_email` | Frontend runtime service account identity |
| `backend_service_account_email` | Backend runtime service account identity |
| `db_instance_name` | Cloud SQL PostgreSQL instance name |
| `db_connection_name` | Cloud SQL instance connection name |
| `db_host` | Public IPv4 address for Cloud SQL instance |
| `db_port` | PostgreSQL port (5432) |
| `db_name` | PostgreSQL database name |
| `db_user` | PostgreSQL database user |
| `db_password` | Generated/configured database password (sensitive) |
| `database_url` | Direct PostgreSQL connection string for local dev (sensitive) |
| `database_url_proxy` | Localhost proxy connection string (sensitive) |
| `pubsub_topics` / `pubsub_subscriptions` | Pub/Sub topic and subscription ids by logical name |
| `bigquery_dataset_id` / `bigquery_events_table` | BigQuery dataset and the `project.dataset.table` receiving events |
| `cdn_bucket_name` | Bucket to upload public assets to |
| `cdn_ip_address` / `cdn_base_url` | CDN load balancer IP (for DNS) and the URL that serves assets |
| `gemini_config` | Gemini location and models passed to the backend |

### Gemini models

`gemini-3.8-flash` is Google's GA "workhorse" model (released 2026-09-02, supported until at least 2027-09-02), and it replaces the retired `gemini-2.5-*` models. Checks run it with `HIGH` thinking and attach the files. Chat runs it with `LOW` thinking over the OCR text. To change a model or location, edit the variables and re-apply; no code change is needed. If a model is not served in `vertex_location`, the backend returns a 502 naming the model and location. Either set `vertex_location = "global"` or pick another model.

---

## Using Cloud SQL Locally

After running `terraform apply`, retrieve the database connection string and credentials:

### Quick Setup for Backend `.env`

**PowerShell (Windows):**
```powershell
cd terraform
$dbUrl = terraform output -raw database_url
Set-Content -Path ../backend/.env -Value "DATABASE_URL=$dbUrl`nPORT=8080`nHOST=0.0.0.0`nNODE_ENV=development`nSCRAPER_DELAY_MS=1000"
```

**Bash (Linux / macOS):**
```bash
cd terraform
echo "DATABASE_URL=$(terraform output -raw database_url)" > ../backend/.env
echo "PORT=8080" >> ../backend/.env
echo "HOST=0.0.0.0" >> ../backend/.env
echo "NODE_ENV=development" >> ../backend/.env
echo "SCRAPER_DELAY_MS=1000" >> ../backend/.env
```

### View Individual Credentials

```bash
# Get Database Host (Public IP)
terraform output -raw db_host

# Get Database Name
terraform output -raw db_name

# Get Database User
terraform output -raw db_user

# Get Database Password
terraform output -raw db_password

# Get Full Connection URL
terraform output -raw database_url
```

### Run Migrations Against Cloud SQL

```bash
cd ../backend
bun run db:migrate
```

---

## Teardown / Cleanup

To delete all provisioned Google Cloud resources and avoid ongoing costs:

```bash
terraform destroy
```
