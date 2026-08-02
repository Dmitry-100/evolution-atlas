terraform {
  required_version = ">= 1.6.0"

  required_providers {
    yandex = {
      source  = "yandex-cloud/yandex"
      version = "~> 0.215"
    }
  }
}

provider "yandex" {
  folder_id = var.folder_id
}

resource "yandex_sws_advanced_rate_limiter_profile" "public_ai_api" {
  name        = "evolution-atlas-public-ai"
  description = "Per-IP and global limits for Evolution Atlas public AI endpoints"
  labels      = { managed_by = "terraform" }

  advanced_rate_limiter_rule {
    name        = "ask-per-ip"
    priority    = 10
    description = "20 ask-darwin requests per five minutes per IP"
    dry_run     = false

    dynamic_quota {
      action = "DENY"
      limit  = 20
      period = 300
      condition {
        request_uri {
          path { exact_match = "/api/ask-darwin" }
        }
        http_method {
          http_method_matcher { exact_match = "POST" }
        }
      }
      characteristic {
        simple_characteristic { type = "IP" }
      }
    }
  }

  advanced_rate_limiter_rule {
    name        = "tour-per-ip"
    priority    = 20
    description = "10 plan-tour requests per five minutes per IP"
    dry_run     = false

    dynamic_quota {
      action = "DENY"
      limit  = 10
      period = 300
      condition {
        request_uri {
          path { exact_match = "/api/plan-tour" }
        }
        http_method {
          http_method_matcher { exact_match = "POST" }
        }
      }
      characteristic {
        simple_characteristic { type = "IP" }
      }
    }
  }

  advanced_rate_limiter_rule {
    name        = "ask-global"
    priority    = 30
    description = "60 ask-darwin requests per minute globally"
    dry_run     = false

    static_quota {
      action = "DENY"
      limit  = 60
      period = 60
      condition {
        request_uri {
          path { exact_match = "/api/ask-darwin" }
        }
        http_method {
          http_method_matcher { exact_match = "POST" }
        }
      }
    }
  }

  advanced_rate_limiter_rule {
    name        = "tour-global"
    priority    = 40
    description = "30 plan-tour requests per minute globally"
    dry_run     = false

    static_quota {
      action = "DENY"
      limit  = 30
      period = 60
      condition {
        request_uri {
          path { exact_match = "/api/plan-tour" }
        }
        http_method {
          http_method_matcher { exact_match = "POST" }
        }
      }
    }
  }
}

resource "yandex_sws_security_profile" "public_ai_api" {
  name                             = "evolution-atlas-public-ai"
  description                      = "API protection for the public Evolution Atlas AI endpoints"
  default_action                   = "ALLOW"
  advanced_rate_limiter_profile_id = yandex_sws_advanced_rate_limiter_profile.public_ai_api.id
  labels                           = { managed_by = "terraform" }

  analyze_request_body {
    size_limit        = 32
    size_limit_action = "IGNORE"
  }

  log_options {
    enable                   = true
    discard_allow_percentage = 100
    enabled_actions          = ["DENY"]
    enabled_modules          = ["SMART_PROTECTION", "ARL"]
    outputs                  = ["CLOUD_LOGGING"]
  }

  security_rule {
    name     = "api-protection"
    priority = 100

    smart_protection {
      mode = "API"
    }
  }
}

output "security_profile_id" {
  value       = yandex_sws_security_profile.public_ai_api.id
  description = "Set this as YC_SWS_SECURITY_PROFILE_ID in GitHub Actions."
}

output "advanced_rate_limiter_profile_id" {
  value       = yandex_sws_advanced_rate_limiter_profile.public_ai_api.id
  description = "Advanced Rate Limiter profile attached to the security profile."
}
