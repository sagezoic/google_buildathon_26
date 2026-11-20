# Enable required Google Cloud APIs
resource "google_project_service" "services" {
  for_each = toset(local.required_services)

  project            = var.project_id
  service            = each.value
  disable_on_destroy = false
}

# Artifact Registry repository to host UI container images
resource "google_artifact_registry_repository" "ui" {
  count = var.create_artifact_registry ? 1 : 0

  project       = var.project_id
  location      = var.region
  repository_id = var.artifact_registry_repo_name
  description   = "Docker repository for Realdha UI container images"
  format        = "DOCKER"
  labels        = local.common_labels

  depends_on = [
    google_project_service.services
  ]
}

# Dedicated Service Account for the Cloud Run UI service
resource "google_service_account" "ui" {
  project      = var.project_id
  account_id   = "realdha-ui-sa"
  display_name = "Realdha UI Service Account"
  description  = "Runtime service account for the Realdha UI Cloud Run service"
}

# Cloud Run v2 Service to host the UI container
resource "google_cloud_run_v2_service" "ui" {
  name     = var.service_name
  location = var.region
  project  = var.project_id
  ingress  = "INGRESS_TRAFFIC_ALL"
  labels   = local.common_labels

  template {
    service_account = google_service_account.ui.email

    scaling {
      min_instance_count = var.min_instance_count
      max_instance_count = var.max_instance_count
    }

    containers {
      image = local.target_container_image

      ports {
        container_port = var.container_port
      }

      resources {
        limits = {
          cpu    = var.cpu
          memory = var.memory
        }
      }

      env {
        name  = "PORT"
        value = tostring(var.container_port)
      }
    }
  }

  depends_on = [
    google_project_service.services,
    google_artifact_registry_repository.ui
  ]
}

# Public unauthenticated access for web visitors
resource "google_cloud_run_v2_service_iam_member" "public_access" {
  count = var.allow_unauthenticated ? 1 : 0

  project  = var.project_id
  location = google_cloud_run_v2_service.ui.location
  name     = google_cloud_run_v2_service.ui.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
