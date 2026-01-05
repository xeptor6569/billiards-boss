## Debugging GitHub Actions Workflow Failures

## Step 1: View Detailed Logs in GitHub

1. Go to your GitHub repository
2. Click on the **Actions** tab
3. Click on the failed workflow run (e.g., "Deploy to Dev Environment")
4. Click on the failed job (e.g., "Deploy to Dev Environment")
5. Expand each step to see detailed logs

**Look for:**
- Red error messages
- Which step failed (Checkout, Generate build info, Deploy to server)
- Specific error text (copy it for reference)

## Step 2: Common Failure Points

### Failure: "fatal: detected dubious ownership in repository"

**Error:** `fatal: detected dubious ownership in repository at '/opt/billiards-boss-dev'`

**Cause:** Git security feature (2.35.2+) blocks accessing repos owned by different users.

**Quick Fix (in workflow):** The workflows now automatically fix this, but you can also fix it permanently:

**Permanent Fix on Server:**
```bash
# As the runner user, add safe directory
git config --global --add safe.directory /opt/billiards-boss-dev
git config --global --add safe.directory /opt/billiards-boss-prod

# Or fix ownership (better long-term solution):
sudo chown -R $USER:$USER /opt/billiards-boss-dev
sudo chown -R $USER:$USER /opt/billiards-boss-prod

# Verify ownership
ls -la /opt/billiards-boss-dev
ls -la /opt/billiards-boss-prod
```

**Note:** The workflows now automatically add safe.directory, so this should work immediately.

### Failure: "Checkout code" step

**Possible causes:**
- Runner doesn't have git installed
- Network issues connecting to GitHub

**Fix:**
```bash
# On your server, check git is installed
git --version

# If not installed:
sudo apt update
sudo apt install git -y
```

### Failure: "Generate build info" step

**Possible causes:**
- Node.js not installed
- package.json not found
- Git repository issues

**Fix:**
```bash
# Check Node.js is installed
node --version
npm --version

# If not installed (on Ubuntu/Debian):
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Or use nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
```

### Failure: "Deploy to server" step

This is the most common failure point. Check each sub-step:

#### A. Directory doesn't exist

**Error:** `cd: /opt/billiards-boss-dev: No such file or directory`

**Fix:**
```bash
# Create the directory
sudo mkdir -p /opt/billiards-boss-dev
sudo chown $USER:$USER /opt/billiards-boss-dev

# Clone the repository
cd /opt/billiards-boss-dev
git clone <your-repo-url> .
git checkout dev
```

#### B. Secret not set

**Error:** `cd: "$DEPLOY_PATH": No such file or directory` or empty path

**Fix:**
1. Go to GitHub → Settings → Secrets and variables → Actions
2. Verify `DEV_DEPLOY_PATH` is set (e.g., `/opt/billiards-boss-dev`)
3. Make sure there are no extra spaces or quotes

#### C. Git repository not initialized

**Error:** `fatal: not a git repository`

**Fix:**
```bash
cd /opt/billiards-boss-dev
# If directory is empty:
git clone <your-repo-url> .
git checkout dev

# If directory exists but isn't a git repo:
git init
git remote add origin <your-repo-url>
git fetch origin
git checkout -b dev origin/dev
```

#### D. Docker permission denied

**Error:** `permission denied while trying to connect to the Docker daemon socket`

**Fix:**
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in, or:
newgrp docker

# Verify it works:
docker ps
```

#### E. Docker Compose not found

**Error:** `docker: 'compose' is not a docker command`

**Fix:**
```bash
# Check if docker compose plugin is installed
docker compose version

# If not, install Docker Compose V2 (usually comes with Docker Desktop or newer Docker)
# Or use docker-compose (legacy):
sudo apt install docker-compose -y
```

#### F. .env file missing

**Error:** Docker build fails or app can't start

**Fix:**
```bash
cd /opt/billiards-boss-dev
# Create .env file (see deploy.md for required variables)
nano .env
```

## Step 3: Check Runner Logs

On your server, check the runner logs:

```bash
# View runner logs
tail -f ~/actions-runner/_diag/Runner_*.log

# Or check the latest log file
ls -lt ~/actions-runner/_diag/ | head -5
tail -100 ~/actions-runner/_diag/Runner_*.log
```

## Step 4: Test Manually on Server

Run the deployment steps manually to see where it fails:

```bash
# Set environment variables (replace with actual values)
export DEV_DEPLOY_PATH="/opt/billiards-boss-dev"
export BUILD_NUMBER="50"
export COMMIT_HASH="abc123"

# Navigate to deployment directory
cd "$DEV_DEPLOY_PATH"

# Test each step:
echo "Testing git pull..."
git fetch origin
git checkout dev
git pull origin dev

echo "Testing docker compose..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

echo "Testing build..."
BUILD_NUMBER="$BUILD_NUMBER" COMMIT_HASH="$COMMIT_HASH" \
  docker compose -f docker-compose.yml -f docker-compose.prod.yml build

echo "Testing start..."
BUILD_NUMBER="$BUILD_NUMBER" COMMIT_HASH="$COMMIT_HASH" \
  docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Step 5: Check Runner Status

```bash
# Check if runner is running
cd ~/actions-runner
sudo ./svc.sh status

# If not running, start it:
sudo ./svc.sh start

# Check runner is connected to GitHub:
# Go to GitHub → Settings → Actions → Runners
# Should show "Idle" or "Active"
```

## Step 6: Verify Prerequisites

Run this checklist on your server:

```bash
# 1. Git installed
git --version || echo "❌ Git not installed"

# 2. Node.js installed
node --version || echo "❌ Node.js not installed"
npm --version || echo "❌ npm not installed"

# 3. Docker installed
docker --version || echo "❌ Docker not installed"

# 4. Docker Compose available
docker compose version || docker-compose --version || echo "❌ Docker Compose not installed"

# 5. User in docker group
groups | grep docker || echo "❌ User not in docker group"

# 6. Deployment directory exists
[ -d "/opt/billiards-boss-dev" ] && echo "✅ Dev directory exists" || echo "❌ Dev directory missing"
[ -d "/opt/billiards-boss-prod" ] && echo "✅ Prod directory exists" || echo "❌ Prod directory missing"

# 7. Deployment directory is a git repo
[ -d "/opt/billiards-boss-dev/.git" ] && echo "✅ Dev is a git repo" || echo "❌ Dev is not a git repo"
[ -d "/opt/billiards-boss-prod/.git" ] && echo "✅ Prod is a git repo" || echo "❌ Prod is not a git repo"

# 8. .env files exist
[ -f "/opt/billiards-boss-dev/.env" ] && echo "✅ Dev .env exists" || echo "❌ Dev .env missing"
[ -f "/opt/billiards-boss-prod/.env" ] && echo "✅ Prod .env exists" || echo "❌ Prod .env missing"
```

## Quick Fixes for Common Issues

### Issue: "set -e" causes early exit

The workflow uses `set -e` which exits on any error. If a step is failing but you want to continue, check the logs to see which command failed.

### Issue: Path with spaces

If your deployment path has spaces, make sure the secret is set correctly and the workflow uses quotes: `cd "$DEPLOY_PATH"`

### Issue: Runner can't access directory

```bash
# Check permissions
ls -la /opt/billiards-boss-dev

# Fix ownership (replace USER with your runner user)
sudo chown -R USER:USER /opt/billiards-boss-dev
```

### Issue: Docker build fails

```bash
# Check Docker build logs
cd /opt/billiards-boss-dev
docker compose build --no-cache 2>&1 | tee build.log

# Look for specific errors in build.log
```

## Getting Help

When asking for help, provide:

1. **The exact error message** from GitHub Actions logs
2. **Which step failed** (Checkout, Generate build info, Deploy)
3. **Output of the checklist** (Step 6)
4. **Runner logs** (last 50 lines)
5. **Manual test results** (Step 4)

## Next Steps After Fixing

Once you've identified and fixed the issue:

1. Re-run the workflow from GitHub Actions UI
2. Or push a new commit to trigger it
3. Monitor the logs to ensure it completes successfully

