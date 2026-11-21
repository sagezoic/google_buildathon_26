# ==============================================================================
# Blockchain property tokens: registrar key (Cloud KMS HSM) and chain secrets
# ==============================================================================
# The registrar key signs every on-chain write (register / update a property token). It is generated inside
# an HSM and can never be exported; the backend only asks KMS to sign digests.

resource "google_kms_key_ring" "chain" {
  count    = var.deploy_backend && var.enable_chain ? 1 : 0
  project  = var.project_id
  name     = "realdha-chain"
  location = var.region

  depends_on = [google_project_service.services]
}

resource "google_kms_crypto_key" "registrar" {
  count    = var.deploy_backend && var.enable_chain ? 1 : 0
  name     = "property-registrar"
  key_ring = google_kms_key_ring.chain[0].id
  purpose  = "ASYMMETRIC_SIGN"
  labels   = local.common_labels

  version_template {
    algorithm        = "EC_SIGN_SECP256K1_SHA256"
    protection_level = "HSM"
  }

  # Losing this key orphans the registrar address on the contract.
  lifecycle {
    prevent_destroy = true
  }
}

# Backend may sign with, and read the public key of, this one key only
resource "google_kms_crypto_key_iam_member" "backend_registrar" {
  count         = var.deploy_backend && var.enable_chain ? 1 : 0
  crypto_key_id = google_kms_crypto_key.registrar[0].id
  role          = "roles/cloudkms.signerVerifier"
  member        = "serviceAccount:${google_service_account.backend[0].email}"
}

locals {
  # Secret Manager entries, created only for the values that were supplied
  chain_secrets = var.deploy_backend && var.enable_chain ? {
    for k, v in {
      CHAIN_RPC_URL     = var.chain_rpc_url
      CHAIN_ADMIN_TOKEN = var.chain_admin_token
      CHAIN_OWNER_SALT  = var.chain_owner_salt
    } : k => v if v != ""
  } : {}

  chain_secret_keys = nonsensitive(toset(keys(local.chain_secrets)))

  chain_kms_key_version = length(google_kms_crypto_key.registrar) > 0 ? "${google_kms_crypto_key.registrar[0].id}/cryptoKeyVersions/1" : ""
}

resource "google_secret_manager_secret" "chain" {
  for_each  = local.chain_secret_keys
  project   = var.project_id
  secret_id = "realdha-${lower(replace(each.value, "_", "-"))}"
  labels    = local.common_labels

  replication {
    auto {}
  }

  depends_on = [google_project_service.services]
}

resource "google_secret_manager_secret_version" "chain" {
  for_each    = local.chain_secret_keys
  secret      = google_secret_manager_secret.chain[each.value].id
  secret_data = local.chain_secrets[each.value]
}

resource "google_secret_manager_secret_iam_member" "backend_chain" {
  for_each  = local.chain_secret_keys
  project   = var.project_id
  secret_id = google_secret_manager_secret.chain[each.value].secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.backend[0].email}"
}
