# GitHub Actions Workflows

This directory contains automated deployment workflows for Billiards Boss.

## Workflows

### `deploy-dev.yml`
- **Trigger**: Push to `dev` branch or manual dispatch
- **Deploys to**: `dev.billiardsboss.com`
- **Purpose**: Staging environment for testing before production

### `deploy-prod.yml`
- **Trigger**: Push to `master`/`main` branch or manual dispatch
- **Deploys to**: `billiardsboss.com`
- **Purpose**: Production environment

## Required GitHub Secrets

### Dev Environment
- `DEV_SSH_HOST` - Server hostname or IP
- `DEV_SSH_USER` - SSH username
- `DEV_SSH_PRIVATE_KEY` - SSH private key
- `DEV_DEPLOY_PATH` - Deployment directory path (e.g., `/opt/billiards-boss-dev`)

### Production Environment
- `PROD_SSH_HOST` - Server hostname or IP
- `PROD_SSH_USER` - SSH username
- `PROD_SSH_PRIVATE_KEY` - SSH private key
- `PROD_DEPLOY_PATH` - Deployment directory path (e.g., `/opt/billiards-boss-prod`)

## Setup Instructions

See `CI_CD_SETUP.md` in the root directory for complete setup instructions.

## Workflow Steps

Each workflow:
1. Checks out the code
2. Generates build info (build number, commit hash)
3. Sets up SSH connection
4. Deploys to server:
   - Pulls latest code
   - Builds Docker containers with build info
   - Runs database migrations
   - Seeds database
   - Checks application health

## Manual Trigger

You can manually trigger deployments from the GitHub Actions UI:
1. Go to Actions tab
2. Select the workflow
3. Click "Run workflow"
4. Select branch and click "Run workflow"

