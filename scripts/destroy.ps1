<#
Tears down the employee-app and destroys infra for the given environment.

Usage:
  .\scripts\destroy.ps1 -Env dev
#>

param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("dev", "test", "prod")]
    [string]$Env,

    [string]$AwsProfile = "sid_new",
    [string]$Region = "eu-west-1"
)

$env:AWS_PROFILE = $AwsProfile

$RepoRoot = Split-Path -Parent $PSScriptRoot
$EnvDir = Join-Path $RepoRoot "envs\$Env"
$ClusterName = "three-tier-eks-$Env"

Write-Host "========================================"
Write-Host "Environment: $Env  |  Cluster: $ClusterName  |  Region: $Region"
Write-Host "========================================"

Write-Host "========================================"
Write-Host "STEP 1 - Deleting Application Namespace"
Write-Host "========================================"

Write-Host "STEP X - Removing Prometheus Stack"
helm uninstall monitoring -n monitoring 2>$null

kubectl delete namespace monitoring --ignore-not-found=true

kubectl delete namespace employee-app --ignore-not-found=true

Write-Host "========================================"
Write-Host "STEP 2 - Deleting Ingress Namespace"
Write-Host "========================================"

kubectl delete namespace ingress-nginx --ignore-not-found=true

Write-Host "========================================"
Write-Host "STEP 3 - Removing NGINX Ingress (Helm)"
Write-Host "========================================"

helm uninstall ingress-nginx -n ingress-nginx 2>$null

Write-Host "========================================"
Write-Host "STEP 4 - Removing EBS CSI Addon"
Write-Host "========================================"

eksctl delete addon --name aws-ebs-csi-driver --cluster $ClusterName --region $Region

Write-Host "========================================"
Write-Host "STEP 5 - CloudFormation Cleanup"
Write-Host "========================================"

aws cloudformation delete-stack `
    --stack-name "eksctl-$ClusterName-addon-aws-ebs-csi-driver" `
    --region $Region 2>$null

Write-Host "========================================"
Write-Host "STEP 6 - Terraform Destroy"
Write-Host "========================================"

Push-Location $EnvDir
terraform destroy -auto-approve
Pop-Location

Write-Host "========================================"
Write-Host "DONE"
Write-Host "========================================"
