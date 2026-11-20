output "artifact_registry_repository_id" {
  description = "ID of the UI Artifact Registry repository"
  value       = try(google_artifact_registry_repository.ui[0].id, "")
}

output "artifact_registry_repository_url" {
  description = "UI Artifact Registry Docker repository URL (backward compatibility)"
  value       = "${local.artifact_repo_host}/${var.project_id}/${var.artifact_registry_repo_name}"
}

output "ui_artifact_registry_repository_url" {
  description = "Artifact Registry Docker repository URL for UI container images"
  value       = "${local.artifact_repo_host}/${var.project_id}/${var.artifact_registry_repo_name}"
}

output "backend_artifact_registry_repository_url" {
  description = "Artifact Registry Docker repository URL for Backend container images"
  value       = var.deploy_backend ? "${local.artifact_repo_host}/${var.project_id}/${var.backend_artifact_registry_repo_name}" : ""
}

output "service_account_email" {
  description = "Service account email attached to the UI Cloud Run service"
  value       = google_service_account.ui.email
}

output "backend_service_account_email" {
  description = "Service account email attached to the Backend Cloud Run service"
  value       = try(google_service_account.backend[0].email, "")
}

output "service_id" {
  description = "Identifier of the deployed UI Cloud Run service"
  value       = google_cloud_run_v2_service.ui.id
}

output "service_location" {
  description = "Location (US region) where the Cloud Run service is deployed"
  value       = google_cloud_run_v2_service.ui.location
}

output "service_name" {
  description = "Name of the deployed UI Cloud Run service"
  value       = google_cloud_run_v2_service.ui.name
}

output "service_url" {
  description = "Public URL of the deployed UI Cloud Run service (backward compatibility)"
  value       = google_cloud_run_v2_service.ui.uri
}

output "ui_service_url" {
  description = "Public URL of the deployed UI Cloud Run service"
  value       = google_cloud_run_v2_service.ui.uri
}

output "backend_service_url" {
  description = "Public URL of the deployed Backend Cloud Run service"
  value       = try(google_cloud_run_v2_service.backend[0].uri, "")
}

output "docker_push_commands" {
  description = "Commands to build, tag, and push container images"
  value       = <<-EOT
    # 1. Authenticate Docker with Google Cloud Artifact Registry
    gcloud auth configure-docker ${local.artifact_repo_host}

    # 2. Build & push UI Docker image
    cd ../realdha-ui
    docker build -t ${local.target_ui_container_image} .
    docker push ${local.target_ui_container_image}

    # 3. Build & push Backend Docker image
    cd ../backend
    docker build -t ${local.target_backend_container_image} .
    docker push ${local.target_backend_container_image}
  EOT
}
