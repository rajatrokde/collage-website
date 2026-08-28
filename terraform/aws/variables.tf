variable "region" {
  type        = string
  description = "AWS region (e.g. us-east-1, us-west-2, ap-south-1)"
  default     = "us-east-1"
}

variable "cluster_name" {
  type        = string
  description = "EKS Cluster Name"
  default     = "aitae-aws-eks-cluster"
}

variable "node_count" {
  type        = number
  description = "Number of worker nodes"
  default     = 2
}

variable "instance_type" {
  type        = string
  description = "EC2 Instance type for nodes"
  default     = "t3.medium"
}
