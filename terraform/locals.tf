locals {
  common_labels = {
    app         = "realdha-ui"
    environment = var.environment
    managed_by  = "terraform"
  }

  required_services = var.enable_apis ? [
    "run.googleapis.com",
    "artifactregistry.googleapis.com"
  ] : []

  # If container_image is not explicitly specified, fall back to the managed Artifact Registry path
  artifact_repo_host      = "${var.region}-docker.pkg.dev"
  default_container_image = "${local.artifact_repo_host}/${var.project_id}/${var.artifact_registry_repo_name}/realdha-ui:latest"
  target_container_image  = var.container_image != "" ? var.container_image : local.default_container_image
}
