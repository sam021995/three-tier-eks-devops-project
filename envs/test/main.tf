terraform {
  backend "s3" {
    bucket         = "sid-terraform-state-020995"
    key            = "envs/test/terraform.tfstate"
    region         = "eu-west-1"
    dynamodb_table = "terraform-lock"
  }
}

provider "aws" {
  region = "eu-west-1"
}

#################################
# VPC MODULE
#################################
module "vpc" {
  source = "../../modules/vpc"

  vpc_cidr     = "10.1.0.0/16"
  cluster_name = "three-tier-eks-test"
  name_prefix  = "three-tier-test"
}

#################################
# EKS CLUSTER
#################################
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "three-tier-eks-test"
  cluster_version = "1.30"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  enable_irsa = true

  #################################
  # ACCESS (kubectl fix)
  #################################
  cluster_endpoint_public_access       = true
  cluster_endpoint_private_access      = true
  cluster_endpoint_public_access_cidrs = ["0.0.0.0/0"]

  #################################
  # MANAGED NODE GROUP
  #################################
  eks_managed_node_groups = {
    app_nodes = {
      name = "app-nodes"

      desired_size = 1
      min_size     = 1
      max_size     = 1

      instance_types = ["t3.small"]
      capacity_type  = "ON_DEMAND"

      subnet_ids = module.vpc.private_subnets

      ami_type = "AL2023_x86_64_STANDARD"

      # IMPORTANT: prevent bootstrap issues
      create_launch_template = true

      labels = {
        role = "app"
      }

      tags = {
        Environment = "test"
      }
    }
  }

  #################################
  # IAM ACCESS ENTRIES
  #################################
  access_entries = {
    sid_admin = {
      principal_arn = "arn:aws:iam::628658447302:user/sid_new"

      policy_associations = {
        admin = {
          policy_arn = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"

          access_scope = {
            type = "cluster"
          }
        }
      }
    }
  }

  tags = {
    Environment = "test"
  }
}
