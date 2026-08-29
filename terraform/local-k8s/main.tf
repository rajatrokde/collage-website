terraform {
  required_version = ">= 1.3.0"
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.25"
    }
  }
}

provider "kubernetes" {
  config_path = var.kubeconfig_path
}

# --- KUBERNETES NAMESPACE ---
resource "kubernetes_namespace" "app_ns" {
  metadata {
    name = var.app_namespace
    labels = {
      app = "aitae-portal"
    }
  }
}

# --- CONFIGMAP ---
resource "kubernetes_config_map" "config" {
  metadata {
    name      = "login-app-config"
    namespace = kubernetes_namespace.app_ns.metadata[0].name
  }

  data = {
    DB_HOST = "mysql-service"
    DB_PORT = "3306"
    DB_NAME = "logindb"
    PORT    = "3000"
  }
}

# --- SECRET ---
resource "kubernetes_secret" "secret" {
  metadata {
    name      = "login-app-secret"
    namespace = kubernetes_namespace.app_ns.metadata[0].name
  }

  data = {
    MYSQL_ROOT_PASSWORD = var.db_password
    MYSQL_USER          = "loginuser"
    MYSQL_PASSWORD      = var.db_password
    SESSION_SECRET      = var.session_secret
  }

  type = "Opaque"
}

# --- MYSQL PERSISTENT VOLUME CLAIM ---
resource "kubernetes_persistent_volume_claim" "mysql_pvc" {
  metadata {
    name      = "mysql-pvc"
    namespace = kubernetes_namespace.app_ns.metadata[0].name
  }

  spec {
    access_modes = ["ReadWriteOnce"]
    resources {
      requests = {
        storage = "2Gi"
      }
    }
  }
}

# --- MYSQL DEPLOYMENT ---
resource "kubernetes_deployment" "mysql" {
  metadata {
    name      = "mysql-deployment"
    namespace = kubernetes_namespace.app_ns.metadata[0].name
  }

  spec {
    replicas = 1
    selector {
      match_labels = {
        app  = "login-app"
        tier = "database"
      }
    }
    template {
      metadata {
        labels = {
          app  = "login-app"
          tier = "database"
        }
      }
      spec {
        container {
          name  = "mysql"
          image = "mysql:8.0.36"
          port { container_port = 3306 }

          env {
            name  = "MYSQL_ROOT_PASSWORD"
            value = var.db_password
          }
          env {
            name  = "MYSQL_DATABASE"
            value = "logindb"
          }
          volume_mount {
            name       = "mysql-storage"
            mount_path = "/var/lib/mysql"
          }
        }
        volume {
          name = "mysql-storage"
          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.mysql_pvc.metadata[0].name
          }
        }
      }
    }
  }
}

# --- MYSQL SERVICE ---
resource "kubernetes_service" "mysql_service" {
  metadata {
    name      = "mysql-service"
    namespace = kubernetes_namespace.app_ns.metadata[0].name
  }

  spec {
    selector = {
      app  = "login-app"
      tier = "database"
    }
    port {
      port        = 3306
      target_port = 3306
    }
    type = "ClusterIP"
  }
}

# --- WEB APP DEPLOYMENT ---
resource "kubernetes_deployment" "web_app" {
  metadata {
    name      = "login-web-deployment"
    namespace = kubernetes_namespace.app_ns.metadata[0].name
  }

  spec {
    replicas = 2
    selector {
      match_labels = {
        app  = "login-app"
        tier = "frontend"
      }
    }
    template {
      metadata {
        labels = {
          app  = "login-app"
          tier = "frontend"
        }
      }
      spec {
        container {
          name  = "web-app"
          image = "login-app:1.0.0"
          port { container_port = 3000 }

          env_from {
            config_map_ref {
              name = kubernetes_config_map.config.metadata[0].name
            }
          }

          readiness_probe {
            http_get {
              path = "/healthz"
              port = 3000
            }
            initial_delay_seconds = 10
            period_seconds        = 5
          }

          liveness_probe {
            http_get {
              path = "/healthz"
              port = 3000
            }
            initial_delay_seconds = 15
            period_seconds        = 10
          }
        }
      }
    }
  }
}

# --- WEB APP SERVICE (NodePort) ---
resource "kubernetes_service" "web_service" {
  metadata {
    name      = "login-web-service"
    namespace = kubernetes_namespace.app_ns.metadata[0].name
  }

  spec {
    selector = {
      app  = "login-app"
      tier = "frontend"
    }
    port {
      port        = 3000
      target_port = 3000
      node_port   = 30080
    }
    type = "NodePort"
  }
}
