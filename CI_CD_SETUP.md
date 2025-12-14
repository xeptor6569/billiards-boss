# CI/CD Setup Guide

This guide explains how to set up automated deployments for Billiards Boss using GitHub Actions with self-hosted runners.

## Overview

The project uses two deployment environments:

- **Dev/Staging**: `dev.billiardsboss.com` - Deploys from `dev` branch
- **Production**: `billiardsboss.com` - Deploys from `main` branch

## Workflow Files

- `.github/workflows/deploy-dev.yml` - Deploys dev branch to staging
- `.github/workflows/deploy-prod.yml` - Deploys main branch to production

## Why Self-Hosted Runners?

If your deployment server is on a home network (like a Proxmox VM), it's not directly accessible from the internet. Self-hosted runners solve this by:

- ✅ Running directly on your server (no SSH needed)
- ✅ No need to expose ports or configure SSH keys
- ✅ Free (doesn't use GitHub Actions minutes)
- ✅ Faster deployments (no network overhead)
- ✅ More secure (runner connects to GitHub, not the other way around)

## Prerequisites

1. **GitHub Repository** with the code
2. **Deployment Server** (your Proxmox VM) with:
   - Docker and Docker Compose installed
   - Git installed
   - Node.js installed (for build info generation)
   - User with Docker permissions
   - Network access to GitHub (for runner to connect)

## Step 1: Prepare Deployment Server

### On your deployment server (Proxmox VM):

1. **Create deployment directories** (one for dev, one for prod):

```bash
# Dev environment
sudo mkdir -p /opt/billiards-boss-dev
cd /opt/billiards-boss-dev
git clone <your-repo-url> .
git checkout dev

# Production environment
sudo mkdir -p /opt/billiards-boss-prod
cd /opt/billiards-boss-prod
git clone <your-repo-url> .
git checkout main
```

2. **Create environment files**:

```bash
# Dev environment
cd /opt/billiards-boss-dev
nano .env
# Add your dev environment variables (see DEPLOY.md for reference)

# Production environment
cd /opt/billiards-boss-prod
nano .env
# Add your production environment variables
```

3. **Ensure user has Docker permissions**:

```bash
# Add your user to docker group (if not already)
sudo usermod -aG docker $USER

# Log out and back in for changes to take effect
# Or use: newgrp docker
```

## Step 2: Set Up GitHub Self-Hosted Runner

### On your deployment server:

1. **Create a directory for the runner**:

```bash
# Create directory for runner
mkdir -p ~/actions-runner
cd ~/actions-runner
```

2. **Download the runner**:

```bash
# For Linux x64 (most common)
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz

# Extract
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz
```

**Note**: Check [GitHub Actions Runner releases](https://github.com/actions/runner/releases) for the latest version.

3. **Get runner registration token from GitHub**:

   - Go to your GitHub repository
   - Settings → Actions → Runners
   - Click "New self-hosted runner"
   - Select Linux and x64
   - Copy the registration token (looks like `AXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)

4. **Configure and start the runner**:

```bash
# Configure the runner (replace TOKEN with your token from GitHub)
./config.sh --url https://github.com/YOUR_USERNAME/YOUR_REPO --token YOUR_TOKEN

# When prompted:
# - Runner name: billiards-boss-runner (or any name you like)
# - Labels: Leave default or add custom labels like "self-hosted,linux"
# - Work folder: Leave default (~/actions-runner/_work)

# Start the runner
./run.sh
```

5. **Set up runner as a service** (recommended for auto-start):

```bash
# Install as a service
sudo ./svc.sh install

# Start the service
sudo ./svc.sh start

# Check status
sudo ./svc.sh status
```

The runner will now automatically start on boot and connect to GitHub.

### Optional: Separate Runners for Dev and Production

If you want to use separate runners for dev and production (for better isolation):

1. **Set up a second runner** (repeat Step 2 in a different directory):
   ```bash
   mkdir -p ~/actions-runner-prod
   cd ~/actions-runner-prod
   # Download and configure as above, but use different name/labels
   ```

2. **Update workflows** to use specific labels:
   - In `deploy-dev.yml`: Change `runs-on: self-hosted` to `runs-on: [self-hosted, dev]`
   - In `deploy-prod.yml`: Change `runs-on: self-hosted` to `runs-on: [self-hosted, production]`

3. **Configure runners with labels**:
   ```bash
   # When configuring, add labels:
   ./config.sh --url https://github.com/YOUR_USERNAME/YOUR_REPO --token TOKEN --labels dev,linux
   # or
   ./config.sh --url https://github.com/YOUR_USERNAME/YOUR_REPO --token TOKEN --labels production,linux
   ```

### Updating the Runner

Periodically update your runner to the latest version:

```bash
cd ~/actions-runner

# Stop the service
sudo ./svc.sh stop

# Download latest version (check GitHub for latest)
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz

# Extract (this will update the files)
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz

# Restart service
sudo ./svc.sh start
```

## Step 3: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

### Required Secrets:

You only need deployment paths (no SSH keys needed!):

- `DEV_DEPLOY_PATH` - Path to dev deployment directory (e.g., `/opt/billiards-boss-dev`)
- `PROD_DEPLOY_PATH` - Path to production deployment directory (e.g., `/opt/billiards-boss-prod`)

That's it! No SSH keys, no hostnames, no usernames needed.

## Step 4: Test the Workflows

### Test Dev Deployment:

1. Make a change to the `dev` branch
2. Push to GitHub:
   ```bash
   git checkout dev
   git add .
   git commit -m "Test dev deployment"
   git push origin dev
   ```
3. Go to GitHub → Actions tab
4. Watch the "Deploy to Dev" workflow run
5. Check that `https://dev.billiardsboss.com` is updated

### Test Production Deployment:

1. Merge dev to main:
   ```bash
   git checkout main
   git merge dev
   git push origin main
   ```
2. Go to GitHub → Actions tab
3. Watch the "Deploy to Production" workflow run
4. Check that `https://billiardsboss.com` is updated

## Step 5: Manual Deployment Trigger

You can also trigger deployments manually:

1. Go to GitHub → Actions
2. Select the workflow (Deploy to Dev or Deploy to Production)
3. Click "Run workflow"
4. Select the branch and click "Run workflow"

## How It Works

### Dev Workflow (`deploy-dev.yml`):

1. **Triggers**: 
   - Automatically on push to `dev` branch
   - Manually via workflow_dispatch

2. **Steps** (runs directly on your server via self-hosted runner):
   - Checks out code
   - Generates build info (build number, commit hash)
   - Navigates to deployment directory
   - Pulls latest `dev` branch
   - Builds Docker containers with build info
   - Runs database migrations
   - Seeds database
   - Checks application health

### Production Workflow (`deploy-prod.yml`):

1. **Triggers**: 
   - Automatically on push to `main` branch
   - Manually via workflow_dispatch

2. **Steps**:
   - Same as dev workflow, but deploys to production environment

## Build Info

The workflows automatically generate build information:

- **Build Number**: Git commit count (incremental)
- **Commit Hash**: Short git commit hash
- **Version**: From `package.json`
- **Build Date**: Current timestamp

This information is passed to Docker as build arguments and displayed in the BuildInfo widget.

## Troubleshooting

### Runner Not Connecting

```bash
# Check runner status
cd ~/actions-runner
./run.sh  # If not running as service

# Or check service status
sudo ./svc.sh status

# View runner logs
tail -f ~/actions-runner/_diag/Runner_*.log
```

### Runner Not Picking Up Jobs

1. **Check runner is online**:
   - Go to GitHub → Settings → Actions → Runners
   - Verify runner shows as "Idle" or "Active"

2. **Check runner labels**:
   - Ensure workflow uses `runs-on: self-hosted`
   - If using custom labels, ensure they match

3. **Restart runner**:
   ```bash
   cd ~/actions-runner
   sudo ./svc.sh stop
   sudo ./svc.sh start
   ```

### Docker Permission Issues

```bash
# Ensure user is in docker group
sudo usermod -aG docker $USER
# Log out and back in for changes to take effect
```

### Build Info Not Showing

- Check that `BUILD_NUMBER` and `COMMIT_HASH` are being passed correctly
- Verify the `generate-build-id.mjs` script is running in the workflow
- Check Docker build logs for build argument errors

### Deployment Fails

1. **Check GitHub Actions logs** for specific error messages
2. **On your server**, check:
   ```bash
   cd /opt/billiards-boss-dev  # or prod
   docker compose logs -f
   docker compose ps
   ```
3. **Verify environment variables** are set correctly in `.env` file
4. **Check disk space**: `df -h`
5. **Check Docker**: `docker ps`, `docker system df`
6. **Check runner logs**: `tail -f ~/actions-runner/_diag/Runner_*.log`

### Health Check Fails

```bash
# Test health endpoint manually
curl http://localhost:3000/api/health

# Check if app is running
docker compose ps app

# Check app logs
docker compose logs app
```

## Security Best Practices

1. **Run runner as dedicated user** with minimal permissions (not root)
2. **Use separate deployment directories** for dev and production
3. **Never commit** `.env` files or secrets
4. **Use strong passwords** for database and NextAuth secrets
5. **Enable GitHub branch protection** for main branch
6. **Require pull request reviews** before merging to production
7. **Keep runner updated** - check for updates periodically
8. **Monitor runner logs** for suspicious activity
9. **Use firewall rules** to restrict network access if possible
10. **Regularly rotate** GitHub runner tokens (re-register runner)

## Branch Protection (Recommended)

Set up branch protection rules in GitHub:

1. Go to Settings → Branches
2. Add rule for `main`:
   - Require pull request reviews
   - Require status checks to pass
   - Require branches to be up to date
   - Include administrators

## Monitoring Deployments

- **GitHub Actions**: View deployment history and logs
- **Build Info Widget**: Shows current build number and commit on the app
- **Health Endpoint**: `https://dev.billiardsboss.com/api/health` or `https://billiardsboss.com/api/health`

## Rollback Procedure

If a deployment fails or causes issues:

```bash
# On your server, navigate to deployment directory
cd /opt/billiards-boss-prod  # or dev

# Checkout previous commit
git log --oneline -10  # Find the commit hash
git checkout <previous-commit-hash>

# Rebuild and restart
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
docker compose exec app npm run db:migrate
```

## Environment-Specific Configuration

### Dev Environment (dev.billiardsboss.com)

- Uses `dev` branch
- May have different database
- Can have relaxed security for testing
- Environment variables in `/opt/billiards-boss-dev/.env`

### Production Environment (billiardsboss.com)

- Uses `main` branch
- Production database
- Full security enabled
- Environment variables in `/opt/billiards-boss-prod/.env`

## Next Steps

1. Set up branch protection rules
2. Configure monitoring/alerting (optional)
3. Set up database backups (see DEPLOY.md)
4. Configure SSL certificates (if not already done)
5. Set up log aggregation (optional)

## Support

For issues or questions:
- Check GitHub Actions logs
- Review server logs: `docker compose logs -f`
- Check application health endpoint
- Review this documentation

