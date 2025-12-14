# CI/CD Setup Guide

This guide explains how to set up automated deployments for Billiards Boss using GitHub Actions.

## Overview

The project uses two deployment environments:

- **Dev/Staging**: `dev.billiardsboss.com` - Deploys from `dev` branch
- **Production**: `billiardsboss.com` - Deploys from `master`/`main` branch

## Workflow Files

- `.github/workflows/deploy-dev.yml` - Deploys dev branch to staging
- `.github/workflows/deploy-prod.yml` - Deploys master/main branch to production

## Prerequisites

1. **GitHub Repository** with the code
2. **Deployment Server** with:
   - Docker and Docker Compose installed
   - SSH access configured
   - Git repository cloned
   - Environment files (`.env`) configured
3. **SSH Key Pair** for GitHub Actions to access the server

## Step 1: Prepare Deployment Server

### On your deployment server:

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
git checkout master  # or main
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

3. **Create SSH user for deployments** (optional but recommended):

```bash
# Create a dedicated user for CI/CD
sudo adduser github-actions
sudo usermod -aG docker github-actions

# Switch to the new user and set up SSH
sudo su - github-actions
mkdir -p ~/.ssh
chmod 700 ~/.ssh
```

## Step 2: Generate SSH Key for GitHub Actions

### On your deployment server:

```bash
# As the deployment user (github-actions or your user)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy

# Display the public key (you'll need this)
cat ~/.ssh/github_actions_deploy.pub

# Add the public key to authorized_keys
cat ~/.ssh/github_actions_deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Copy the private key:

```bash
# Display the private key (copy this entire output)
cat ~/.ssh/github_actions_deploy
```

**Important**: Keep this private key secure! You'll add it to GitHub Secrets.

## Step 3: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

### For Dev Environment:

Add these secrets:

- `DEV_SSH_HOST` - Your server's IP address or hostname (e.g., `10.10.20.44` or `dev.billiardsboss.com`)
- `DEV_SSH_USER` - SSH username (e.g., `github-actions` or `deploy`)
- `DEV_SSH_PRIVATE_KEY` - The private key content from Step 2 (entire output of `cat ~/.ssh/github_actions_deploy`)
- `DEV_DEPLOY_PATH` - Path to dev deployment directory (e.g., `/opt/billiards-boss-dev`)

### For Production Environment:

Add these secrets:

- `PROD_SSH_HOST` - Your server's IP address or hostname
- `PROD_SSH_USER` - SSH username
- `PROD_SSH_PRIVATE_KEY` - A different private key (or same if using same user)
- `PROD_DEPLOY_PATH` - Path to production deployment directory (e.g., `/opt/billiards-boss-prod`)

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

1. Merge dev to master:
   ```bash
   git checkout master
   git merge dev
   git push origin master
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

2. **Steps**:
   - Checks out code
   - Generates build info (build number, commit hash)
   - Sets up SSH connection
   - Connects to server and:
     - Pulls latest `dev` branch
     - Builds Docker containers with build info
     - Runs database migrations
     - Seeds database
     - Checks application health

### Production Workflow (`deploy-prod.yml`):

1. **Triggers**: 
   - Automatically on push to `master`/`main` branch
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

### SSH Connection Issues

```bash
# Test SSH connection manually
ssh -i ~/.ssh/github_actions_deploy github-actions@your-server-ip

# Check SSH key permissions
chmod 600 ~/.ssh/github_actions_deploy
chmod 644 ~/.ssh/github_actions_deploy.pub
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
2. **SSH into server** and check:
   ```bash
   cd /opt/billiards-boss-dev  # or prod
   docker compose logs -f
   docker compose ps
   ```
3. **Verify environment variables** are set correctly in `.env` file
4. **Check disk space**: `df -h`
5. **Check Docker**: `docker ps`, `docker system df`

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

1. **Use separate SSH keys** for dev and production
2. **Use dedicated deployment user** with minimal permissions
3. **Restrict SSH access** to specific IPs if possible
4. **Never commit** `.env` files or secrets
5. **Rotate SSH keys** periodically
6. **Use strong passwords** for database and NextAuth secrets
7. **Enable GitHub branch protection** for master/main branch
8. **Require pull request reviews** before merging to production

## Branch Protection (Recommended)

Set up branch protection rules in GitHub:

1. Go to Settings → Branches
2. Add rule for `master`/`main`:
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
# SSH into server
ssh user@server

# Navigate to deployment directory
cd /opt/billiards-boss-prod  # or dev

# Checkout previous commit
git log --oneline -10  # Find the commit hash
git checkout <previous-commit-hash>

# Rebuild and restart
docker compose down
docker compose up -d --build
docker compose exec app npm run db:migrate
```

## Environment-Specific Configuration

### Dev Environment (dev.billiardsboss.com)

- Uses `dev` branch
- May have different database
- Can have relaxed security for testing
- Environment variables in `/opt/billiards-boss-dev/.env`

### Production Environment (billiardsboss.com)

- Uses `master`/`main` branch
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

