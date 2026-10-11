# ==============================================================================
# AtmosAI - AWS Automated Deployment Script
# Provisions CloudFormation Infrastructure (DynamoDB, IAM, IoT Core, SNS)
# ==============================================================================

param(
    [string]$Region = "ap-south-1",
    [string]$StackName = "AtmosAI-Production",
    [string]$Environment = "production"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🌍 AtmosAI AWS Deployment Automation" -ForegroundColor Cyan
Write-Host "Region: $Region | Stack: $StackName | Environment: $Environment" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Step 1: Verify AWS Authentication
Write-Host "`n[1/4] Checking AWS Authentication..." -ForegroundColor Yellow
$identity = aws sts get-caller-identity 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ AWS CLI is not authenticated or session has expired." -ForegroundColor Red
    Write-Host "Please run one of the following commands first:" -ForegroundColor White
    Write-Host "  1. aws login  (or aws sso login)" -ForegroundColor White
    Write-Host "  2. aws configure  (if using Access Key / Secret Key)" -ForegroundColor White
    exit 1
}
Write-Host "✅ Authenticated to AWS: $identity" -ForegroundColor Green

# Step 2: Deploy CloudFormation Stack
Write-Host "`n[2/4] Deploying CloudFormation Infrastructure (DynamoDB, IAM, SNS, IoT)..." -ForegroundColor Yellow
$templatePath = Join-Path $PSScriptRoot "atmosai-infrastructure.yml"

aws cloudformation deploy `
    --template-file "$templatePath" `
    --stack-name "$StackName" `
    --region "$Region" `
    --parameter-overrides EnvironmentName="$Environment" `
    --capabilities CAPABILITY_NAMED_IAM

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ CloudFormation Stack deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ CloudFormation deployment encountered an error." -ForegroundColor Red
    exit 1
}

# Step 3: Fetch Outputs
Write-Host "`n[3/4] Fetching Stack Outputs..." -ForegroundColor Yellow
$outputs = aws cloudformation describe-stacks `
    --stack-name "$StackName" `
    --region "$Region" `
    --query "Stacks[0].Outputs" `
    --output table

Write-Host $outputs

# Step 4: Summary Instructions for App Runner & Amplify
Write-Host "`n[4/4] Deployment Next Steps:" -ForegroundColor Yellow
Write-Host "1. Backend Container (AWS App Runner):" -ForegroundColor White
Write-Host "   - Option A: Connect your GitHub repo to AWS App Runner. Set build type: Dockerfile, Port: 8000." -ForegroundColor Gray
Write-Host "   - Option B: Push Docker image to Amazon ECR, then deploy image on App Runner." -ForegroundColor Gray
Write-Host "   - Attach the AppRunnerInstanceRole from stack outputs to enable DynamoDB & Bedrock access." -ForegroundColor Gray
Write-Host "2. Frontend Dashboard (AWS Amplify):" -ForegroundColor White
Write-Host "   - Connect your GitHub repo to AWS Amplify Hosting." -ForegroundColor Gray
Write-Host "   - Amplify automatically detects amplify.yml in the repo root." -ForegroundColor Gray
Write-Host "   - Set environment variable: VITE_API_BASE_URL=<Your-App-Runner-URL>" -ForegroundColor Gray

Write-Host "`n🎉 AtmosAI Cloud Infrastructure is ready!" -ForegroundColor Green
