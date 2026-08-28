# 🟧 AWS EKS Deployment Guide (Step-by-Step for Beginners)

This directory contains standalone **Terraform code** to provision an **Amazon EKS (Elastic Kubernetes Service)** cluster along with VPC, Subnets, IAM roles, and Managed EC2 Node Groups on **Amazon Web Services (AWS)**.

---

## 📋 Prerequisites & Tools Needed

Before running this Terraform code, make sure you have the following installed on your machine:

1. **Terraform CLI**: [Download Terraform](https://developer.hashicorp.com/terraform/downloads) (Version >= 1.3.0)
2. **AWS CLI**: [Download AWS CLI](https://aws.amazon.com/cli/)
3. **kubectl**: [Download kubectl](https://kubernetes.io/docs/tasks/tools/)
4. **AWS Account**: An active AWS Account with IAM administrator permissions.

---

## 🔑 Step 1: Configure Your AWS Credentials

Open your terminal or PowerShell and configure your AWS credentials:

```bash
aws configure
```

You will be prompted for:
- **AWS Access Key ID**: Your access key
- **AWS Secret Access Key**: Your secret key
- **Default region name**: `us-east-1` (or your preferred region)
- **Default output format**: `json`

Verify your AWS connection:
```bash
aws sts get-caller-identity
```

---

## ⚡ Step 2: Initialize Terraform

Navigate into this folder:
```bash
cd terraform/aws
```

Initialize Terraform (this downloads the required AWS provider plugins):
```bash
terraform init
```

---

## 🔍 Step 3: Review Infrastructure Plan

Run `terraform plan` to see what resources Terraform will create on AWS (VPC, Subnets, EKS Cluster, IAM Roles, Node Group):

```bash
terraform plan
```

---

## 🚀 Step 4: Apply & Create the EKS Cluster

Run `terraform apply` to start creating your EKS cluster on AWS:

```bash
terraform apply -auto-approve
```

> ⏱️ **Note**: Provisioning an EKS Cluster on AWS takes approximately **10 to 15 minutes**.

---

## 🔗 Step 5: Connect `kubectl` to your AWS EKS Cluster

Once Terraform completes, it will output a command to update your local Kubernetes config. Run that command:

```bash
aws eks update-kubeconfig --region us-east-1 --name aitae-aws-eks-cluster
```

Verify your cluster nodes are running:
```bash
kubectl get nodes
```

---

## 📦 Step 6: Deploy the AITAE Web App & MySQL

Deploy the Kubernetes manifests from the `k8s/` directory to your new AWS cluster:

```bash
kubectl apply -k ../../k8s/ --insecure-skip-tls-verify=true
```

Verify your deployed pods and services:
```bash
kubectl get pods,svc
```

---

## 🧹 Step 7: Cleanup / Destroy Infrastructure (To Avoid Charges)

When you are finished testing, delete all AWS resources to avoid incurring cloud costs:

```bash
# 1. Delete Kubernetes resources first
kubectl delete -k ../../k8s/

# 2. Destroy AWS EKS cluster with Terraform
terraform destroy -auto-approve
```
