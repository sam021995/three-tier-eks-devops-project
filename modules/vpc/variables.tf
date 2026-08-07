variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "cluster_name" {
  description = "EKS cluster name this VPC's subnets are tagged for (used for AWS subnet auto-discovery)"
  type        = string
}

variable "name_prefix" {
  description = "Prefix for resource Name tags, e.g. three-tier-dev"
  type        = string
}