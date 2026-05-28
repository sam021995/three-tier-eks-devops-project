provider "aws" {
  region  = "eu-west-1"
  profile = "sid_new"
}

module "vpc" {
  source = "../../modules/vpc"
}


module "rds" {
  source = "../../modules/rds"
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "three-tier-eks"
  cluster_version = "1.29"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  enable_irsa = true

  # =====================================================
  # 🔥 FIX: ENABLE PUBLIC ACCESS (THIS IS YOUR MAIN ISSUE)
  # =====================================================
  cluster_endpoint_public_access  = true
  cluster_endpoint_private_access = true

  # ⚠️ For learning only (production = restrict to your IP)
  cluster_endpoint_public_access_cidrs = ["0.0.0.0/0"]

  eks_managed_node_groups = {
    app_nodes = {
      desired_size = 1
      min_size     = 1
      max_size     = 1

      instance_types = ["t3.small"]

      subnet_ids = module.vpc.private_subnets
      ami_type                   = "AL2023_x86_64_STANDARD"
      use_custom_launch_template = false
    }
  }

  # =====================================================
  # 🔐 IAM ACCESS FIX (kubectl authentication issue)
  # =====================================================
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
    Environment = "prod"
  }
}