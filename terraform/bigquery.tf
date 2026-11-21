# ==============================================================================
# BigQuery: analytics dataset (valuation benchmarks, property distribution trends)
# ==============================================================================

locals {
  bigquery_events_table = "pubsub_events"

  bigquery_env = var.enable_bigquery ? {
    BQ_DATASET  = var.bigquery_dataset_id
    BQ_LOCATION = var.bigquery_location
  } : {}
}

resource "google_bigquery_dataset" "analytics" {
  count = var.enable_bigquery ? 1 : 0

  project       = var.project_id
  dataset_id    = var.bigquery_dataset_id
  friendly_name = "Realdha analytics"
  description   = "Analytics warehouse: streamed domain events, valuation benchmarks and property trends"
  location      = var.bigquery_location
  labels        = local.common_labels

  delete_contents_on_destroy = false

  depends_on = [google_project_service.services]
}

# Landing table for the analytics-events topic (Pub/Sub's default BigQuery subscription schema)
resource "google_bigquery_table" "pubsub_events" {
  count = var.enable_bigquery ? 1 : 0

  project             = var.project_id
  dataset_id          = google_bigquery_dataset.analytics[0].dataset_id
  table_id            = local.bigquery_events_table
  description         = "Messages published to the analytics-events Pub/Sub topic"
  labels              = local.common_labels
  deletion_protection = var.bigquery_deletion_protection

  time_partitioning {
    type  = "DAY"
    field = "publish_time"
  }

  schema = jsonencode([
    { name = "subscription_name", type = "STRING", mode = "NULLABLE" },
    { name = "message_id", type = "STRING", mode = "NULLABLE" },
    { name = "publish_time", type = "TIMESTAMP", mode = "NULLABLE" },
    { name = "data", type = "STRING", mode = "NULLABLE" },
    { name = "attributes", type = "STRING", mode = "NULLABLE" }
  ])
}

# ------------------------------------------------------------------------------
# Pub/Sub -> BigQuery streaming subscription
# ------------------------------------------------------------------------------

resource "google_bigquery_dataset_iam_member" "pubsub_editor" {
  count = var.enable_pubsub && var.enable_bigquery ? 1 : 0

  project    = var.project_id
  dataset_id = google_bigquery_dataset.analytics[0].dataset_id
  role       = "roles/bigquery.dataEditor"
  member     = local.pubsub_service_agent
}

resource "google_bigquery_dataset_iam_member" "pubsub_metadata_viewer" {
  count = var.enable_pubsub && var.enable_bigquery ? 1 : 0

  project    = var.project_id
  dataset_id = google_bigquery_dataset.analytics[0].dataset_id
  role       = "roles/bigquery.metadataViewer"
  member     = local.pubsub_service_agent
}

resource "google_pubsub_subscription" "analytics_bigquery" {
  count = var.enable_pubsub && var.enable_bigquery ? 1 : 0

  project = var.project_id
  name    = "${local.pubsub_prefix}-analytics-events-bq"
  topic   = google_pubsub_topic.main["analytics-events"].id
  labels  = local.common_labels

  bigquery_config {
    table          = "${var.project_id}.${google_bigquery_dataset.analytics[0].dataset_id}.${google_bigquery_table.pubsub_events[0].table_id}"
    write_metadata = true
  }

  depends_on = [
    google_bigquery_dataset_iam_member.pubsub_editor,
    google_bigquery_dataset_iam_member.pubsub_metadata_viewer
  ]
}

# ------------------------------------------------------------------------------
# Backend runtime service account
# ------------------------------------------------------------------------------

resource "google_bigquery_dataset_iam_member" "backend_editor" {
  count = var.deploy_backend && var.enable_bigquery ? 1 : 0

  project    = var.project_id
  dataset_id = google_bigquery_dataset.analytics[0].dataset_id
  role       = "roles/bigquery.dataEditor"
  member     = "serviceAccount:${google_service_account.backend[0].email}"
}

# Running queries is a project-level permission; it grants no access to data on its own
resource "google_project_iam_member" "backend_bigquery_job_user" {
  count = var.deploy_backend && var.enable_bigquery ? 1 : 0

  project = var.project_id
  role    = "roles/bigquery.jobUser"
  member  = "serviceAccount:${google_service_account.backend[0].email}"
}
