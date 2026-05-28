$env:AWS_PROFILE="sid_new"

echo "========================================"
echo "STEP 1 - Deleting Application Namespace"
echo "========================================"

kubectl delete namespace employee-app --ignore-not-found=true

echo "========================================"
echo "STEP 2 - Deleting Ingress Namespace"
echo "========================================"

kubectl delete namespace ingress-nginx --ignore-not-found=true

echo "========================================"
echo "STEP 3 - Removing NGINX Ingress (Helm)"
echo "========================================"

helm uninstall ingress-nginx -n ingress-nginx 2>$null

echo "========================================"
echo "STEP 4 - Removing EBS CSI Addon"
echo "========================================"

eksctl delete addon --name aws-ebs-csi-driver --cluster three-tier-eks --region eu-west-1

echo "========================================"
echo "STEP 5 - CloudFormation Cleanup"
echo "========================================"

aws cloudformation delete-stack `
  --stack-name eksctl-three-tier-eks-addon-aws-ebs-csi-driver `
  --region eu-west-1 2>$null

echo "========================================"
echo "STEP 6 - Terraform Destroy"
echo "========================================"

terraform destroy -auto-approve

echo "========================================"
echo "DONE"
echo "========================================"