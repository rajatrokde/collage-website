variable "project_id" {
  type        = string
  description = "Google Cloud Project ID"
  default     = "my-gcp-project-id"
}

variable "region" {
  type        = string
  description = "GCP Region (e.g. us-central1, europe-west1, asia-south1)"
  default     = "us-central1"
}

variable "cluster_name" {
  type        = string
  description = "GKE Cluster Name"
  default     = "aitae-gcp-gke-cluster"
}

variable "node_count" {
  type        = number
  description = "Number of worker nodes"
  default     = 2
}

variable "instance_type" {
  type        = string
  description = "GCP Machine Type for nodes"
  default     = "e2-medium"
}
