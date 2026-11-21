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
# Cloud SQL PostgreSQL Database
# ==============================================================================

# Random 4-byte suffix to avoid naming collision on recreate
resource "random_id" "db_name_suffix" {
  count       = var.deploy_database ? 1 : 0
  byte_length = 4
}

# Auto-generate a secure random database password when not explicitly provided
resource "random_password" "db_password" {
  count   = var.deploy_database && var.db_password == "" ? 1 : 0
  length  = 24
  special = false
}

resource "google_sql_database_instance" "postgres" {
  count               = var.deploy_database ? 1 : 0
  name                = var.db_instance_name != "" ? var.db_instance_name : "realdha-postgres-${random_id.db_name_suffix[0].hex}"
  database_version    = var.db_version
  region              = var.region
  project             = var.project_id
  deletion_protection = var.db_deletion_protection

  settings {
    tier              = var.db_tier
    edition           = var.db_edition
    availability_type = var.db_availability_type
    disk_size         = var.db_disk_size
    disk_type         = var.db_disk_type
    disk_autoresize   = true

    backup_configuration {
      enabled    = var.db_backup_enabled
      start_time = "04:00"
    }

    ip_configuration {
      ipv4_enabled = true
      ssl_mode     = "ALLOW_UNENCRYPTED_AND_ENCRYPTED"

      dynamic "authorized_networks" {
        for_each = var.db_authorized_networks
        content {
          name  = authorized_networks.value.name
          value = authorized_networks.value.cidr
        }
      }
    }

    user_labels = local.common_labels
  }

  depends_on = [
    google_project_service.services
  ]
}

# Wait for Cloud SQL PostgreSQL engine to initialize and bind port 5432.
# When a new instance is created, GCP marks the instance resource ready before the
# internal PostgreSQL daemon has finished cluster initialization (initdb).
# Without a brief delay, immediate calls to create users or databases fail with:
# "failed to connect to db after 3 tries. Error: dial tcp 127.0.0.1:5432: connect: connection refused"
resource "time_sleep" "wait_for_postgres" {
  count           = var.deploy_database ? 1 : 0
  create_duration = "45s"

  depends_on = [
    google_sql_database_instance.postgres
  ]
}

resource "google_sql_database" "postgres_db" {
  count     = var.deploy_database ? 1 : 0
  name      = var.db_name
  instance  = google_sql_database_instance.postgres[0].name
  project   = var.project_id
  charset   = "UTF8"
  collation = "en_US.UTF8"

  depends_on = [
    time_sleep.wait_for_postgres
  ]
}

resource "google_sql_user" "postgres_user" {
  count    = var.deploy_database ? 1 : 0
  name     = var.db_user
  instance = google_sql_database_instance.postgres[0].name
  project  = var.project_id
  password = local.effective_db_password

  depends_on = [
    google_sql_database.postgres_db,
    time_sleep.wait_for_postgres
  ]
}

# Grant Cloud SQL Client role to Backend runtime Service Account
resource "google_project_iam_member" "backend_cloudsql_client" {
  count   = var.deploy_backend && var.deploy_database ? 1 : 0
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.backend[0].email}"
}

# ==============================================================================
# Document AI (OCR) and Cloud Translation for property documents
# ==============================================================================

# Enterprise Document OCR processor: reads Marathi (Devanagari), Hindi and English documents
resource "google_document_ai_processor" "ocr" {
  count        = var.deploy_backend && var.create_docai_processor && var.docai_processor_id == "" ? 1 : 0
  project      = var.project_id
  location     = var.docai_location
  display_name = "realdha-document-ocr"
  type         = "OCR_PROCESSOR"

  depends_on = [
    google_project_service.services
  ]
}

locals {
  # `name` may be the full resource path or the bare id; keep the last path segment either way
  docai_processor_parts        = length(google_document_ai_processor.ocr) > 0 ? split("/", google_document_ai_processor.ocr[0].name) : []
  managed_docai_processor_id   = length(local.docai_processor_parts) > 0 ? element(local.docai_processor_parts, length(local.docai_processor_parts) - 1) : ""
  effective_docai_processor_id = var.docai_processor_id != "" ? var.docai_processor_id : local.managed_docai_processor_id
}

# Backend may call Document AI online processing
resource "google_project_iam_member" "backend_documentai_user" {
  count   = var.deploy_backend ? 1 : 0
  project = var.project_id
  role    = "roles/documentai.apiUser"
  member  = "serviceAccount:${google_service_account.backend[0].email}"
}

# Backend may call Cloud Translation (detect language, translate text)
resource "google_project_iam_member" "backend_translate_user" {
  count   = var.deploy_backend ? 1 : 0
  project = var.project_id
  role    = "roles/cloudtranslate.user"
  member  = "serviceAccount:${google_service_account.backend[0].email}"
}

# Backend reads and writes uploaded documents, scoped to the one bucket (not project-wide)
resource "google_storage_bucket_iam_member" "backend_documents" {
  count  = var.deploy_backend && var.gcs_bucket_name != "" ? 1 : 0
  bucket = var.gcs_bucket_name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.backend[0].email}"
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
      # One instance while chain writes are enabled: registrar nonces are serialised per instance only
      max_instance_count = var.enable_chain ? 1 : var.backend_max_instance_count
    }

    dynamic "volumes" {
      for_each = var.deploy_database ? [1] : []
      content {
        name = "cloudsql"
        cloud_sql_instance {
          instances = [google_sql_database_instance.postgres[0].connection_name]
        }
      }
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

      dynamic "volume_mounts" {
        for_each = var.deploy_database ? [1] : []
        content {
          name       = "cloudsql"
          mount_path = "/cloudsql"
        }
      }

      env {
        name  = "NODE_ENV"
        value = var.environment
      }

      dynamic "env" {
        for_each = var.deploy_database ? [1] : []
        content {
          name  = "DATABASE_URL"
          value = "postgresql://${var.db_user}:${local.effective_db_password}@${try(google_sql_database_instance.postgres[0].public_ip_address, "localhost")}:5432/${var.db_name}"
        }
      }

      dynamic "env" {
        for_each = var.deploy_database ? [1] : []
        content {
          name  = "DATABASE_URL_DIRECT"
          value = "postgresql://${var.db_user}:${local.effective_db_password}@${try(google_sql_database_instance.postgres[0].public_ip_address, "localhost")}:5432/${var.db_name}"
        }
      }

      dynamic "env" {
        for_each = var.deploy_database ? [1] : []
        content {
          name  = "DATABASE_URL_SOCKET"
          value = "postgresql://${var.db_user}:${local.effective_db_password}@localhost:5432/${var.db_name}?host=/cloudsql/${google_sql_database_instance.postgres[0].connection_name}"
        }
      }

      dynamic "env" {
        for_each = var.deploy_database ? [1] : []
        content {
          name  = "CLOUDSQL_CONNECTION_NAME"
          value = google_sql_database_instance.postgres[0].connection_name
        }
      }

      dynamic "env" {
        for_each = var.deploy_database ? [1] : []
        content {
          name  = "DB_NAME"
          value = var.db_name
        }
      }

      dynamic "env" {
        for_each = var.deploy_database ? [1] : []
        content {
          name  = "DB_USER"
          value = var.db_user
        }
      }

      env {
        name  = "DOCAI_PROCESSOR_ID"
        value = local.effective_docai_processor_id
      }

      env {
        name  = "DOCAI_LOCATION"
        value = var.docai_location
      }

      env {
        name  = "GCP_PROJECT_ID"
        value = var.project_id
      }

      dynamic "env" {
        for_each = var.gcs_bucket_name != "" ? [1] : []
        content {
          name  = "GCS_BUCKET_NAME"
          value = var.gcs_bucket_name
        }
      }

      dynamic "env" {
        for_each = local.backend_data_env
        content {
          name  = env.key
          value = env.value
        }
      }

      dynamic "env" {
        for_each = var.enable_chain ? {
          for k, v in {
            CHAIN_NETWORK          = var.chain_network
            CHAIN_KMS_KEY          = local.chain_kms_key_version
            CHAIN_CONTRACT_ADDRESS = var.chain_contract_address
            CHAIN_EXPLORER_URL     = var.chain_explorer_url
            PUBLIC_API_URL         = var.chain_public_api_url
          } : k => v if v != ""
        } : {}
        content {
          name  = env.key
          value = env.value
        }
      }

      dynamic "env" {
        for_each = local.chain_secret_keys
        content {
          name = env.value
          value_source {
            secret_key_ref {
              secret  = google_secret_manager_secret.chain[env.value].secret_id
              version = "latest"
            }
          }
        }
      }
    }
  }

  depends_on = [
    google_project_service.services,
    google_artifact_registry_repository.backend,
    google_sql_database_instance.postgres,
    google_sql_database.postgres_db,
    google_sql_user.postgres_user,
    google_secret_manager_secret_version.chain,
    google_secret_manager_secret_iam_member.backend_chain,
    google_pubsub_topic_iam_member.backend_publisher,
    google_pubsub_subscription_iam_member.backend_subscriber,
    google_bigquery_dataset_iam_member.backend_editor,
    google_storage_bucket_iam_member.backend_cdn,
    google_project_iam_member.backend_vertex_user
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
