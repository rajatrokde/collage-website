variable "region" {
  type        = string
  description = "Azure Region (e.g. eastus, westus2, westeurope, centralindia)"
  default     = "eastus"
}

variable "cluster_name" {
  type        = string
  description = "AKS Cluster Name"
  default     = "aitae-azure-aks-cluster"
}

variable "node_count" {
  type        = number
  description = "Number of worker nodes"
  default     = 2
}

variable "instance_type" {
  type        = string
  description = "Azure VM Size for nodes"
  default     = "Standard_B2s"
}
