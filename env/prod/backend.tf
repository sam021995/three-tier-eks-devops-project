terraform {
  backend "s3" {
    bucket         = "sid-terraform-state-020995"
    key            = "eks-prod/terraform.tfstate"
    region         = "eu-west-1"
    dynamodb_table = "terraform-lock"
  }
}