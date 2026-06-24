#################################
# VPC
#################################

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "three-tier-vpc"
  }
}

#################################
# PUBLIC SUBNETS (ALB + NAT)
#################################

resource "aws_subnet" "public_1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "eu-west-1a"

  map_public_ip_on_launch = true

  tags = {
    Name = "public-subnet-1"

    "kubernetes.io/role/elb"              = "1"
    "kubernetes.io/cluster/three-tier-eks" = "shared"
  }
}

resource "aws_subnet" "public_2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = "eu-west-1b"

  map_public_ip_on_launch = true

  tags = {
    Name = "public-subnet-2"

    "kubernetes.io/role/elb"              = "1"
    "kubernetes.io/cluster/three-tier-eks" = "shared"
  }
}

#################################
# PRIVATE SUBNETS (EKS WORKERS)
#################################

resource "aws_subnet" "private_1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "eu-west-1a"

  tags = {
    Name = "private-subnet-1"

    "kubernetes.io/role/internal-elb"     = "1"
    "kubernetes.io/cluster/three-tier-eks" = "shared"
  }
}

resource "aws_subnet" "private_2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.4.0/24"
  availability_zone = "eu-west-1b"

  tags = {
    Name = "private-subnet-2"

    "kubernetes.io/role/internal-elb"     = "1"
    "kubernetes.io/cluster/three-tier-eks" = "shared"
  }
}

#################################
# INTERNET GATEWAY
#################################

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "main-igw"
  }
}

#################################
# PUBLIC ROUTE TABLE
#################################

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "public-rt"
  }
}

resource "aws_route" "public_internet" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.igw.id
}

resource "aws_route_table_association" "public_1" {
  subnet_id      = aws_subnet.public_1.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_2" {
  subnet_id      = aws_subnet.public_2.id
  route_table_id = aws_route_table.public.id
}

#################################
# NAT GATEWAY (CRITICAL FIX)
#################################

resource "aws_eip" "nat" {
  domain = "vpc"

  tags = {
    Name = "nat-eip"
  }
}

resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public_1.id

  depends_on = [aws_internet_gateway.igw]

  tags = {
    Name = "nat-gateway"
  }
}

#################################
# PRIVATE ROUTE TABLE
#################################

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "private-rt"
  }
}

resource "aws_route" "private_internet" {
  route_table_id         = aws_route_table.private.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.nat.id

  depends_on = [aws_nat_gateway.nat]
}

resource "aws_route_table_association" "private_1" {
  subnet_id      = aws_subnet.private_1.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private_2" {
  subnet_id      = aws_subnet.private_2.id
  route_table_id = aws_route_table.private.id
}