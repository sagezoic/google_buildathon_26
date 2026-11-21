# ==============================================================================
# Cloud Storage + Cloud CDN: public static assets (property images, thumbnails, UI media)
# ==============================================================================
# Cloud CDN is served through a global external HTTP(S) load balancer with the bucket as backend.
# Everything in this bucket is world-readable: never put property documents here (those stay in the
# private bucket named by `gcs_bucket_name`).
#
# Without `cdn_domain` the CDN answers on plain HTTP at the reserved IP. Set `cdn_domain` and point its
# DNS A record at `cdn_ip_address` to get a Google-managed certificate, HTTPS and an HTTP -> HTTPS redirect.

locals {
  cdn_bucket_name = var.cdn_bucket_name != "" ? var.cdn_bucket_name : "realdha-cdn-${var.project_id}"
  cdn_https       = var.enable_cdn && var.cdn_domain != ""

  cdn_env = var.enable_cdn ? {
    CDN_BUCKET_NAME = local.cdn_bucket_name
    CDN_BASE_URL    = var.cdn_domain != "" ? "https://${var.cdn_domain}" : "http://${try(google_compute_global_address.cdn[0].address, "")}"
  } : {}
}

resource "google_storage_bucket" "cdn" {
  count = var.enable_cdn ? 1 : 0

  project                     = var.project_id
  name                        = local.cdn_bucket_name
  location                    = var.region
  storage_class               = "STANDARD"
  uniform_bucket_level_access = true
  force_destroy               = false
  labels                      = local.common_labels

  cors {
    origin          = var.cdn_cors_origins
    method          = ["GET", "HEAD"]
    response_header = ["Content-Type"]
    max_age_seconds = 3600
  }

  depends_on = [google_project_service.services]
}

# Public read, required for the CDN to fetch and serve objects without signed URLs
resource "google_storage_bucket_iam_member" "cdn_public_read" {
  count = var.enable_cdn ? 1 : 0

  bucket = google_storage_bucket.cdn[0].name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

# Backend uploads assets here
resource "google_storage_bucket_iam_member" "backend_cdn" {
  count = var.deploy_backend && var.enable_cdn ? 1 : 0

  bucket = google_storage_bucket.cdn[0].name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.backend[0].email}"
}

resource "google_compute_backend_bucket" "cdn" {
  count = var.enable_cdn ? 1 : 0

  project     = var.project_id
  name        = "realdha-cdn-backend"
  description = "Realdha static assets served through Cloud CDN"
  bucket_name = google_storage_bucket.cdn[0].name
  enable_cdn  = true

  cdn_policy {
    cache_mode        = "CACHE_ALL_STATIC"
    default_ttl       = 3600
    client_ttl        = 3600
    max_ttl           = 86400
    negative_caching  = true
    serve_while_stale = 86400
  }

  depends_on = [google_project_service.services]
}

resource "google_compute_global_address" "cdn" {
  count = var.enable_cdn ? 1 : 0

  project = var.project_id
  name    = "realdha-cdn-ip"

  depends_on = [google_project_service.services]
}

resource "google_compute_url_map" "cdn" {
  count = var.enable_cdn ? 1 : 0

  project         = var.project_id
  name            = "realdha-cdn"
  default_service = google_compute_backend_bucket.cdn[0].id
}

# Only used when a domain is set: plain HTTP requests are redirected to HTTPS
resource "google_compute_url_map" "cdn_http_redirect" {
  count = local.cdn_https ? 1 : 0

  project = var.project_id
  name    = "realdha-cdn-http-redirect"

  default_url_redirect {
    https_redirect         = true
    redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"
    strip_query            = false
  }
}

resource "google_compute_managed_ssl_certificate" "cdn" {
  count = local.cdn_https ? 1 : 0

  project = var.project_id
  name    = "realdha-cdn-cert-${substr(md5(var.cdn_domain), 0, 8)}"

  managed {
    domains = [var.cdn_domain]
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "google_compute_target_http_proxy" "cdn" {
  count = var.enable_cdn ? 1 : 0

  project = var.project_id
  name    = "realdha-cdn-http"
  url_map = local.cdn_https ? google_compute_url_map.cdn_http_redirect[0].id : google_compute_url_map.cdn[0].id
}

resource "google_compute_target_https_proxy" "cdn" {
  count = local.cdn_https ? 1 : 0

  project          = var.project_id
  name             = "realdha-cdn-https"
  url_map          = google_compute_url_map.cdn[0].id
  ssl_certificates = [google_compute_managed_ssl_certificate.cdn[0].id]
}

resource "google_compute_global_forwarding_rule" "cdn_http" {
  count = var.enable_cdn ? 1 : 0

  project               = var.project_id
  name                  = "realdha-cdn-http"
  target                = google_compute_target_http_proxy.cdn[0].id
  ip_address            = google_compute_global_address.cdn[0].id
  port_range            = "80"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  labels                = local.common_labels
}

resource "google_compute_global_forwarding_rule" "cdn_https" {
  count = local.cdn_https ? 1 : 0

  project               = var.project_id
  name                  = "realdha-cdn-https"
  target                = google_compute_target_https_proxy.cdn[0].id
  ip_address            = google_compute_global_address.cdn[0].id
  port_range            = "443"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  labels                = local.common_labels
}
