$env:AWS_PROFILE="sid_new"

Write-Host "========================================"
Write-Host "STEP 1 - Terraform Apply"
Write-Host "========================================"

terraform apply -auto-approve

Write-Host "========================================"
Write-Host "STEP 2 - Update kubeconfig"
Write-Host "========================================"

aws eks update-kubeconfig --region eu-west-1 --name three-tier-eks

Write-Host "========================================"
Write-Host "STEP 3 - Wait for Nodes Ready"
Write-Host "========================================"

kubectl wait --for=condition=Ready nodes --all --timeout=300s
kubectl get nodes


Write-Host "========================================"
Write-Host "STEP 3.1 - Ensure Worker Node SG Allows Cross-Node Traffic"
Write-Host "========================================"

$nodeIps = kubectl get nodes -o jsonpath="{.items[*].status.addresses[?(@.type=='InternalIP')].address}"

$nodeSg = aws ec2 describe-instances `
    --filters "Name=private-ip-address,Values=$($nodeIps -replace ' ', ',')" `
    --region eu-west-1 `
    --query "Reservations[0].Instances[0].SecurityGroups[0].GroupId" `
    --output text

Write-Host "Worker Node Security Group: $nodeSg"

aws ec2 authorize-security-group-ingress `
    --group-id $nodeSg `
    --protocol all `
    --source-group $nodeSg `
    --region eu-west-1 2>$null

Write-Host "Worker node self-ingress rule ensured"



Write-Host "========================================"
Write-Host "STEP 3.2 - Ensure GitHub OIDC Role Has EKS Access"
Write-Host "========================================"

$githubRoleArn = "arn:aws:iam::628658447302:role/GitHubActionsEKSDeployRole"

aws eks create-access-entry `
    --cluster-name three-tier-eks `
    --region eu-west-1 `
    --principal-arn $githubRoleArn `
    --type STANDARD 2>$null

aws eks associate-access-policy `
    --cluster-name three-tier-eks `
    --region eu-west-1 `
    --principal-arn $githubRoleArn `
    --policy-arn arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy `
    --access-scope type=cluster 2>$null

Write-Host "GitHub Actions OIDC role EKS access ensured"

Write-Host "========================================"
Write-Host "STEP 4 - Ensure EBS CSI Addon"
Write-Host "========================================"

$addonExists = aws eks list-addons --cluster-name three-tier-eks --query "contains(addons, 'aws-ebs-csi-driver')" --output text

if ($addonExists -eq "False") {

    Write-Host "EBS CSI Addon not found. Creating..."

    aws eks create-addon `
        --cluster-name three-tier-eks `
        --addon-name aws-ebs-csi-driver

    Write-Host "Finding Node Role..."

    $nodegroup = aws eks list-nodegroups `
        --cluster-name three-tier-eks `
        --query "nodegroups[0]" `
        --output text

    $nodeRoleArn = aws eks describe-nodegroup `
        --cluster-name three-tier-eks `
        --nodegroup-name $nodegroup `
        --query "nodegroup.nodeRole" `
        --output text

    $roleName = $nodeRoleArn.Split("/")[-1]

    Write-Host "Attaching AmazonEBSCSIDriverPolicy..."

    aws iam attach-role-policy `
        --role-name $roleName `
        --policy-arn arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy

    Write-Host "Waiting 60 seconds for IAM propagation..."
    Start-Sleep -Seconds 60
}
else {
    Write-Host "EBS CSI Addon already exists"
}

Write-Host "Waiting for EBS CSI Addon to become ACTIVE..."

$maxAttempts = 30
$status = ""

for ($i = 1; $i -le $maxAttempts; $i++) {

    $status = aws eks describe-addon `
        --cluster-name three-tier-eks `
        --addon-name aws-ebs-csi-driver `
        --query "addon.status" `
        --output text 2>$null

    Write-Host "Addon Status: $status"

    if ($status -eq "ACTIVE") {
        break
    }

    Start-Sleep -Seconds 10
}

if ($status -ne "ACTIVE") {

    Write-Host "Restarting EBS CSI Controller Pods..."

    kubectl delete pod `
        -n kube-system `
        -l app=ebs-csi-controller `
        --ignore-not-found=true

    Start-Sleep -Seconds 30

    for ($i = 1; $i -le 18; $i++) {

        $status = aws eks describe-addon `
            --cluster-name three-tier-eks `
            --addon-name aws-ebs-csi-driver `
            --query "addon.status" `
            --output text 2>$null

        Write-Host "Addon Status: $status"

        if ($status -eq "ACTIVE") {
            break
        }

        Start-Sleep -Seconds 10
    }
}

if ($status -ne "ACTIVE") {
    Write-Host "ERROR: EBS CSI Addon failed to become ACTIVE"
    exit 1
}

kubectl get pods -n kube-system | findstr ebs

Write-Host "EBS CSI Addon is ACTIVE"

Write-Host "========================================"
Write-Host "STEP 5 - Install/Upgrade NGINX Ingress"
Write-Host "========================================"

helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx 2>$null
helm repo update

helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx `
    --namespace ingress-nginx `
    --create-namespace

kubectl rollout status deployment/ingress-nginx-controller -n ingress-nginx --timeout=300s

Write-Host "========================================"
Write-Host "STEP 6 - Recreate Namespace"
Write-Host "========================================"

kubectl delete namespace employee-app --ignore-not-found=true
Start-Sleep -Seconds 20
kubectl create namespace employee-app

Write-Host "========================================"
Write-Host "STEP 7 - Ensure NO conflicting secrets"
Write-Host "========================================"

kubectl delete secret mysql-secret -n employee-app --ignore-not-found=true

Write-Host "========================================"
Write-Host "STEP 8 - Deploy Application via Helm"
Write-Host "========================================"

helm upgrade --install employee-app `
    "D:\Terraform practice 3 tier\three-tier-eks-terraform\env\prod\employee-app-chart" `
    -n employee-app `
    --set mysql.user=admin `
    --set mysql.password=admin123 `
    --set mysql.rootPassword=rootpass

Write-Host "========================================"
Write-Host "STEP 9 - Wait for App Components"
Write-Host "========================================"

kubectl wait --for=condition=available deployment/backend -n employee-app --timeout=300s
kubectl wait --for=condition=available deployment/frontend -n employee-app --timeout=300s
kubectl rollout status statefulset/mysql -n employee-app --timeout=300s

Write-Host "========================================"
Write-Host "STEP 10 - Verify Storage"
Write-Host "========================================"

kubectl get pvc -n employee-app
kubectl get pv

Write-Host "========================================"
Write-Host "STEP 11 - Get Ingress URL"
Write-Host "========================================"

kubectl get ingress -n employee-app

Write-Host "========================================"
Write-Host "STEP 12 - Watch Pods"
Write-Host "========================================"

kubectl get pods -n employee-app

Write-Host "========================================"
Write-Host "STEP 13 - Install Prometheus + Grafana"
Write-Host "========================================"

helm repo add prometheus-community https://prometheus-community.github.io/helm-charts 2>$null
helm repo update

helm upgrade --install monitoring prometheus-community/kube-prometheus-stack `
    -n monitoring `
    --create-namespace

Write-Host "Waiting for monitoring pods to be ready..."

kubectl rollout status statefulset/prometheus-monitoring-kube-prometheus-prometheus `
    -n monitoring `
    --timeout=300s