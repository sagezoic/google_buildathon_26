# ==============================================================================
# Gemini on Vertex AI: document checks (STOP / PROCEED reports) and property chat
# ==============================================================================
# The backend calls Gemini through the Google Gen AI SDK in Vertex (enterprise) mode with its own
# service account. Files are sent inline from the backend, so Vertex needs no bucket access.

locals {
  # Env vars handed to the backend (known at plan time)
  gemini_env = var.enable_gemini ? {
    VERTEX_LOCATION     = var.vertex_location
    GEMINI_VERIFY_MODEL = var.gemini_verify_model
    GEMINI_CHAT_MODEL   = var.gemini_chat_model
  } : {}
}

# Backend may call Gemini (aiplatform.endpoints.predict). roles/aiplatform.user is the narrowest
# predefined role that allows generateContent on publisher models.
resource "google_project_iam_member" "backend_vertex_user" {
  count   = var.deploy_backend && var.enable_gemini ? 1 : 0
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:${google_service_account.backend[0].email}"

  depends_on = [google_project_service.services]
}
