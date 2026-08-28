output "cloud_provider_selected" {
  value       = var.cloud_provider
  description = "Cloud provider selected for deployment"
}

output "kubernetes_namespace" {
  value       = module.k8s_app.namespace
  description = "Kubernetes namespace where AITAE Portal is deployed"
}

output "web_service_name" {
  value       = module.k8s_app.service_name
  description = "Kubernetes NodePort service name for the web app"
}

output "cluster_endpoint" {
  value = var.cloud_provider == "aws" ? try(module.aws_eks[0].cluster_endpoint, "N/A") : (
    var.cloud_provider == "azure" ? try(module.azure_aks[0].cluster_endpoint, "N/A") : (
      var.cloud_provider == "gcp" ? try(module.gcp_gke[0].cluster_endpoint, "N/A") : "Local Cluster (~/.kube/config)"
    )
  )
  description = "Endpoint URL of the provisioned Kubernetes cluster"
}
