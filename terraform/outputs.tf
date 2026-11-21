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

output "docai_processor_id" {
  description = "ID of the Document AI OCR processor"
  value       = local.effective_docai_processor_id
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

# ------------------------------------------------------------------------------
# Cloud SQL PostgreSQL Outputs
# ------------------------------------------------------------------------------

output "db_instance_name" {
  description = "Name of the Cloud SQL PostgreSQL instance"
  value       = try(google_sql_database_instance.postgres[0].name, "")
}

output "db_connection_name" {
  description = "Cloud SQL instance connection name (PROJECT_ID:REGION:INSTANCE_NAME)"
  value       = try(google_sql_database_instance.postgres[0].connection_name, "")
}

output "db_host" {
  description = "Public IPv4 address of the Cloud SQL PostgreSQL instance"
  value       = try(google_sql_database_instance.postgres[0].public_ip_address, "")
}

output "db_port" {
  description = "Port exposed by Cloud SQL PostgreSQL"
  value       = 5432
}

output "db_name" {
  description = "Default PostgreSQL database name"
  value       = var.db_name
}

output "db_user" {
  description = "PostgreSQL database username"
  value       = var.db_user
}

output "db_password" {
  description = "PostgreSQL database user password"
  value       = local.effective_db_password
  sensitive   = true
}

output "database_url" {
  description = "Full PostgreSQL connection URI for local development (direct public IP)"
  value       = var.deploy_database ? "postgresql://${var.db_user}:${local.effective_db_password}@${try(google_sql_database_instance.postgres[0].public_ip_address, "127.0.0.1")}:5432/${var.db_name}" : ""
  sensitive   = true
}

output "database_url_proxy" {
  description = "PostgreSQL connection URI via Cloud SQL Auth Proxy (127.0.0.1:5432)"
  value       = var.deploy_database ? "postgresql://${var.db_user}:${local.effective_db_password}@127.0.0.1:5432/${var.db_name}" : ""
  sensitive   = true
}

output "local_connection_instructions" {
  description = "Instructions and shell commands to configure local backend with Cloud SQL credentials"
  value       = <<-EOT
    # --------------------------------------------------------------------------
    # HOW TO USE CLOUD SQL IN LOCAL BACKEND:
    # --------------------------------------------------------------------------
    # 1. Direct Public Connection (Quickest for Local Dev):
    #    Run the following in PowerShell / terminal to set up backend/.env:
    #
    #    PowerShell:
    #      cd terraform
    #      $dbUrl = terraform output -raw database_url
    #      Set-Content -Path ../backend/.env -Value "DATABASE_URL=$dbUrl`nPORT=8080`nHOST=0.0.0.0`nNODE_ENV=development`nSCRAPER_DELAY_MS=1000"
    #
    #    Bash:
    #      cd terraform
    #      echo "DATABASE_URL=$(terraform output -raw database_url)" > ../backend/.env
    #      echo "PORT=8080" >> ../backend/.env
    #      echo "HOST=0.0.0.0" >> ../backend/.env
    #      echo "NODE_ENV=development" >> ../backend/.env
    #      echo "SCRAPER_DELAY_MS=1000" >> ../backend/.env
    #
    # 2. Via Google Cloud SQL Auth Proxy (Recommended for Production/Restricted IPs):
    #    gcloud auth login
    #    cloud-sql-proxy ${try(google_sql_database_instance.postgres[0].connection_name, "<CONNECTION_NAME>")} --port 5432
    #
    #    Then in backend/.env:
    #      DATABASE_URL=$(terraform output -raw database_url_proxy)
    #
    # 3. Run database migrations:
    #      cd ../backend
    #      bun run db:migrate
    # --------------------------------------------------------------------------
  EOT
}

# ------------------------------------------------------------------------------
# Pub/Sub, BigQuery and Cloud CDN Outputs
# ------------------------------------------------------------------------------

output "pubsub_topics" {
  description = "Pub/Sub topic ids by logical name (document-ingest, chain-anchor, analytics-events, dead-letter)"
  value       = { for k, v in google_pubsub_topic.main : k => v.id }
}

output "pubsub_subscriptions" {
  description = "Pub/Sub pull subscription ids by logical topic name"
  value       = { for k, v in google_pubsub_subscription.pull : k => v.id }
}

output "bigquery_dataset_id" {
  description = "BigQuery analytics dataset id"
  value       = try(google_bigquery_dataset.analytics[0].dataset_id, "")
}

output "bigquery_events_table" {
  description = "Fully qualified BigQuery table receiving analytics-events (project.dataset.table)"
  value       = try("${var.project_id}.${google_bigquery_dataset.analytics[0].dataset_id}.${google_bigquery_table.pubsub_events[0].table_id}", "")
}

output "cdn_bucket_name" {
  description = "Cloud Storage bucket behind the CDN (upload public assets here)"
  value       = try(google_storage_bucket.cdn[0].name, "")
}

output "cdn_ip_address" {
  description = "Reserved global IP of the CDN load balancer (point cdn_domain's A record here)"
  value       = try(google_compute_global_address.cdn[0].address, "")
}

output "cdn_base_url" {
  description = "Base URL that serves CDN assets"
  value       = try(local.cdn_env["CDN_BASE_URL"], "")
}

output "chain_registrar_kms_key" {
  description = "Cloud KMS key version that signs on-chain property token writes (derive its Ethereum address with `bun run chain:address`)"
  value       = local.chain_kms_key_version
}
