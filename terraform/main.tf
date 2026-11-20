# Enable required Google Cloud APIs
resource "google_project_service" "services" {
  for_each = toset(local.required_services)

  project            = var.project_id
  service            = each.value
  disable_on_destroy = false
}

# ==============================================================================
# Artifact Registry Repositories
# ==============================================================================

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

# Artifact Registry repository to host Backend container images
resource "google_artifact_registry_repository" "backend" {
  count = var.create_artifact_registry && var.deploy_backend ? 1 : 0

  project       = var.project_id
  location      = var.region
  repository_id = var.backend_artifact_registry_repo_name
  description   = "Docker repository for Realdha Backend container images"
  format        = "DOCKER"
  labels        = local.common_labels

  depends_on = [
    google_project_service.services
  ]
}

# ==============================================================================
# Service Accounts
# ==============================================================================

# Dedicated Service Account for the Cloud Run UI service
resource "google_service_account" "ui" {
  project      = var.project_id
  account_id   = "realdha-ui-sa"
  display_name = "Realdha UI Service Account"
  description  = "Runtime service account for the Realdha UI Cloud Run service"
}

# Dedicated Service Account for the Cloud Run Backend service
resource "google_service_account" "backend" {
  count        = var.deploy_backend ? 1 : 0
  project      = var.project_id
  account_id   = "realdha-backend-sa"
  display_name = "Realdha Backend Service Account"
  description  = "Runtime service account for the Realdha Backend Cloud Run service"
}

# ==============================================================================
# Backend Cloud Run Service
# ==============================================================================

resource "google_cloud_run_v2_service" "backend" {
  count    = var.deploy_backend ? 1 : 0
  name     = var.backend_service_name
  location = var.region
  project  = var.project_id
  ingress  = "INGRESS_TRAFFIC_ALL"
  labels   = local.common_labels

  template {
    service_account = google_service_account.backend[0].email

    scaling {
      min_instance_count = var.backend_min_instance_count
      max_instance_count = var.backend_max_instance_count
    }

    containers {
      image = local.target_backend_container_image

      ports {
        container_port = var.backend_container_port
      }

      resources {
        limits = {
          cpu    = var.backend_cpu
          memory = var.backend_memory
        }
      }

      env {
        name  = "NODE_ENV"
        value = var.environment
      }
    }
  }

  depends_on = [
    google_project_service.services,
    google_artifact_registry_repository.backend
  ]
}

# Public unauthenticated access for Backend service (configurable)
resource "google_cloud_run_v2_service_iam_member" "backend_public_access" {
  count = var.deploy_backend && var.backend_allow_unauthenticated ? 1 : 0

  project  = var.project_id
  location = google_cloud_run_v2_service.backend[0].location
  name     = google_cloud_run_v2_service.backend[0].name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ==============================================================================
# UI Cloud Run Service
# ==============================================================================

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
      image = local.target_ui_container_image

      ports {
        container_port = var.container_port
      }

      resources {
        limits = {
          cpu    = var.cpu
          memory = var.memory
        }
      }

      dynamic "env" {
        for_each = var.deploy_backend && length(google_cloud_run_v2_service.backend) > 0 ? [1] : []
        content {
          name  = "BACKEND_URL"
          value = google_cloud_run_v2_service.backend[0].uri
        }
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
