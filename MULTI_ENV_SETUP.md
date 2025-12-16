# Running Dev and Prod on the Same Machine

This guide explains how to run both dev and production environments on the same server without conflicts.

## Overview

Both environments are isolated using:
- **Different container names** (prevents name conflicts)
- **Different ports** (dev: 3001, prod: 3000)
- **Different database ports** (dev: 5433, prod: 5434)
- **Separate volumes** (isolated data)
- **Separate networks** (isolated networking)

## Container Names

### Dev Environment
- App: `billiards-boss-app-dev`
- Database: `billiards-boss-db-dev`

### Production Environment
- App: `billiards-boss-app-prod`
- Database: `billiards-boss-db-prod`

## Ports

### Dev Environment
- **App**: `3001` (host) → `3000` (container)
- **Database**: `5433` (host) → `5432` (container)

### Production Environment
- **App**: `3000` (host) → `3000` (container)
- **Database**: `5434` (host) → `5432` (container)

## Volumes

### Dev Environment
- `postgres_data_dev` - Dev database data

### Production Environment
- `postgres_data_prod` - Production database data

## Networks

### Dev Environment
- `billiards-network-dev` - Isolated network for dev containers

### Production Environment
- `billiards-network-prod` - Isolated network for prod containers

## Docker Compose Files

- **Base**: `docker-compose.yml` - Common configuration
- **Dev**: `docker-compose.dev.yml` - Dev-specific overrides
- **Prod**: `docker-compose.prod.yml` - Production-specific overrides

## Usage

### Dev Environment

```bash
cd /opt/billiards-boss-dev
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### Production Environment

```bash
cd /opt/billiards-boss-prod
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Nginx Configuration

If using Nginx as a reverse proxy, configure separate upstreams:

### Dev (dev.billiardsboss.com)
```nginx
upstream dev_app {
    server 127.0.0.1:3001;
}
```

### Production (billiardsboss.com)
```nginx
upstream prod_app {
    server 127.0.0.1:3000;
}
```

## Environment Variables

Each environment should have its own `.env` file:

### Dev: `/opt/billiards-boss-dev/.env`
```env
POSTGRES_PORT=5433
APP_PORT=3001
NEXTAUTH_URL=https://dev.billiardsboss.com
NEXT_PUBLIC_APP_URL=https://dev.billiardsboss.com
NEXT_PUBLIC_WS_URL=https://dev.billiardsboss.com
```

### Production: `/opt/billiards-boss-prod/.env`
```env
POSTGRES_PORT=5434
APP_PORT=3000
NEXTAUTH_URL=https://billiardsboss.com
NEXT_PUBLIC_APP_URL=https://billiardsboss.com
NEXT_PUBLIC_WS_URL=https://billiardsboss.com
```

## Checking Running Containers

```bash
# List all containers
docker ps

# Check dev containers
docker ps --filter "name=billiards-boss-dev"

# Check prod containers
docker ps --filter "name=billiards-boss-prod"

# Check specific container
docker ps --filter "name=billiards-boss-app-dev"
docker ps --filter "name=billiards-boss-app-prod"
```

## Viewing Logs

```bash
# Dev logs
cd /opt/billiards-boss-dev
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

# Prod logs
cd /opt/billiards-boss-prod
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f
```

## Stopping Environments

```bash
# Stop dev
cd /opt/billiards-boss-dev
docker compose -f docker-compose.yml -f docker-compose.dev.yml down

# Stop prod
cd /opt/billiards-boss-prod
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
```

## Troubleshooting

### Port Already in Use

If you see port conflicts:

```bash
# Check what's using the port
sudo lsof -i :3000
sudo lsof -i :3001
sudo lsof -i :5433
sudo lsof -i :5434

# Stop the conflicting container
docker stop <container-name>
```

### Container Name Conflicts

If you see "container name already in use":

```bash
# List containers (including stopped)
docker ps -a

# Remove old container
docker rm <container-name>

# Or force remove
docker rm -f <container-name>
```

### Volume Conflicts

If volumes conflict, they're already isolated by name:
- Dev uses: `postgres_data_dev`
- Prod uses: `postgres_data_prod`

These won't conflict.

## Migration from Single Environment

If you previously ran only one environment and need to migrate:

1. **Stop existing containers:**
   ```bash
   docker compose down
   ```

2. **Rename existing containers** (if needed):
   ```bash
   # Check current container names
   docker ps -a
   
   # Rename if needed (example)
   docker rename billiards-boss-app billiards-boss-app-prod
   docker rename billiards-boss-db billiards-boss-db-prod
   ```

3. **Update workflows** - They now use the correct compose files automatically

4. **Deploy** - The workflows will handle everything

## Benefits of This Setup

✅ **Isolation**: Dev and prod are completely isolated  
✅ **No Conflicts**: Different names, ports, volumes, networks  
✅ **Easy Management**: Clear separation makes management easier  
✅ **Safe Testing**: Test in dev without affecting prod  
✅ **Independent Scaling**: Scale each environment independently  

