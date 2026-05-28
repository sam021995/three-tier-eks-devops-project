$env:AWS_PROFILE="sid_new"

echo "========================================"
echo "STEP 1 - Creating Terraform Infrastructure"
echo "========================================"

terraform apply -auto-approve

echo "========================================"
echo "STEP 2 - Connecting kubectl to EKS Cluster"
echo "========================================"

aws eks update-kubeconfig --region eu-west-1 --name three-tier-eks

echo "========================================"
echo "STEP 3 - Waiting for Cluster Stability"
echo "========================================"

Start-Sleep -Seconds 60

echo "========================================"
echo "STEP 4 - Cleaning Old EBS CSI Stack (if exists)"
echo "========================================"

aws cloudformation update-termination-protection --no-enable-termination-protection --stack-name eksctl-three-tier-eks-addon-aws-ebs-csi-driver --region eu-west-1 2>$null

aws cloudformation delete-stack --stack-name eksctl-three-tier-eks-addon-aws-ebs-csi-driver --region eu-west-1 2>$null

Start-Sleep -Seconds 20

echo "========================================"
echo "STEP 5 - Installing EBS CSI Driver"
echo "========================================"

eksctl create addon --name aws-ebs-csi-driver --cluster three-tier-eks --region eu-west-1 --force

echo "========================================"
echo "STEP 6 - Verifying EBS CSI Pods"
echo "========================================"

kubectl get pods -n kube-system

echo "========================================"
echo "STEP 7 - Installing NGINX Ingress"
echo "========================================"

helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx

helm repo update

helm uninstall ingress-nginx -n ingress-nginx 2>$null

helm install ingress-nginx ingress-nginx/ingress-nginx --namespace ingress-nginx --create-namespace

echo "========================================"
echo "STEP 8 - Cleaning Old Application Namespace"
echo "========================================"

kubectl delete namespace employee-app --ignore-not-found=true

Start-Sleep -Seconds 20

echo "========================================"
echo "STEP 9 - Creating Application Namespace"
echo "========================================"

kubectl create namespace employee-app

echo "========================================"
echo "STEP 10 - Creating MySQL Secret"
echo "========================================"

kubectl create secret generic mysql-secret --from-literal=MYSQL_USER=admin --from-literal=MYSQL_PASSWORD=admin123 -n employee-app

echo "========================================"
echo "STEP 11 - Deploying Kubernetes Manifests"
echo "========================================"

kubectl apply -f k8s/

echo "========================================"
echo "STEP 12 - Watching Application Pods"
echo "========================================"

kubectl get pods -n employee-app -w
