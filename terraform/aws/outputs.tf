output "eks_cluster_name" {
  value       = aws_eks_cluster.eks.name
  description = "Name of the created EKS cluster"
}

output "eks_cluster_endpoint" {
  value       = aws_eks_cluster.eks.endpoint
  description = "EKS Cluster API Endpoint"
}

output "kubeconfig_command" {
  value       = "aws eks update-kubeconfig --region ${var.region} --name ${aws_eks_cluster.eks.name}"
  description = "Command to connect your local kubectl to this EKS cluster"
}
