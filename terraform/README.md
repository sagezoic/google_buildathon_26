# Realdha UI - Google Cloud Terraform Deployment (US)

This Terraform configuration automates the deployment of the `realdha-ui` application to **Google Cloud US** using **Cloud Run (v2)** and **Artifact Registry**.

---

## Architecture Overview

- **Compute**: Google Cloud Run (v2) fully managed serverless container service.
- **Container Registry**: Google Cloud Artifact Registry (Docker format) hosted in a US region (default: `us-central1`).
- **Security & IAM**:
  - Dedicated least-privilege runtime Service Account (`realdha-ui-sa`).
  - Configurable public unauthenticated access (`roles/run.invoker` for `allUsers`).
- **Networking**: Cloud Run HTTPS ingress endpoint automatically provisioned with managed SSL.
- **Cost Optimization**: Default auto-scaling configured with `min_instances = 0` (scale-to-zero when idle) up to `max_instances = 10`.

---

## Directory Structure

```text
terraform/
├── .gitignore                  # Ignores local state, plans, and secret tfvars
├── locals.tf                   # Common labels, service dependencies, image paths
├── main.tf                     # Cloud Run service, Artifact Registry, IAM, APIs
├── outputs.tf                  # Service URL, repo endpoints, build helpers
├── providers.tf                # Google provider configuration
├── README.md                   # Deployment documentation and instructions
├── terraform.tf                # Terraform version and Google provider requirements
├── terraform.tfvars.example    # Sample configuration values
└── variables.tf                # Input variables with validation for US regions
```

---

## Prerequisites

1. **Google Cloud Account & Project**: An active GCP project with billing enabled.
2. **Google Cloud SDK (`gcloud`)**: Authenticated to your GCP account:
   ```bash
   gcloud auth login
   gcloud auth application-default login
   gcloud config set project <YOUR_PROJECT_ID>
   ```
3. **Terraform**: Version `>= 1.5.0` installed.
4. **Docker**: Running locally to build and push container images.

---

## Quickstart Deployment

### Step 1: Create your Terraform variables

Copy the example variables file:

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` and set your `project_id`:

```hcl
project_id = "your-actual-gcp-project-id"
region     = "us-central1"
```

> **Note on Region**: The `region` variable is validated to be a United States region (must start with `us-`, e.g., `us-central1`, `us-east1`, `us-west1`, `us-east4`).

### Step 2: Initialize Terraform and Create Infrastructure / Artifact Registry

Run:

```bash
terraform init
terraform plan
terraform apply
```

This will:
- Enable the necessary GCP APIs (`run.googleapis.com`, `artifactregistry.googleapis.com`).
- Create the Artifact Registry Docker repository in your chosen US region.
- Create the dedicated Service Account.

### Step 3: Build & Push the UI Docker Image

Authenticate Docker with Google Cloud Artifact Registry:

```bash
gcloud auth configure-docker us-central1-docker.pkg.dev
```

From the root of the project, build and push the container image:

```bash
cd ../realdha-ui

# Build Docker image
docker build -t us-central1-docker.pkg.dev/<YOUR_PROJECT_ID>/realdha-ui/realdha-ui:latest .

# Push image to Artifact Registry
docker push us-central1-docker.pkg.dev/<YOUR_PROJECT_ID>/realdha-ui/realdha-ui:latest
```

### Step 4: Apply Cloud Run Deployment

Return to `terraform/` and run:

```bash
cd ../terraform
terraform apply
```

After deployment completes, Terraform outputs the public HTTPS URL:

```bash
Outputs:

service_url = "https://realdha-ui-xxxxxxxxxx-uc.a.run.app"
```

Open the URL in your browser to verify the deployed UI.

---

## Inputs & Variables

| Name | Description | Type | Default |
| :--- | :--- | :--- | :--- |
| `project_id` | **(Required)** Google Cloud project ID | `string` | - |
| `region` | US region for deployment | `string` | `"us-central1"` |
| `service_name` | Name of the Cloud Run service | `string` | `"realdha-ui"` |
| `container_image` | Docker image URI (defaults to repo image) | `string` | `""` |
| `container_port` | Port exposed by container | `number` | `8080` |
| `cpu` | Container CPU allocation | `string` | `"1000m"` |
| `memory` | Container memory allocation | `string` | `"512Mi"` |
| `min_instance_count` | Minimum instances (0 = scale to zero) | `number` | `0` |
| `max_instance_count` | Maximum instances for auto-scale | `number` | `10` |
| `allow_unauthenticated` | Enable public web traffic (`allUsers`) | `bool` | `true` |
| `create_artifact_registry` | Manage Artifact Registry repo | `bool` | `true` |
| `enable_apis` | Automatically enable GCP APIs | `bool` | `true` |
| `environment` | Environment label (`dev`, `prod`) | `string` | `"prod"` |

---

## Outputs

| Name | Description |
| :--- | :--- |
| `service_url` | Public HTTPS endpoint for the UI |
| `service_name` | Cloud Run service name |
| `service_location` | Deployed US region |
| `artifact_registry_repository_url` | Docker repository target URL |
| `docker_push_commands` | Ready-to-run bash commands to build & push image |
| `service_account_email` | Runtime service account identity |

---

## Teardown / Cleanup

To delete all provisioned Google Cloud resources and avoid ongoing costs:

```bash
terraform destroy
```
