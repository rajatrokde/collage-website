# 🟦 Azure AKS Deployment Guide (Step-by-Step for Beginners)

This directory contains standalone **Terraform code** to provision an **Azure Kubernetes Service (AKS)** cluster along with Resource Group and Nodes on **Microsoft Azure**.

---

## 📋 Prerequisites & Tools Needed

1. **Terraform CLI**: [Download Terraform](https://developer.hashicorp.com/terraform/downloads) (Version >= 1.3.0)
2. **Azure CLI (`az`)**: [Download Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)
3. **kubectl**: [Download kubectl](https://kubernetes.io/docs/tasks/tools/)
4. **Azure Subscription**: Active Azure account with subscription access.

---

## 🔑 Step 1: Login to your Azure Account

Open your terminal or PowerShell and sign in to Azure:

```bash
az login
```

Verify your active Azure Subscription:
```bash
az account show
```

---

## ⚡ Step 2: Initialize Terraform

Navigate into this folder:
```bash
cd terraform/azure
```

Initialize Terraform (downloads the AzureRM provider):
```bash
terraform init
```

---

## 🔍 Step 3: Review Infrastructure Plan

Run `terraform plan` to preview the Azure resources to be created:

```bash
terraform plan
```

---

## 🚀 Step 4: Apply & Create the Azure AKS Cluster

Execute `terraform apply` to provision your AKS cluster on Azure:

```bash
terraform apply -auto-approve
```

> ⏱️ **Note**: Provisioning an AKS Cluster on Azure takes approximately **5 to 8 minutes**.

---

## 🔗 Step 5: Connect `kubectl` to your Azure AKS Cluster

Run the output command from Terraform to fetch credentials and update `kubectl`:

```bash
az aks get-credentials --resource-group aitae-azure-aks-cluster-rg --name aitae-azure-aks-cluster --overwrite-existing
```

Verify your cluster nodes:
```bash
kubectl get nodes
```

---

## 📦 Step 6: Deploy the AITAE Web App & MySQL

Deploy the application manifests:

```bash
kubectl apply -k ../../k8s/ --insecure-skip-tls-verify=true
```

Verify your deployed resources:
```bash
kubectl get pods,svc
```

---

## 🧹 Step 7: Cleanup / Destroy Infrastructure

Delete all Azure resources when finished to avoid billing:

```bash
# Delete K8s app resources
kubectl delete -k ../../k8s/

# Destroy Azure AKS cluster with Terraform
terraform destroy -auto-approve
```
