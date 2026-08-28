terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

variable "cluster_name" { type = string }
variable "region" { type = string }
variable "node_count" { type = number }
variable "instance_type" { type = string }

# VPC Network for GCP
resource "google_compute_network" "vpc" {
  name                    = "${var.cluster_name}-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "subnet" {
  name          = "${var.cluster_name}-subnet"
  ip_cidr_range = "10.10.0.0/16"
  region        = var.region
  network       = google_compute_network.vpc.name
}

# GKE Cluster
resource "google_container_cluster" "gke" {
  name     = var.cluster_name
  location = var.region

  remove_default_node_pool = true
  initial_node_count       = 1

  network    = google_compute_network.vpc.name
  subnetwork = google_compute_subnetwork.subnet.name
}

# GKE Managed Node Pool
resource "google_container_node_pool" "primary_nodes" {
  name       = "${var.cluster_name}-node-pool"
  location   = var.region
  cluster    = google_container_cluster.gke.name
  node_count = var.node_count

  node_config {
    preemptible  = true
    machine_type = var.instance_type == "t3.medium" ? "e2-medium" : var.instance_type

    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }
}

output "cluster_endpoint" { value = google_container_cluster.gke.endpoint }
output "cluster_name" { value = google_container_cluster.gke.name }
