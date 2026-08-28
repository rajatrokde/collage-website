terraform {
  required_version = ">= 1.3.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# --- AZURE RESOURCE GROUP ---
resource "azurerm_resource_group" "rg" {
  name     = "${var.cluster_name}-rg"
  location = var.region
}

# --- AZURE KUBERNETES SERVICE (AKS) ---
resource "azurerm_kubernetes_cluster" "aks" {
  name                = var.cluster_name
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  dns_prefix          = "${var.cluster_name}-dns"

  default_node_pool {
    name       = "default"
    node_count = var.node_count
    vm_size    = var.instance_type
  }

  identity {
    type = "SystemAssigned"
  }

  tags = {
    Environment = "Production"
    Application = "AITAE-Portal"
  }
}
