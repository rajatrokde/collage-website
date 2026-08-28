output "resource_group_name" {
  value       = azurerm_resource_group.rg.name
  description = "Azure Resource Group Name"
}

output "aks_cluster_name" {
  value       = azurerm_kubernetes_cluster.aks.name
  description = "AKS Cluster Name"
}

output "aks_cluster_endpoint" {
  value       = azurerm_kubernetes_cluster.aks.kube_config.0.host
  description = "AKS Cluster API Host"
}

output "kubeconfig_command" {
  value       = "az aks get-credentials --resource-group ${azurerm_resource_group.rg.name} --name ${azurerm_kubernetes_cluster.aks.name} --overwrite-existing"
  description = "Command to connect your local kubectl to this AKS cluster"
}
