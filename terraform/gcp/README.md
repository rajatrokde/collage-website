# 🟥 Google Cloud GKE Deployment Guide (Step-by-Step for Beginners)

This directory contains standalone **Terraform code** to provision a **Google Kubernetes Engine (GKE)** cluster along with VPC Networks and Managed Node Pools on **Google Cloud Platform (GCP)**.

---

## 📋 Prerequisites & Tools Needed

1. **Terraform CLI**: [Download Terraform](https://developer.hashicorp.com/terraform/downloads) (Version >= 1.3.0)
2. **Google Cloud SDK (`gcloud`)**: [Download gcloud CLI](https://cloud.google.com/sdk/docs/install)
3. **kubectl**: [Download kubectl](https://kubernetes.io/docs/tasks/tools/)
4. **Google Cloud Account & Project**: Active GCP Account with billing enabled.

---

## 🔑 Step 1: Login to your Google Cloud Account

Open your terminal or PowerShell and sign in to Google Cloud:

```bash
gcloud auth login
gcloud auth application-default login
```

Set your active GCP Project ID:
```bash
gcloud config set project YOUR_GCP_PROJECT_ID
```

---

## ⚡ Step 2: Configure `terraform.tfvars`

Open `terraform.tfvars` in a text editor and update your `project_id`:

```hcl
project_id    = "YOUR_ACTUAL_GCP_PROJECT_ID"
region        = "us-central1"
cluster_name  = "aitae-gcp-gke-cluster"
node_count    = 2
instance_type = "e2-medium"
```

---

## ⚡ Step 3: Initialize Terraform

Navigate into this folder:
```bash
cd terraform/gcp
```

Initialize Terraform (downloads the Google Cloud provider):
```bash
terraform init
```

---

## 🔍 Step 4: Review Infrastructure Plan

Run `terraform plan` to preview the GKE resources to be created:

```bash
terraform plan
```

---

## 🚀 Step 5: Apply & Create the GKE Cluster

Execute `terraform apply` to provision your GKE cluster on Google Cloud:

```bash
terraform apply -auto-approve
```

> ⏱️ **Note**: Provisioning a GKE Cluster on GCP takes approximately **6 to 10 minutes**.

---

## 🔗 Step 6: Connect `kubectl` to your GKE Cluster

Run the output command to fetch credentials for `kubectl`:

```bash
gcloud container clusters get-credentials aitae-gcp-gke-cluster --region us-central1 --project YOUR_GCP_PROJECT_ID
```

Verify your cluster nodes:
```bash
kubectl get nodes
```

---

## 📦 Step 7: Deploy the AITAE Web App & MySQL

Deploy the application manifests:

```bash
kubectl apply -k ../../k8s/ --insecure-skip-tls-verify=true
```

Verify your deployed resources:
```bash
kubectl get pods,svc
```

---

## 🧹 Step 8: Cleanup / Destroy Infrastructure

Delete all GCP resources when finished to avoid billing:

```bash
# Delete K8s app resources
kubectl delete -k ../../k8s/

# Destroy GKE cluster with Terraform
terraform destroy -auto-approve
```
