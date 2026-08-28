# ☸️ Local Kubernetes Deployment Guide (Minikube / Docker Desktop / Kind)

This directory contains standalone **Terraform code** using the official **Kubernetes Provider** to deploy the **AITAE Engineering Portal** (Node.js Web App + MySQL + PVC + Secrets + NodePort Service) directly to any local Kubernetes cluster (**Docker Desktop**, **Minikube**, **Kind**, or **K3s**).

---

## 📋 Prerequisites & Tools Needed

1. **Terraform CLI**: [Download Terraform](https://developer.hashicorp.com/terraform/downloads) (Version >= 1.3.0)
2. **Kubernetes Cluster**: Docker Desktop Kubernetes OR Minikube OR Kind running locally.
3. **kubectl**: [Download kubectl](https://kubernetes.io/docs/tasks/tools/)

---

## ⚡ Step 1: Ensure Local Kubernetes Cluster is Running

If using **Docker Desktop**: Enable Kubernetes in Docker Desktop Settings.

If using **Minikube**:
```bash
minikube start
```

Verify `kubectl` is connected to your local cluster:
```bash
kubectl get nodes
```

---

## ⚡ Step 2: Initialize Terraform

Navigate into this folder:
```bash
cd terraform/local-k8s
```

Initialize Terraform (downloads the Kubernetes provider):
```bash
terraform init
```

---

## 🔍 Step 3: Review Infrastructure Plan

Run `terraform plan` to preview all Kubernetes resources to be created:

```bash
terraform plan
```

---

## 🚀 Step 4: Apply & Deploy Application

Execute `terraform apply` to deploy the application and database to your local Kubernetes cluster:

```bash
terraform apply -auto-approve
```

---

## 🌐 Step 5: Access the Web Portal

Once applied, access the application in your browser:

- **Web Portal URL**: [http://localhost:30080](http://localhost:30080)
- **Health Probe**: [http://localhost:30080/healthz](http://localhost:30080/healthz)

*(If using Minikube, run `minikube service login-web-service -n aitae-portal` to open the URL automatically).*

---

## 🧹 Step 6: Cleanup / Destroy

Delete all local Kubernetes resources created by Terraform:

```bash
terraform destroy -auto-approve
```
