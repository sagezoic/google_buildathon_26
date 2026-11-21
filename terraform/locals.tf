locals {
  common_labels = {
    app         = "realdha"
    environment = var.environment
    managed_by  = "terraform"
  }

  required_services = concat(
    var.enable_apis ? [
      "cloudresourcemanager.googleapis.com",
      "run.googleapis.com",
      "artifactregistry.googleapis.com",
      "iam.googleapis.com",
      "documentai.googleapis.com",
      "translate.googleapis.com",
      "cloudkms.googleapis.com",
      "secretmanager.googleapis.com"
    ] : [],
    var.enable_apis && var.deploy_database ? [
      "sqladmin.googleapis.com",
      "compute.googleapis.com"
    ] : [],
    var.enable_apis && var.enable_pubsub ? [
      "pubsub.googleapis.com",
      "storage.googleapis.com"
    ] : [],
    var.enable_apis && var.enable_gemini ? [
      "aiplatform.googleapis.com"
    ] : [],
    var.enable_apis && var.enable_bigquery ? [
      "bigquery.googleapis.com"
    ] : [],
    var.enable_apis && var.enable_cdn ? [
      "compute.googleapis.com",
      "storage.googleapis.com"
    ] : [],
    var.enable_apis && var.enable_valkey ? [
      "memorystore.googleapis.com"
    ] : []
  )

  # Env vars for the backend from the Pub/Sub, BigQuery, CDN, Gemini and Valkey modules (keys are known at plan time)
  backend_data_env = merge(local.pubsub_env, local.bigquery_env, local.cdn_env, local.gemini_env, local.valkey_env)

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

  # Effective Database Password resolution
  effective_db_password = var.db_password != "" ? var.db_password : (
    var.deploy_database && length(random_password.db_password) > 0 ? random_password.db_password[0].result : ""
  )
}
