# GitHub Actions Workflows

This directory contains automated deployment workflows for Billiards Boss using self-hosted runners.

## Workflows

### `deploy-dev.yml`
- **Trigger**: Push to `dev` branch or manual dispatch
- **Deploys to**: `dev.billiardsboss.com`
- **Purpose**: Staging environment for testing before production
- **Runner**: `self-hosted` (runs on your Proxmox VM)

### `deploy-prod.yml`
- **Trigger**: Push to `main` branch or manual dispatch
- **Deploys to**: `billiardsboss.com`
- **Purpose**: Production environment
- **Runner**: `self-hosted` (runs on your Proxmox VM)

## Required GitHub Secrets

Only deployment paths are needed (no SSH keys required!):

- `DEV_DEPLOY_PATH` - Deployment directory path (e.g., `/opt/billiards-boss-dev`)
- `PROD_DEPLOY_PATH` - Deployment directory path (e.g., `/opt/billiards-boss-prod`)

## Setup Instructions

See `CI_CD_SETUP.md` in the root directory for complete setup instructions, including:
- Setting up self-hosted runners
- Configuring deployment directories
- Testing workflows

## Workflow Steps

Each workflow (runs directly on your server):
1. Checks out the code
2. Generates build info (build number, commit hash)
3. Navigates to deployment directory
4. Deploys:
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

## Self-Hosted Runner

These workflows use self-hosted runners, which are perfect for:
- Home network deployments (Proxmox VMs)
- No need to expose SSH ports
- Free (doesn't use GitHub Actions minutes)
- Faster deployments

