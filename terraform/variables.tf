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
