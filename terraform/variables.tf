variable "cloud_provider" {
  type        = string
  description = "Target cloud provider to provision: 'aws', 'azure', 'gcp', or 'generic_k8s'"
  default     = "generic_k8s"

  validation {
    condition     = contains(["aws", "azure", "gcp", "generic_k8s"], var.cloud_provider)
    error_message = "Valid cloud providers are: 'aws', 'azure', 'gcp', or 'generic_k8s'."
  }
}

variable "cluster_name" {
  type        = string
  description = "Name of the Kubernetes cluster"
  default     = "aitae-k8s-cluster"
}

variable "region" {
  type        = string
  description = "Cloud region for cluster provisioning (e.g. us-east-1, eastus, us-central1)"
  default     = "us-east-1"
}

variable "node_count" {
  type        = number
  description = "Number of worker nodes for the Kubernetes cluster"
  default     = 2
}

variable "instance_type" {
  type        = string
  description = "Node VM size / instance type (e.g. t3.medium for AWS, Standard_B2s for Azure, e2-medium for GCP)"
  default     = "t3.medium"
}

variable "app_namespace" {
  type        = string
  description = "Kubernetes namespace to deploy the application"
  default     = "aitae-portal"
}

variable "db_password" {
  type        = string
  description = "Password for MySQL database"
  default     = "rootpassword"
  sensitive   = true
}

variable "session_secret" {
  type        = string
  description = "Secret key for Express session cookie encryption"
  default     = "super-secret-terraform-session-key"
  sensitive   = true
}
