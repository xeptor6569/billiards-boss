#!/bin/bash

# GitHub Actions Runner Disk Cleanup Script
# Run this periodically to prevent disk space issues

set -e

echo "🧹 Starting GitHub Actions Runner cleanup..."

# 1. Clean up Docker resources
echo "🐳 Cleaning up Docker resources..."

# Remove stopped containers
echo "  Removing stopped containers..."
docker container prune -f

# Remove unused images (keep images from last 24 hours)
echo "  Removing unused Docker images..."
docker image prune -a -f --filter "until=24h"

# Remove unused volumes
echo "  Removing unused volumes..."
docker volume prune -f

# Remove build cache (this can be large)
# Use --keep-storage to limit cache size instead of time-based
# This avoids I/O errors when metadata is corrupted
echo "  Removing Docker build cache (keeping 2GB)..."
docker builder prune -a -f --keep-storage 2GB || {
  echo "  ⚠️  Build cache cleanup failed (may have I/O errors)"
  echo "  💡 If I/O errors persist, try: sudo rm -rf /var/lib/docker/buildkit"
}

# 2. Clean up GitHub Actions runner workspace
echo "📦 Cleaning up GitHub Actions workspace..."

RUNNER_DIR="${HOME}/actions-runner"
if [ -d "$RUNNER_DIR" ]; then
  WORKSPACE_DIR="${RUNNER_DIR}/_work"
  
  if [ -d "$WORKSPACE_DIR" ]; then
    echo "  Cleaning old workspace directories (keeping last 3 runs)..."
    # Keep last 3 workspace directories, remove older ones
    cd "$WORKSPACE_DIR"
    ls -t | tail -n +4 | xargs -r rm -rf
  fi
  
  # Clean up old diagnostic logs (keep last 7 days)
  DIAG_DIR="${RUNNER_DIR}/_diag"
  if [ -d "$DIAG_DIR" ]; then
    echo "  Cleaning old diagnostic logs (keeping last 7 days)..."
    find "$DIAG_DIR" -name "*.log" -type f -mtime +7 -delete
  fi
fi

# 3. Clean up deployment directories (old builds)
echo "🗑️  Cleaning up old deployment builds..."

# Clean .next directories older than 7 days in deployment directories
for DEPLOY_DIR in /opt/billiards-boss-dev /opt/billiards-boss-prod; do
  if [ -d "$DEPLOY_DIR" ]; then
    echo "  Cleaning old builds in $DEPLOY_DIR..."
    if [ -d "$DEPLOY_DIR/.next" ]; then
      # Keep current build, but this is handled by docker compose
      # Just ensure we're not keeping multiple old builds
      find "$DEPLOY_DIR" -name ".next" -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true
    fi
  fi
done

# 4. Show disk usage
echo ""
echo "📊 Current disk usage:"
df -h /

# 5. Show Docker disk usage
echo ""
echo "🐳 Docker disk usage:"
docker system df

echo ""
echo "✅ Cleanup complete!"

