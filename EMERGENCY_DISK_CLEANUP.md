# Emergency Disk Cleanup - I/O Error Fix

If you're seeing I/O errors like:
```
ERROR: rpc error: code = Internal desc = failed to delete metadata of ...: write /var/lib/docker/buildkit/metadata_v2.db: input/output error
```

This indicates **disk corruption or filesystem issues**. Follow these steps immediately.

## Immediate Actions

### Step 1: Check Disk Health

```bash
# Check disk usage
df -h /

# Check for filesystem errors
sudo fsck -n /dev/sda1  # Replace with your actual partition
# DO NOT run fsck without -n unless you're sure the disk is unmounted

# Check disk health (if SMART is available)
sudo smartctl -a /dev/sda  # Replace with your disk
```

### Step 2: Free Up Critical Space

If disk is completely full, free space immediately:

```bash
# Stop Docker to prevent further writes
sudo systemctl stop docker

# Remove largest files first
sudo du -h --max-depth=1 / | sort -hr | head -20

# Clean up system logs
sudo journalctl --vacuum-time=1d
sudo journalctl --vacuum-size=100M

# Remove old packages
sudo apt-get clean
sudo apt-get autoremove -y

# Remove old kernels (if any)
sudo apt-get purge $(dpkg -l linux-{image,headers}-* | awk '/^ii/{print $2}' | grep -E '[0-9]+\.[0-9]+\.[0-9]+' | sort -V | head -n -2)
```

### Step 3: Fix Docker BuildKit Metadata Corruption

The I/O error is likely due to corrupted BuildKit metadata. Fix it:

```bash
# Option 1: Remove BuildKit cache entirely (safest)
sudo systemctl stop docker
sudo rm -rf /var/lib/docker/buildkit
sudo systemctl start docker

# Option 2: If that doesn't work, reset Docker entirely (WARNING: removes all containers/images)
sudo systemctl stop docker
sudo rm -rf /var/lib/docker/*
sudo systemctl start docker
```

**WARNING**: Option 2 will delete ALL Docker containers, images, and volumes. Only use if absolutely necessary.

### Step 4: Restart Docker

```bash
sudo systemctl restart docker
docker system df  # Verify Docker is working
```

## Safer Cleanup Commands

Instead of `docker builder prune` which can trigger I/O errors, use:

```bash
# Clean up containers and images (safer)
docker container prune -f
docker image prune -a -f --filter "until=48h"

# Clean up volumes (be careful - only unused ones)
docker volume prune -f

# Limit build cache size instead of time-based cleanup
docker builder prune -a -f --keep-storage 2GB
```

## If I/O Errors Persist

If I/O errors continue after cleanup:

1. **Check disk health**:
   ```bash
   sudo smartctl -a /dev/sda
   ```

2. **Check filesystem**:
   ```bash
   sudo fsck -f /dev/sda1  # Only if you can unmount or are in recovery mode
   ```

3. **Consider disk replacement** if SMART shows errors

4. **Expand disk** if it's just full (see `docs/docker-cleanup.md`)

## Prevention

1. **Monitor disk usage regularly**:
   ```bash
   # Add to crontab
   0 */6 * * * df -h / | mail -s "Disk Usage" your@email.com
   ```

2. **Use the automated cleanup workflow** (once committed)

3. **Set up disk usage alerts** in your monitoring

4. **Consider expanding disk** to 64GB+ for production use

## Why the Workflow Might Not Be Visible

GitHub Actions workflows only appear in the UI **after they're committed and pushed** to the repository. If you just created the file locally, you need to:

1. Commit the workflow file
2. Push to GitHub
3. Then it will appear in Actions → Workflows

## Quick Recovery Script

Run this on your server to recover from I/O errors:

```bash
#!/bin/bash
set -e

echo "🆘 Emergency disk cleanup..."

# Stop Docker
sudo systemctl stop docker

# Remove corrupted BuildKit cache
echo "Removing corrupted BuildKit cache..."
sudo rm -rf /var/lib/docker/buildkit/*

# Clean system logs
echo "Cleaning system logs..."
sudo journalctl --vacuum-time=1d

# Clean package cache
echo "Cleaning package cache..."
sudo apt-get clean

# Restart Docker
echo "Restarting Docker..."
sudo systemctl start docker

# Verify
echo "Verifying Docker..."
docker system df

echo "✅ Recovery complete"
```

Save as `emergency-cleanup.sh`, make executable, and run:
```bash
chmod +x emergency-cleanup.sh
sudo ./emergency-cleanup.sh
```


