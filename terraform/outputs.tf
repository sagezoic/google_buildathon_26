output "artifact_registry_repository_id" {
  description = "ID of the Artifact Registry repository"
  value       = try(google_artifact_registry_repository.ui[0].id, "")
}

output "artifact_registry_repository_url" {
  description = "Artifact Registry Docker repository URL for tagging and pushing images"
  value       = "${local.artifact_repo_host}/${var.project_id}/${var.artifact_registry_repo_name}"
}

output "docker_push_commands" {
  description = "Commands to build, tag, and push the UI Docker image from the realdha-ui directory"
  value       = <<-EOT
    # 1. Authenticate Docker with Google Cloud Artifact Registry
    gcloud auth configure-docker ${local.artifact_repo_host}

    # 2. Build the Docker image from realdha-ui directory
    cd ../realdha-ui
    docker build -t ${local.target_container_image} .

    # 3. Push to Artifact Registry
    docker push ${local.target_container_image}
  EOT
}

output "service_account_email" {
  description = "Service account email attached to the Cloud Run service"
  value       = google_service_account.ui.email
}

output "service_id" {
  description = "Identifier of the deployed Cloud Run service"
  value       = google_cloud_run_v2_service.ui.id
}

output "service_location" {
  description = "Location (US region) where the Cloud Run service is deployed"
  value       = google_cloud_run_v2_service.ui.location
}

output "service_name" {
  description = "Name of the deployed Cloud Run service"
  value       = google_cloud_run_v2_service.ui.name
}

output "service_url" {
  description = "Public URL of the deployed UI Cloud Run service"
  value       = google_cloud_run_v2_service.ui.uri
}
