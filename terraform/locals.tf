locals {
  common_labels = {
    app         = "realdha"
    environment = var.environment
    managed_by  = "terraform"
  }

  required_services = var.enable_apis ? [
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "iam.googleapis.com"
  ] : []

  artifact_repo_host = "${var.region}-docker.pkg.dev"

  # UI Container Image resolution
  default_ui_container_image = "${local.artifact_repo_host}/${var.project_id}/${var.artifact_registry_repo_name}/realdha-ui:latest"
  target_ui_container_image = (
    var.ui_container_image != "" ? var.ui_container_image : (
      var.container_image != "" ? var.container_image : local.default_ui_container_image
    )
  )

  # Target container image kept for backward compatibility
  target_container_image = local.target_ui_container_image

  # Backend Container Image resolution
  default_backend_container_image = "${local.artifact_repo_host}/${var.project_id}/${var.backend_artifact_registry_repo_name}/realdha-backend:latest"
  target_backend_container_image  = var.backend_container_image != "" ? var.backend_container_image : local.default_backend_container_image
}
