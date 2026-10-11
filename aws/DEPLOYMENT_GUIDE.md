# 🚀 AtmosAI — AWS Production Deployment Guide

This guide walks you through deploying **AtmosAI** to **Amazon Web Services (AWS)** using the official architecture designed for the AWS Environmental Hacks 2026.

---

## 🏗️ Architecture Overview

| Component | AWS Service | Purpose |
| :--- | :--- | :--- |
| **Frontend** | **AWS Amplify Hosting** | Hosts the React 19 + Vite dashboard with automatic HTTPS, global CDN, and PWA capabilities. |
| **Backend API** | **AWS App Runner** | Fully managed serverless container service running FastAPI + LightGBM ML model with auto-scaling. |
| **Database** | **Amazon DynamoDB** | Serverless storage for sensor telemetry (`AtmosAI-Telemetry`), forecasts, and alert records. |
| **GenAI Guidance** | **AWS Bedrock** | Anthropic Claude 3.5 Sonnet generates demographic-specific safety mitigation steps. |
| **Telemetry Ingestion**| **AWS IoT Core** | Ingests live MQTT telemetry (`atmosai/telemetry/+`) directly into DynamoDB via IoT Topic Rules. |
| **Surge Alerts** | **Amazon SNS** | Sends urgent push notifications/SMS when severe PM2.5 surges are predicted. |

---

## 📋 Prerequisites & AWS Session Refresh

Before running CLI commands, ensure your AWS CLI is authenticated.

If you encounter:
```text
aws: [ERROR]: Your session has expired. Please reauthenticate using 'aws login'.
```
Run one of the following in PowerShell / Terminal:
```powershell
# If using AWS IAM Identity Center (SSO):
aws login
# or
aws sso login

# If using standard IAM Access Keys:
aws configure
```

Verify your authentication:
```powershell
aws sts get-caller-identity
```

---

## 🛠️ Step 1: Deploy Cloud Infrastructure (DynamoDB, IAM, IoT Core, SNS)

We provide a CloudFormation template ([aws/atmosai-infrastructure.yml](file:///D:/AtmosAI-main/aws/atmosai-infrastructure.yml)) that provisions:
- 3 on-demand DynamoDB tables (`AtmosAI-Telemetry`, `AtmosAI-Forecasts`, `AtmosAI-Alerts`)
- IAM Execution Role for App Runner (with DynamoDB and Bedrock Claude access)
- IoT Core Topic Rule (`atmosai/telemetry/+`)
- SNS Alert Topic (`AtmosAI-Surge-Alerts`)

### Option A: Using the Automated PowerShell Script
```powershell
cd D:\AtmosAI-main\aws
.\deploy.ps1 -Region "ap-south-2" -StackName "AtmosAI-Production"
```
*(Default region is Hyderabad `ap-south-2` or Mumbai `ap-south-1` or `us-east-1`)*.

### Option B: Using the AWS CLI Directly
```powershell
aws cloudformation deploy `
  --template-file "D:\AtmosAI-main\aws\atmosai-infrastructure.yml" `
  --stack-name "AtmosAI-Production" `
  --region "ap-south-2" `
  --capabilities CAPABILITY_NAMED_IAM
```

---

## 🚀 Step 2: Deploy Backend to AWS App Runner

**AWS App Runner** is the recommended service for running the FastAPI container because it handles HTTPS certificates, automatic health checks, and zero-maintenance scaling.

### Recommended Method: Connect GitHub Repository (No Local Docker Required)
1. Push your repository to **GitHub**.
2. Open the [AWS App Runner Console](https://console.aws.amazon.com/apprunner).
3. Click **Create service**.
4. **Source**: Select **Source code repository** -> Choose your GitHub repository (`AtmosAI-main`) and branch (`main`).
5. **Deployment trigger**: Select **Automatic** (deploys on every git push).
6. **Build settings**: Select **Use a configuration file** OR configure manually:
   - **Runtime**: `Dockerfile`
   - **Port**: `8000`
   - **Start command**: *(Leave default, managed by Dockerfile)*
7. **Configure service**:
   - **Service name**: `atmosai-backend`
   - **Virtual CPU & Memory**: `1 vCPU`, `2 GB`
   - **Environment variables**:
     - `ENVIRONMENT` = `production`
     - `AWS_DEFAULT_REGION` = `ap-south-2` (or your chosen region)
     - `USE_DYNAMODB` = `true`
8. **Security**:
   - Under **Instance role**, select the IAM Role created in Step 1:
     `AtmosAI-Backend-ExecutionRole-production`
     *(This grants the backend permission to query DynamoDB and invoke AWS Bedrock).*
9. Click **Create & deploy**.
10. Once deployment completes (~3-5 minutes), copy your **Default domain** URL (e.g., `https://xxxxxx.ap-south-2.awsapprunner.com`).
11. Test the backend health endpoint:
    ```
    https://xxxxxx.ap-south-2.awsapprunner.com/health
    ```

---

## 🌐 Step 3: Deploy Frontend to AWS Amplify Hosting

**AWS Amplify** automatically detects Vite and provides zero-config SSL hosting for your React PWA dashboard.

1. Open the [AWS Amplify Console](https://console.aws.amazon.com/amplify).
2. Click **Host web app** -> Choose **GitHub**.
3. Select your repository (`AtmosAI-main`) and branch (`main`).
4. **Build settings**:
   Amplify will automatically detect the [amplify.yml](file:///D:/AtmosAI-main/amplify.yml) file included at the repository root:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - cd frontend
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: frontend/dist
       files:
         - '**/*'
     cache:
       paths:
         - frontend/node_modules/**/*
   ```
5. **Environment variables**:
   Add the following environment variable:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://xxxxxx.ap-south-2.awsapprunner.com` *(The App Runner URL from Step 2)*
6. Click **Save and deploy**.
7. In ~2 minutes, Amplify will provide your live secure HTTPS URL (e.g., `https://main.d1234xxxx.amplifyapp.com`).

---

## 🧠 Step 4: Enable AWS Bedrock Model Access

To enable Anthropic Claude 3.5 Sonnet for demographic risk analysis:
1. Open the [AWS Bedrock Console](https://console.aws.amazon.com/bedrock).
2. Ensure your region is set to `us-east-1` or your supported Bedrock region.
3. In the left navigation, click **Model access**.
4. Click **Modify model access**.
5. Check **Anthropic** -> **Claude 3.5 Sonnet** (and **Claude 3 Sonnet**).
6. Click **Next** and **Submit**. Approval is immediate.
*(Note: If Bedrock credentials are not active or configured, AtmosAI automatically uses its built-in safety templates, guaranteeing 100% uptime).*

---

## 🧪 Step 5: End-to-End Verification

1. Open your live Amplify URL (`https://main.d1234xxxx.amplifyapp.com`).
2. Test manual station selection: select **Indiranagar** or **Peenya** and confirm forecasts load live.
3. Test GPS Current Location:
   - Click **📍 Select Location** -> Click **📍 Use my current location**.
   - Approve browser location permission.
   - Verify the dashboard displays your hyper-local coordinates and Open-Meteo air quality telemetry.
4. Verify DynamoDB:
   - Open the **DynamoDB Console** -> Explore table items for `AtmosAI-Telemetry` and `AtmosAI-Forecasts`.
