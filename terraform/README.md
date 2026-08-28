# 🛠️ Universal Multi-Cloud Terraform Infrastructure Directory

This directory provides dedicated, beginner-friendly **Terraform configurations** for each major cloud provider and local Kubernetes environment. Each folder is completely standalone and contains its own step-by-step **`README.md`** guide designed for freshers!

---

## 📁 Choose Your Cloud Folder:

| Cloud / Environment | Folder Path | Description | Beginner Guide |
| :--- | :--- | :--- | :--- |
| 🟧 **Amazon Web Services (AWS)** | [`terraform/aws/`](file:///c:/website/terraform/aws) | AWS EKS Cluster + Managed EC2 Node Groups + VPC | [View AWS Guide](file:///c:/website/terraform/aws/README.md) |
| 🟦 **Microsoft Azure** | [`terraform/azure/`](file:///c:/website/terraform/azure) | Azure AKS Cluster + Resource Group + VNet | [View Azure Guide](file:///c:/website/terraform/azure/README.md) |
| 🟥 **Google Cloud Platform (GCP)** | [`terraform/gcp/`](file:///c:/website/terraform/gcp) | GCP GKE Cluster + Compute VPC + Node Pool | [View GCP Guide](file:///c:/website/terraform/gcp/README.md) |
| ☸️ **Local Kubernetes** | [`terraform/local-k8s/`](file:///c:/website/terraform/local-k8s) | Docker Desktop / Minikube / Kind Deployment | [View Local K8s Guide](file:///c:/website/terraform/local-k8s/README.md) |

---

## ⚡ Quick Start Instructions for Freshers:

1. **Open the folder for your chosen cloud** (e.g., `cd terraform/aws`, `cd terraform/azure`, `cd terraform/gcp`, or `cd terraform/local-k8s`).
2. Read the **`README.md`** file inside that specific folder.
3. Follow the 5 simple steps:
   - Step 1: Login to your Cloud CLI (`aws configure`, `az login`, or `gcloud auth login`)
   - Step 2: Run `terraform init`
   - Step 3: Run `terraform plan`
   - Step 4: Run `terraform apply -auto-approve`
   - Step 5: Access your deployed application!
