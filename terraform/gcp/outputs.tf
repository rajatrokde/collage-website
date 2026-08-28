output "gke_cluster_name" {
  value       = google_container_cluster.gke.name
  description = "GKE Cluster Name"
}

output "gke_cluster_endpoint" {
  value       = google_container_cluster.gke.endpoint
  description = "GKE API Host Endpoint"
}

output "kubeconfig_command" {
  value       = "gcloud container clusters get-credentials ${google_container_cluster.gke.name} --region ${var.region} --project ${var.project_id}"
  description = "Command to connect your local kubectl to this GKE cluster"
}
