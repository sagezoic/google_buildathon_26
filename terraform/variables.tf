variable "allow_unauthenticated" {
  description = "Whether to allow unauthenticated (public) access to the Cloud Run UI service"
  type        = bool
  default     = true
}

variable "artifact_registry_repo_name" {
  description = "Name of the Artifact Registry repository for UI container images"
  type        = string
  default     = "realdha-ui"
}

variable "container_image" {
  description = "Docker image URI for UI. If empty, defaults to the image in the managed Artifact Registry repository."
  type        = string
  default     = ""
}

variable "ui_container_image" {
  description = "Explicit Docker image URI for UI (takes precedence over container_image)"
  type        = string
  default     = ""
}

variable "container_port" {
  description = "Port exposed by the UI container"
  type        = number
  default     = 8080
}

variable "cpu" {
  description = "CPU allocated to the UI Cloud Run instance container (e.g. 1000m or 1)"
  type        = string
  default     = "1000m"
}

variable "create_artifact_registry" {
  description = "Whether to create Artifact Registry repositories for container images"
  type        = bool
  default     = true
}

variable "enable_apis" {
  description = "Whether to enable necessary Google Cloud APIs automatically"
  type        = bool
  default     = true
}

variable "environment" {
  description = "Deployment environment name (e.g., dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "max_instance_count" {
  description = "Maximum number of Cloud Run container instances for UI auto-scaling"
  type        = number
  default     = 10
}

variable "memory" {
  description = "Memory allocated to the UI Cloud Run instance container (e.g. 512Mi, 1Gi)"
  type        = string
  default     = "512Mi"
}

variable "min_instance_count" {
  description = "Minimum number of UI Cloud Run container instances (0 allows scaling to zero)"
  type        = number
  default     = 0
}

variable "project_id" {
  description = "The Google Cloud Project ID where resources will be deployed"
  type        = string
}

variable "region" {
  description = "Google Cloud region in the United States (e.g. us-central1, us-east1, us-west1)"
  type        = string
  default     = "us-central1"

  validation {
    condition     = can(regex("^us-", var.region))
    error_message = "The region must be located in the United States (must start with 'us-')."
  }
}

variable "service_name" {
  description = "Name of the UI Cloud Run service"
  type        = string
  default     = "realdha-ui"
}

# ------------------------------------------------------------------------------
# Backend Configuration
# ------------------------------------------------------------------------------

variable "deploy_backend" {
  description = "Whether to deploy the backend Cloud Run service and repository"
  type        = bool
  default     = true
}

variable "backend_service_name" {
  description = "Name of the Backend Cloud Run service"
  type        = string
  default     = "realdha-backend"
}

variable "backend_artifact_registry_repo_name" {
  description = "Name of the Artifact Registry repository for Backend container images"
  type        = string
  default     = "realdha-backend"
}

variable "backend_container_image" {
  description = "Docker image URI for Backend. If empty, defaults to the image in the backend Artifact Registry repository."
  type        = string
  default     = ""
}

variable "backend_container_port" {
  description = "Port exposed by the backend container"
  type        = number
  default     = 8080
}

variable "backend_cpu" {
  description = "CPU allocated to the Backend Cloud Run container"
  type        = string
  default     = "1000m"
}

variable "backend_memory" {
  description = "Memory allocated to the Backend Cloud Run container"
  type        = string
  default     = "512Mi"
}

variable "backend_min_instance_count" {
  description = "Minimum number of Backend Cloud Run instances (0 allows scaling to zero)"
  type        = number
  default     = 0
}

variable "backend_max_instance_count" {
  description = "Maximum number of Backend Cloud Run instances for auto-scaling"
  type        = number
  default     = 10
}

variable "backend_allow_unauthenticated" {
  description = "Whether to allow unauthenticated (public) access to the Backend Cloud Run service"
  type        = bool
  default     = true
}

# ------------------------------------------------------------------------------
# Cloud SQL PostgreSQL Database Configuration
# ------------------------------------------------------------------------------

variable "deploy_database" {
  description = "Whether to provision Cloud SQL PostgreSQL instance and database"
  type        = bool
  default     = true
}

variable "db_instance_name" {
  description = "Name of the Cloud SQL instance. If empty, a random unique suffix is appended (realdha-postgres-<suffix>)."
  type        = string
  default     = ""
}

variable "db_version" {
  description = "The PostgreSQL version to use for Cloud SQL"
  type        = string
  default     = "POSTGRES_16"
}

variable "db_edition" {
  description = "The edition of the Cloud SQL instance: ENTERPRISE (supports shared-core and standard tiers) or ENTERPRISE_PLUS (requires db-perf-optimized-* tiers)"
  type        = string
  default     = "ENTERPRISE"
}

variable "db_tier" {
  description = "The machine type for the Cloud SQL instance (e.g. db-f1-micro for dev/hackathon, db-custom-1-3840 for prod)"
  type        = string
  default     = "db-f1-micro"
}

variable "db_name" {
  description = "Name of the default PostgreSQL database"
  type        = string
  default     = "realdha"
}

variable "db_user" {
  description = "PostgreSQL database username"
  type        = string
  default     = "realdha"
}

variable "db_password" {
  description = "PostgreSQL password for db_user. If left empty, a secure random password is generated automatically."
  type        = string
  default     = ""
  sensitive   = true
}

variable "db_disk_size" {
  description = "The disk size in GB for the Cloud SQL instance"
  type        = number
  default     = 10
}

variable "db_disk_type" {
  description = "The disk type for the Cloud SQL instance (PD_SSD or PD_HDD)"
  type        = string
  default     = "PD_SSD"
}

variable "db_availability_type" {
  description = "The availability type for Cloud SQL: ZONAL (single zone, cost-effective) or REGIONAL (high availability failover)"
  type        = string
  default     = "ZONAL"
}

variable "db_deletion_protection" {
  description = "Whether to enable deletion protection on the Cloud SQL instance"
  type        = bool
  default     = false
}

variable "db_backup_enabled" {
  description = "Whether to enable automated daily backups for Cloud SQL"
  type        = bool
  default     = true
}

variable "db_authorized_networks" {
  description = "List of authorized IPv4 CIDRs allowed to connect directly to the database instance over public IP (e.g. for local dev)"
  type = list(object({
    name = string
    cidr = string
  }))
  default = [
    {
      name = "all"
      cidr = "0.0.0.0/0"
    }
  ]
}

variable "create_docai_processor" {
  description = "Whether to create a Document AI OCR processor in Terraform. Set to false if you do not have documentai.admin permissions or wish to create it manually."
  type        = bool
  default     = true
}

variable "docai_processor_id" {
  description = "Existing Document AI processor ID. If set, Terraform skips processor creation and passes this ID to the backend."
  type        = string
  default     = ""
}

variable "docai_location" {
  description = "Document AI location for the OCR processor (multi-region: us or eu). Keep in the US."
  type        = string
  default     = "us"
}

variable "gcs_bucket_name" {
  description = "Existing Cloud Storage bucket for uploaded property documents (created outside Terraform). Leave empty to skip the bucket IAM binding and the GCS_BUCKET_NAME env var."
  type        = string
  default     = ""
}

# ------------------------------------------------------------------------------
# Blockchain property tokens
# ------------------------------------------------------------------------------

variable "enable_chain" {
  description = "Create the Cloud KMS registrar key and pass chain settings to the backend"
  type        = bool
  default     = true
}

variable "chain_network" {
  description = "Name of the EVM network the property registry contract lives on"
  type        = string
  default     = "sepolia"
}

variable "chain_contract_address" {
  description = "Deployed PropertyRegistry address (run `bun run chain:deploy` in backend/ once). Empty until deployed."
  type        = string
  default     = ""
}

variable "chain_explorer_url" {
  description = "Block explorer base URL used for transaction links"
  type        = string
  default     = "https://sepolia.etherscan.io"
}

variable "chain_rpc_url" {
  description = "JSON-RPC endpoint for the chain (Blockchain Node Engine, Infura, Alchemy...). Stored in Secret Manager."
  type        = string
  default     = ""
  sensitive   = true
}

variable "chain_admin_token" {
  description = "Bearer token the lawyer console uses to approve and anchor a property. Stored in Secret Manager."
  type        = string
  default     = ""
  sensitive   = true
}

variable "chain_owner_salt" {
  description = "Secret salt mixed into the on-chain owner reference so it cannot be reversed to a name. Stored in Secret Manager; never change it after tokens exist."
  type        = string
  default     = ""
  sensitive   = true
}

variable "chain_public_api_url" {
  description = "Public base URL of the backend (used in token metadata URLs). Empty falls back to localhost."
  type        = string
  default     = ""
}
