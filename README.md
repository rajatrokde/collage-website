# 🎓 Apex Institute of Technology & Advanced Engineering (AITAE)
## Enterprise Academic ERP, Kubernetes & Multi-Cloud Terraform Infrastructure

An ultra-realistic, enterprise-grade **Engineering College Web Portal & Academic ERP System** built with **Node.js**, **Express**, **MySQL** (with integrated **In-Memory Store Fallback** for zero-crash standalone execution), **Docker**, **Kubernetes (`k8s/`)**, and **Multi-Cloud Terraform (`terraform/`)**.

---

## 🚀 Quick Overview

- **Institution**: Apex Institute of Technology & Advanced Engineering (AITAE)
- **Accreditations**: NAAC 'A++' Grade (3.82 CGPA) | NBA Accredited | NIRF Top 15 Engineering | AICTE Autonomous
- **Key Portals**:
  - 🎓 **Student ERP**: Grade cards, attendance tracker, class timetable, fee payment, gate pass generator.
  - 👨‍🏫 **Faculty Portal**: Course management, biometric attendance log, student advisement.
  - 🛡️ **Dean / Admin ERP**: Institutional administration, full CRUD REST API management.
  - 👨‍👩‍👧 **Parent Portal**: Real-time student academic progress & fee status.

---

## 🔑 One-Click Demo Credentials

You can test the application instantly using the **1-Click Demo Login Buttons** on the login page ([`http://localhost:3000`](http://localhost:3000)) or using the credentials below:

| Category | Identifier / Roll No | Password | Profile Name | Department / Role |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | `2023BCSE0842` | `student123` | Aarav Sharma | B.Tech Computer Science & Engg (Sem 6) |
| **Faculty** | `FAC-CSE-4092` | `faculty123` | Dr. Rajeshwari Ramanujan | Associate Professor (CSE & AI) |
| **Dean / Admin** | `admin` | `admin123` | Dr. K. V. S. Murthy | Registrar & Chief Academic Officer |
| **Parent** | `PARENT-842` | `parent123` | Mukesh Sharma | Parent Portal View |

---

## 🏗️ Folder Structure

```text
website/
├── k8s/                       # Complete Kubernetes Manifests Directory
│   ├── app-deployment.yaml    # Node.js Web App Deployment & Service
│   ├── mysql-deployment.yaml  # MySQL Database Deployment & Service
│   ├── mysql-pv-pvc.yaml      # Persistent Volume Claim for MySQL
│   ├── configmap.yaml         # App Configuration Environment Variables
│   ├── secret.yaml            # Database Passwords & Session Secret
│   ├── ingress.yaml           # NGINX Ingress Controller Routing Rules
│   ├── hpa.yaml               # Horizontal Pod Autoscaler (CPU/Mem)
│   └── kustomization.yaml     # Kustomize Bundle Manifest
│
├── terraform/                 # Multi-Cloud Terraform Infrastructure Directory
│   ├── README.md              # Main Index for Cloud Directories
│   ├── aws/                   # 🟧 AWS EKS Cluster + Node Groups + Step-by-Step Guide
│   │   ├── main.tf, variables.tf, outputs.tf, terraform.tfvars, README.md
│   ├── azure/                 # 🟦 Azure AKS Cluster + Resource Group + Step-by-Step Guide
│   │   ├── main.tf, variables.tf, outputs.tf, terraform.tfvars, README.md
│   ├── gcp/                   # 🟥 Google Cloud GKE Cluster + VPC + Step-by-Step Guide
│   │   ├── main.tf, variables.tf, outputs.tf, terraform.tfvars, README.md
│   └── local-k8s/             # ☸️ Local K8s (Docker Desktop / Minikube) + Step-by-Step Guide
│       ├── main.tf, variables.tf, outputs.tf, terraform.tfvars, README.md
│
├── db.js                      # MySQL Connection & In-Memory Store Fallback
├── server.js                  # Express Server, Auth & Complete CRUD REST APIs
├── init.sql                   # Database Schema & Engineering Seed Data
└── public/                    # Frontend UI Pages & Styles
    ├── index.html             # Multi-role Login Portal
    ├── dashboard.html         # Engineering Academic ERP Dashboard
    ├── register.html          # Student Admissions Portal
    └── styles.css             # Academic Navy & Gold Design System
```

---

## 🌍 Cloud-Specific Terraform Deployment Guides

Choose your cloud provider directory and follow the step-by-step guide inside:

- 🟧 **AWS EKS**: Navigate to [`terraform/aws/`](file:///c:/website/terraform/aws) and read [`README.md`](file:///c:/website/terraform/aws/README.md)
- 🟦 **Azure AKS**: Navigate to [`terraform/azure/`](file:///c:/website/terraform/azure) and read [`README.md`](file:///c:/website/terraform/azure/README.md)
- 🟥 **Google Cloud GKE**: Navigate to [`terraform/gcp/`](file:///c:/website/terraform/gcp) and read [`README.md`](file:///c:/website/terraform/gcp/README.md)
- ☸️ **Local Kubernetes**: Navigate to [`terraform/local-k8s/`](file:///c:/website/terraform/local-k8s) and read [`README.md`](file:///c:/website/terraform/local-k8s/README.md)

---

## ⚡ Local Development (Node.js & Docker)

### Option 1: Local Node.js Execution (Zero External Dependencies)
```bash
cd c:\website
npm install
node server.js
```
Open **http://localhost:3000** in your browser.

### Option 2: Docker Compose
```bash
docker-compose up -d --build
```

---

## 🌐 Complete REST CRUD APIs Summary

- `GET /api/courses`, `POST /api/courses`, `PUT /api/courses/:code`, `DELETE /api/courses/:code`
- `GET /api/admin/users`, `POST /api/admin/users`, `PUT /api/admin/users/:id`, `DELETE /api/admin/users/:id`
- `GET /api/notices`, `POST /api/notices`, `PUT /api/notices/:id`, `DELETE /api/notices/:id`
- `GET /api/placements`, `POST /api/placements`, `PUT /api/placements/:id`, `DELETE /api/placements/:id`
- `GET /api/fees`, `POST /api/fees`, `PUT /api/fees/:id`, `DELETE /api/fees/:id`
- `GET /api/gatepasses`, `POST /api/student/gatepass`, `PUT /api/gatepasses/:id`, `DELETE /api/gatepasses/:id`
