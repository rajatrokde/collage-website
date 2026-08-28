terraform {
  required_version = ">= 1.3.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.25"
    }
  }
}

provider "aws" {
  region = var.region
}

provider "azurerm" {
  features {}
}

provider "google" {
  region = var.region
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

# Module 1: AWS EKS (Conditional)
module "aws_eks" {
  count         = var.cloud_provider == "aws" ? 1 : 0
  source        = "./modules/aws_eks"
  cluster_name  = var.cluster_name
  region        = var.region
  node_count    = var.node_count
  instance_type = var.instance_type
}

# Module 2: Azure AKS (Conditional)
module "azure_aks" {
  count         = var.cloud_provider == "azure" ? 1 : 0
  source        = "./modules/azure_aks"
  cluster_name  = var.cluster_name
  region        = var.region
  node_count    = var.node_count
  instance_type = var.instance_type
}

# Module 3: GCP GKE (Conditional)
module "gcp_gke" {
  count         = var.cloud_provider == "gcp" ? 1 : 0
  source        = "./modules/gcp_gke"
  cluster_name  = var.cluster_name
  region        = var.region
  node_count    = var.node_count
  instance_type = var.instance_type
}

# Module 4: Kubernetes Application Deployment (Runs on ANY Cloud or Local Cluster)
module "k8s_app" {
  source         = "./modules/k8s_app"
  app_namespace  = var.app_namespace
  db_password    = var.db_password
  session_secret = var.session_secret
}
