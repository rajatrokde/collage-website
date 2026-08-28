terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

variable "cluster_name" { type = string }
variable "region" { type = string }
variable "node_count" { type = number }
variable "instance_type" { type = string }

# Resource Group for AKS
resource "azurerm_resource_group" "rg" {
  name     = "${var.cluster_name}-rg"
  location = var.region
}

# Azure Kubernetes Service (AKS) Cluster
resource "azurerm_kubernetes_cluster" "aks" {
  name                = var.cluster_name
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  dns_prefix          = "${var.cluster_name}-dns"

  default_node_pool {
    name       = "default"
    node_count = var.node_count
    vm_size    = var.instance_type == "t3.medium" ? "Standard_B2s" : var.instance_type
  }

  identity {
    type = "SystemAssigned"
  }

  tags = {
    Environment = "Production"
    Application = "AITAE-Portal"
  }
}

output "cluster_endpoint" { value = azurerm_kubernetes_cluster.aks.kube_config.0.host }
output "cluster_name" { value = azurerm_kubernetes_cluster.aks.name }
