# ==============================================================================
# Google Cloud Memorystore for Valkey
# ==============================================================================
# Fully managed, open-source-compatible Valkey in-memory service for high-performance
# caching of properties, societies, search filters, and expensive AI/blockchain reads.

locals {
  valkey_instance_id = var.valkey_instance_id != "" ? var.valkey_instance_id : "realdha-valkey-${var.environment}"

  # Resolved Valkey host / port
  valkey_host = try(
    google_memorystore_instance.valkey[0].endpoints[0].connections[0].psc_auto_connection[0].ip_address,
    ""
  )
  valkey_port = tostring(try(
    google_memorystore_instance.valkey[0].endpoints[0].connections[0].psc_auto_connection[0].port,
    6379
  ))

  # Env vars passed to backend Cloud Run service
  valkey_env = var.enable_valkey ? {
    VALKEY_HOST    = local.valkey_host
    VALKEY_PORT    = local.valkey_port
    VALKEY_ENABLED = "true"
    } : (var.valkey_url != "" ? {
      VALKEY_URL     = var.valkey_url
      VALKEY_ENABLED = "true"
  } : {})
}

locals {
  effective_valkey_network = var.valkey_network_id != "" ? var.valkey_network_id : "projects/${var.project_id}/global/networks/${var.valkey_network}"
}

# Memorystore for Valkey instance
resource "google_memorystore_instance" "valkey" {
  count = var.enable_valkey ? 1 : 0

  project     = var.project_id
  location    = var.region
  instance_id = local.valkey_instance_id

  shard_count    = var.valkey_shard_count
  replica_count  = var.valkey_replica_count
  node_type      = var.valkey_node_type
  engine_version = var.valkey_engine_version

  transit_encryption_mode     = var.valkey_transit_encryption_mode
  authorization_mode          = var.valkey_authorization_mode
  deletion_protection_enabled = var.valkey_deletion_protection

  desired_psc_auto_connections {
    network    = local.effective_valkey_network
    project_id = var.project_id
  }

  labels = local.common_labels

  depends_on = [
    google_project_service.services
  ]
}
