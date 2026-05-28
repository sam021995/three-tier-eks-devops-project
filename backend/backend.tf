terraform {
  backend "s3" {
    bucket         = "sid-terraform-state-12345"
    key            = "eks-prod/terraform.tfstate"
    region         = "eu-west-1"
    dynamodb_table = "terraform-lock"
  }
}