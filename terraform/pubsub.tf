# ==============================================================================
# Google Cloud Pub/Sub: event bus for document ingestion, chain anchoring and analytics
# ==============================================================================
# document-ingest  GCS OBJECT_FINALIZE events from the property-documents bucket (OCR / AI pipeline input)
# chain-anchor     tasks for the chain worker (document fingerprint -> on-chain anchor)
# analytics-events domain events streamed straight into BigQuery (see bigquery.tf)
# dead-letter      messages that failed delivery 5 times; inspect through its pull subscription

locals {
  pubsub_prefix = "realdha"

  # Topics the backend may publish to
  pubsub_publish_topics = var.enable_pubsub ? toset(["document-ingest", "chain-anchor", "analytics-events"]) : toset([])

  # Topics read through a pull subscription (dead-letter has none of its own dead-letter policy)
  pubsub_pull_topics = var.enable_pubsub ? toset(["document-ingest", "chain-anchor", "dead-letter"]) : toset([])

  pubsub_all_topics = var.enable_pubsub ? setunion(local.pubsub_publish_topics, toset(["dead-letter"])) : toset([])

  # Env vars handed to the backend (names are deterministic, so the values are known at plan time)
  pubsub_env = var.enable_pubsub ? {
    PUBSUB_DOCUMENT_INGEST_TOPIC        = "${local.pubsub_prefix}-document-ingest"
    PUBSUB_DOCUMENT_INGEST_SUBSCRIPTION = "${local.pubsub_prefix}-document-ingest-sub"
    PUBSUB_CHAIN_ANCHOR_TOPIC           = "${local.pubsub_prefix}-chain-anchor"
    PUBSUB_CHAIN_ANCHOR_SUBSCRIPTION    = "${local.pubsub_prefix}-chain-anchor-sub"
    PUBSUB_ANALYTICS_TOPIC              = "${local.pubsub_prefix}-analytics-events"
  } : {}

  # Pub/Sub service agent: delivers to dead-letter topics and writes BigQuery subscriptions
  pubsub_service_agent = "serviceAccount:service-${try(data.google_project.current[0].number, "")}@gcp-sa-pubsub.iam.gserviceaccount.com"
}

data "google_project" "current" {
  count      = var.enable_pubsub || var.enable_bigquery ? 1 : 0
  project_id = var.project_id

  # Reading the project number needs Resource Manager enabled; defer the read until the APIs are on
  depends_on = [google_project_service.services]
}

resource "google_pubsub_topic" "main" {
  for_each = local.pubsub_all_topics

  project = var.project_id
  name    = "${local.pubsub_prefix}-${each.key}"
  labels  = local.common_labels

  depends_on = [google_project_service.services]
}

resource "google_pubsub_subscription" "pull" {
  for_each = local.pubsub_pull_topics

  project = var.project_id
  name    = "${local.pubsub_prefix}-${each.key}-sub"
  topic   = google_pubsub_topic.main[each.key].id
  labels  = local.common_labels

  ack_deadline_seconds       = 60
  message_retention_duration = "604800s" # 7 days

  # Never auto-delete an idle subscription
  expiration_policy {
    ttl = ""
  }

  retry_policy {
    minimum_backoff = "10s"
    maximum_backoff = "600s"
  }

  dynamic "dead_letter_policy" {
    for_each = each.key == "dead-letter" ? [] : [1]
    content {
      dead_letter_topic     = google_pubsub_topic.main["dead-letter"].id
      max_delivery_attempts = 5
    }
  }
}

# ------------------------------------------------------------------------------
# Dead-letter plumbing: the Pub/Sub service agent forwards failed messages
# ------------------------------------------------------------------------------

resource "google_pubsub_topic_iam_member" "dead_letter_publisher" {
  count = var.enable_pubsub ? 1 : 0

  project = var.project_id
  topic   = google_pubsub_topic.main["dead-letter"].name
  role    = "roles/pubsub.publisher"
  member  = local.pubsub_service_agent
}

resource "google_pubsub_subscription_iam_member" "dead_letter_subscriber" {
  for_each = toset([for t in local.pubsub_pull_topics : t if t != "dead-letter"])

  project      = var.project_id
  subscription = google_pubsub_subscription.pull[each.key].name
  role         = "roles/pubsub.subscriber"
  member       = local.pubsub_service_agent
}

# ------------------------------------------------------------------------------
# GCS -> Pub/Sub: announce every uploaded property document
# ------------------------------------------------------------------------------

data "google_storage_project_service_account" "gcs" {
  count   = var.enable_pubsub && var.gcs_bucket_name != "" ? 1 : 0
  project = var.project_id

  depends_on = [google_project_service.services]
}

resource "google_pubsub_topic_iam_member" "gcs_publisher" {
  count = var.enable_pubsub && var.gcs_bucket_name != "" ? 1 : 0

  project = var.project_id
  topic   = google_pubsub_topic.main["document-ingest"].name
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:${data.google_storage_project_service_account.gcs[0].email_address}"
}

resource "google_storage_notification" "document_ingest" {
  count = var.enable_pubsub && var.gcs_bucket_name != "" ? 1 : 0

  bucket         = var.gcs_bucket_name
  topic          = google_pubsub_topic.main["document-ingest"].id
  payload_format = "JSON_API_V1"
  event_types    = ["OBJECT_FINALIZE"]

  depends_on = [google_pubsub_topic_iam_member.gcs_publisher]
}

# ------------------------------------------------------------------------------
# Backend runtime service account (least privilege, per topic / subscription)
# ------------------------------------------------------------------------------

resource "google_pubsub_topic_iam_member" "backend_publisher" {
  for_each = var.deploy_backend ? local.pubsub_publish_topics : toset([])

  project = var.project_id
  topic   = google_pubsub_topic.main[each.key].name
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:${google_service_account.backend[0].email}"
}

# The chain worker runs inside the backend service today, so it reads its own queues
resource "google_pubsub_subscription_iam_member" "backend_subscriber" {
  for_each = var.deploy_backend ? toset([for t in local.pubsub_pull_topics : t if t != "dead-letter"]) : toset([])

  project      = var.project_id
  subscription = google_pubsub_subscription.pull[each.key].name
  role         = "roles/pubsub.subscriber"
  member       = "serviceAccount:${google_service_account.backend[0].email}"
}
