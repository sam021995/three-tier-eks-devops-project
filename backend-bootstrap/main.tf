provider "aws" {
  region  = "eu-west-1"
  profile = "sid_new"
}

resource "aws_s3_bucket" "tf_state" {
  bucket = "sid-terraform-state-020995"
}

resource "aws_s3_bucket_versioning" "versioning" {
  bucket = aws_s3_bucket.tf_state.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_dynamodb_table" "terraform_lock" {
  name         = "terraform-lock"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}