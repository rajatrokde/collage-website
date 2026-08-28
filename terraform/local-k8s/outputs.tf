output "namespace" {
  value       = kubernetes_namespace.app_ns.metadata[0].name
  description = "Created Kubernetes Namespace"
}

output "web_service_name" {
  value       = kubernetes_service.web_service.metadata[0].name
  description = "Created NodePort Web Service Name"
}

output "web_access_url" {
  value       = "http://localhost:30080"
  description = "URL to access your web portal on local Kubernetes"
}
