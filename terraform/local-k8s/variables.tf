variable "kubeconfig_path" {
  type        = string
  description = "Path to local kubeconfig file"
  default     = "~/.kube/config"
}

variable "app_namespace" {
  type        = string
  description = "Kubernetes namespace for application"
  default     = "aitae-portal"
}

variable "db_password" {
  type        = string
  description = "MySQL Root Password"
  default     = "rootpassword"
}

variable "session_secret" {
  type        = string
  description = "Express Session Secret Key"
  default     = "super-secret-local-key"
}
