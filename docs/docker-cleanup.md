## Docker and Runner Disk Space Management

This guide helps you manage disk space on your self-hosted GitHub Actions runner to prevent "No space left on device" errors.

## Quick Fix: Immediate Cleanup

Run these commands on your runner server to free up space immediately:

```bash
# Check current disk usage
df -h /

# Check Docker disk usage
docker system df

# Aggressive Docker cleanup (removes everything not in use)
docker system prune -a -f --volumes

# Clean up runner workspace (keep last 3 runs)
cd ~/actions-runner/_work
ls -t | tail -n +4 | xargs -r rm -rf

# Clean up old diagnostic logs (keep last 7 days)
find ~/actions-runner/_diag -name "*.log" -type f -mtime +7 -delete
```

## Automated Cleanup

### Option 1: GitHub Actions Workflow (Recommended)

A workflow is set up at `.github/workflows/cleanup-runner.yml` that runs daily to:
- Clean up Docker resources (containers, images, volumes, build cache)
- Clean up old runner workspace directories
- Clean up old diagnostic logs
- Alert if disk usage exceeds 85%

The workflow runs automatically daily at 2 AM UTC, or you can trigger it manually from the GitHub Actions UI.

### Option 2: Cron Job on Server

You can also set up a cron job on your server to run cleanup:

```bash
# Edit crontab
crontab -e

# Add this line to run cleanup daily at 2 AM
0 2 * * * /path/to/scripts/cleanup-runner.sh
```

Make the script executable:
```bash
chmod +x scripts/cleanup-runner.sh
```

## What Gets Cleaned Up

### Docker Resources

1. **Stopped containers** - Containers that have exited
2. **Unused images** - Docker images not used by any container (keeps last 24 hours)
3. **Unused volumes** - Volumes not attached to any container
4. **Build cache** - Docker build cache layers (can be very large)

### GitHub Actions Runner

1. **Old workspace directories** - Keeps last 3 runs, removes older ones
2. **Old diagnostic logs** - Logs older than 7 days

## Disk Space Breakdown

A typical deployment can use:
- **Docker images**: 500MB - 2GB per image
- **Build cache**: 1GB - 5GB (can grow large)
- **Node modules**: 200MB - 500MB per build
- **Next.js .next directory**: 100MB - 300MB per build
- **Runner workspace**: 500MB - 2GB per workflow run

## Monitoring Disk Usage

### Check Overall Disk Usage

```bash
df -h /
```

### Check Docker Disk Usage

```bash
docker system df
```

This shows:
- Images size
- Containers size
- Local volumes size
- Build cache size

### Find Large Files/Directories

```bash
# Find largest directories
du -h --max-depth=1 / | sort -hr | head -10

# Find largest files
find / -type f -size +100M -exec ls -lh {} \; 2>/dev/null | awk '{print $5, $9}' | sort -hr | head -10
```

## Preventing Disk Bloat

### 1. Use Multi-Stage Docker Builds

The Dockerfile already uses multi-stage builds, which helps reduce image size.

### 2. Clean Up After Each Deployment

Add cleanup steps to your deployment workflows:

```yaml
- name: Clean up after deployment
  if: always()
  run: |
    # Remove old build cache
    docker builder prune -f --filter "until=24h"
    
    # Remove unused images
    docker image prune -f --filter "until=24h"
```

### 3. Limit Workspace Retention

The cleanup workflow keeps only the last 3 workspace directories. You can adjust this in the workflow file.

### 4. Use .dockerignore

Ensure `.dockerignore` is properly configured to exclude unnecessary files from Docker builds.

## Expanding Disk Space

If cleanup isn't enough and you need more space:

### Proxmox VM Disk Expansion

1. **Shutdown the VM** (or take a snapshot first)
2. **In Proxmox Web UI**:
   - Go to VM → Hardware → Hard Disk
   - Click "Resize"
   - Increase the disk size (e.g., from 32GB to 64GB)
3. **Resize the partition** (SSH into VM):
   ```bash
   # Check current partition
   lsblk
   
   # Resize partition (adjust /dev/sda1 to your partition)
   sudo growpart /dev/sda 1
   
   # Resize filesystem
   sudo resize2fs /dev/sda1  # For ext4
   # OR
   sudo xfs_growfs /  # For xfs
   ```

### Alternative: Add a Second Disk

If you can't expand the primary disk:
1. Add a new disk in Proxmox
2. Mount it to `/mnt/storage` or similar
3. Move Docker data directory:
   ```bash
   # Stop Docker
   sudo systemctl stop docker
   
   # Move Docker data
   sudo mv /var/lib/docker /mnt/storage/
   
   # Create symlink
   sudo ln -s /mnt/storage/docker /var/lib/docker
   
   # Start Docker
   sudo systemctl start docker
   ```

## Emergency Cleanup (When Disk is Full)

If you're completely out of space and can't run commands:

1. **Free up space immediately**:
   ```bash
   # Remove all stopped containers
   docker container prune -f
   
   # Remove all unused images (aggressive)
   docker image prune -a -f
   
   # Remove all unused volumes (be careful!)
   docker volume prune -f
   
   # Remove all build cache
   docker builder prune -a -f
   ```

2. **Clean up runner logs**:
   ```bash
   # Remove all old logs
   rm -rf ~/actions-runner/_diag/*.log
   
   # Remove old workspace directories
   rm -rf ~/actions-runner/_work/*
   ```

3. **Clean up system logs** (if needed):
   ```bash
   sudo journalctl --vacuum-time=3d
   sudo apt-get clean
   sudo apt-get autoremove -y
   ```

## Best Practices

1. **Run cleanup regularly** - Use the automated workflow or cron job
2. **Monitor disk usage** - Check `df -h /` regularly
3. **Set up alerts** - The cleanup workflow alerts at 85% usage
4. **Keep Docker updated** - Newer versions have better cleanup tools
5. **Use specific image tags** - Avoid `latest` tag to prevent image accumulation

## Troubleshooting

### "No space left on device" but df shows space

This can happen when inodes are exhausted:

```bash
# Check inode usage
df -i /

# If inodes are full, clean up small files
find / -type f -size 0 -delete 2>/dev/null
```

### Docker won't start after cleanup

If Docker fails to start:
```bash
# Check Docker status
sudo systemctl status docker

# Check Docker logs
sudo journalctl -u docker

# Restart Docker
sudo systemctl restart docker
```

### Workflow fails with disk space error

1. Manually trigger the cleanup workflow
2. Or SSH into server and run cleanup commands
3. Then retry the failed workflow

## Disk Space Requirements

**Minimum recommended:**
- 32GB for basic operation
- 64GB for comfortable operation with history
- 128GB+ for production with long retention

**Current setup:** 32GB (may need expansion if running multiple environments)

## Additional Resources

- [Docker System Prune Documentation](https://docs.docker.com/engine/reference/commandline/system_prune/)
- [GitHub Actions Runner Cleanup](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/removing-self-hosted-runners#cleaning-up-after-a-runner-is-removed)
- [Proxmox Disk Management](https://pve.proxmox.com/wiki/Resize_disks)

