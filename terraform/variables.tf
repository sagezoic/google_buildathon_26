variable "allow_unauthenticated" {
  description = "Whether to allow unauthenticated (public) access to the Cloud Run service"
  type        = bool
  default     = true
}

variable "artifact_registry_repo_name" {
  description = "Name of the Artifact Registry repository for UI container images"
  type        = string
  default     = "realdha-ui"
}

variable "container_image" {
  description = "Docker image URI to deploy. If empty, defaults to the image in the managed Artifact Registry repository."
  type        = string
  default     = ""
}

variable "container_port" {
  description = "Port exposed by the UI container"
  type        = number
  default     = 8080
}

variable "cpu" {
  description = "CPU allocated to the Cloud Run instance container (e.g. 1000m or 1)"
  type        = string
  default     = "1000m"
}

variable "create_artifact_registry" {
  description = "Whether to create an Artifact Registry repository for the UI container"
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
  description = "Maximum number of Cloud Run container instances for auto-scaling"
  type        = number
  default     = 10
}

variable "memory" {
  description = "Memory allocated to the Cloud Run instance container (e.g. 512Mi, 1Gi)"
  type        = string
  default     = "512Mi"
}

variable "min_instance_count" {
  description = "Minimum number of Cloud Run container instances (0 allows scaling to zero to save costs)"
  type        = number
  default     = 0
}

variable "project_id" {
  description = "The Google Cloud Project ID where the UI will be deployed"
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
  description = "Name of the Cloud Run service"
  type        = string
  default     = "realdha-ui"
}
