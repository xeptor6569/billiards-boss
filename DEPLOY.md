# Deployment Guide for dev.billiardsboss.com

This guide will help you deploy Billiards Boss to your dev subdomain for testing.

## Prerequisites

- Proxmox VM with Docker and Docker Compose installed
- Cloudflare account with billiardsboss.com domain
- SSH access to your VM
- Port 80/443 open (or use Cloudflare Tunnel for no open ports)

## Step 1: Prepare Your Server

### On your Proxmox VM:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker (if not already installed)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose V2 is included with Docker Desktop and newer Docker installations
# If you need to install it separately (older systems):
# Note: Modern Docker (v20.10+) includes `docker compose` as a plugin
# For older systems, you may need: sudo apt install docker-compose-plugin -y

# Add your user to docker group (optional, to run without sudo)
sudo usermod -aG docker $USER
```

## Step 2: Clone and Prepare the Repository

```bash
# Navigate to your deployment directory
cd /opt  # or wherever you want to deploy

# Clone your repository
git clone <your-repo-url> billiards-boss-dev
cd billiards-boss-dev

# Checkout the branch you want to deploy
git checkout main  # or your dev branch
```

## Step 3: Create Environment File

For development environment (dev.billiardsboss.com), create `.env.development`:

```bash
# Generate a secure NextAuth secret
openssl rand -base64 32

# Copy the example template
cp .env.example.development .env.development
```

Then edit `.env.development` and fill in your values:

```env
# Database
POSTGRES_USER=billiards
POSTGRES_PASSWORD=<generate-strong-password>
POSTGRES_DB=billiards_boss
POSTGRES_PORT=5433  # Dev uses 5433 to avoid conflicts

# NextAuth
NEXTAUTH_URL=https://dev.billiardsboss.com
NEXTAUTH_SECRET=<paste-generated-secret-here>

# Application URLs
NEXT_PUBLIC_APP_URL=https://dev.billiardsboss.com
NEXT_PUBLIC_WS_URL=https://dev.billiardsboss.com

# Docker
APP_PORT=3001  # Dev uses 3001 to avoid conflicts with production
```

**For production (billiardsboss.com)**, use `.env.production`:
```bash
cp .env.example.production .env.production
# Edit .env.production with production values
# Use POSTGRES_PORT=5434 and APP_PORT=3000
```

**Important**: 
- Use strong passwords in production!
- Each environment should have a unique `NEXTAUTH_SECRET`
- See [ENV_SETUP.md](ENV_SETUP.md) for detailed environment configuration

## Step 4: Set Up Cloudflare DNS

1. Log into Cloudflare dashboard
2. Select `billiardsboss.com`
3. Go to DNS → Records
4. Add an A record:
   - **Type**: A
   - **Name**: dev
   - **IPv4 address**: Your VM's public IP
   - **Proxy status**: Proxied (orange cloud) ✅
   - **TTL**: Auto

5. Wait for DNS propagation (usually instant with Cloudflare)

## Step 5: Set Up Reverse Proxy (Nginx)

**Note**: If Nginx is running in a different Docker stack, you'll need to use the VM's LAN IP (10.10.20.44) instead of localhost in the proxy configuration.

Install and configure Nginx to handle SSL and proxy to your app:

```bash
# Install Nginx
sudo apt install nginx certbot python3-certbot-nginx -y

# Create Nginx config
sudo nano /etc/nginx/sites-available/dev.billiardsboss.com
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name dev.billiardsboss.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name dev.billiardsboss.com;

    # SSL certificates (will be set up by certbot)
    ssl_certificate /etc/letsencrypt/live/dev.billiardsboss.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dev.billiardsboss.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Increase body size for API requests
    client_max_body_size 10M;

    # Proxy to Next.js app
    # If Nginx is in a different Docker stack, use the VM's LAN IP instead of localhost
    location / {
        proxy_pass http://10.10.20.44:3000;  # Use VM LAN IP if Nginx is in different stack
        # Alternative: If using Docker networking, use service name: http://billiards-boss-app:3000
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Health check endpoint
    location /api/health {
        proxy_pass http://10.10.20.44:3000/api/health;  # Use VM LAN IP if Nginx is in different stack
        access_log off;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/dev.billiardsboss.com /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

## Step 6: Set Up SSL Certificate

```bash
# Get SSL certificate from Let's Encrypt
sudo certbot --nginx -d dev.billiardsboss.com

# Follow the prompts and enter your email
# Certbot will automatically configure Nginx
```

## Step 7: Build and Start Docker Containers

```bash
# Navigate to project directory
cd /opt/billiards-boss-dev  # or wherever you cloned it

# Build and start services
docker compose up -d --build

# Check logs
docker compose logs -f
```

## Step 8: Run Database Migrations

```bash
# Wait for database to be ready (about 10 seconds)
sleep 10

# Run migrations (creates all required tables)
docker compose exec app npm run db:migrate

# Verify migrations ran successfully
docker compose exec app npm run db:migrate  # Should show "already exists" messages if successful

# Seed default plans (creates Free and Premium plans)
docker compose exec app npm run db:seed
```

**Important**: If migrations fail, you can manually check the database:
```bash
# Connect to database
docker compose exec postgres psql -U billiards -d billiards_boss

# Check if tables exist
\dt

# Should see: users, games, frames, plans, accounts, sessions, verification_tokens, etc.
```

## Step 9: Verify Deployment

1. Visit `https://dev.billiardsboss.com` in your browser
2. Test the scoring interface
3. Create a test account
4. Test on mobile device

## Step 10: Set Up Auto-Restart (Optional but Recommended)

Create a systemd service for automatic restarts:

```bash
sudo nano /etc/systemd/system/billiards-boss-dev.service
```

Add:

```ini
[Unit]
Description=Billiards Boss Dev
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/billiards-boss-dev
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Enable:

```bash
sudo systemctl enable billiards-boss-dev.service
sudo systemctl start billiards-boss-dev.service
```

## Updating the Application

When you want to deploy updates:

```bash
cd /opt/billiards-boss-dev

# Pull latest changes
git pull

# Rebuild and restart
docker compose down
docker compose up -d --build

# Run any new migrations
docker compose exec app npm run db:migrate
```

## Monitoring

### Check Container Status
```bash
docker compose ps
```

### View Logs
```bash
# All services
docker compose logs -f

# Just the app
docker compose logs -f app

# Just the database
docker compose logs -f postgres
```

### Check Application Health
```bash
curl https://dev.billiardsboss.com/api/health
```

## Troubleshooting

### Port Already in Use Error
If you see `address already in use` for port 3000:

```bash
# Option 1: Stop existing containers
docker compose -f docker-compose.yml -f docker-compose.prod.yml down

# Option 2: Find and stop the process using port 3000
lsof -ti:3000 | xargs kill -9

# Option 3: Check what's using the port
lsof -i:3000
netstat -tulpn | grep 3000
```

Then retry the deployment.

### Application Not Loading / 502 Bad Gateway
1. **Check if containers are running**: `docker compose ps`
2. **Check app logs for errors**: `docker compose logs -f app`
   - Look for database connection errors
   - Look for missing environment variables
   - Look for server startup errors
3. **Verify the app is listening on the correct interface**:
   ```bash
   # Inside the container, check if it's listening
   docker compose exec app netstat -tuln | grep 3000
   # Should show: tcp 0 0 0.0.0.0:3000 (not 127.0.0.1:3000)
   ```
4. **Test direct connection** (from host):
   ```bash
   curl http://10.10.20.44:3000/api/health
   # Should return: {"status":"ok","timestamp":"..."}
   ```
5. **Verify Nginx is running**: `sudo systemctl status nginx`
6. **Check Nginx error logs**: `sudo tail -f /var/log/nginx/error.log`
7. **Check firewall**: `sudo ufw status`

### Database Connection Issues
1. Verify database is running: `docker compose ps postgres`
2. Check database logs: `docker compose logs postgres`
3. Test connection: `docker compose exec app node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL)"`

### Nginx in Different Docker Stack

If your Nginx reverse proxy is running in a different Docker stack/container:

1. **Update Nginx config** to use the VM's LAN IP:
   ```nginx
   proxy_pass http://10.10.20.44:3000;  # Instead of localhost:3000
   ```

2. **Update docker-compose.prod.yml** to bind to all interfaces:
   ```yaml
   ports:
     - "0.0.0.0:3000:3000"  # Accessible from LAN IP
   ```

3. **Alternative: Use Docker networking** (better approach):
   - Create an external Docker network: `docker network create nginx-network`
   - Connect both stacks to the same network
   - Use service name in Nginx: `proxy_pass http://billiards-boss-app:3000;`

### PostgreSQL Port Conflicts
If you have another PostgreSQL instance using port 5432:

```bash
# Option 1: Use a different host port (recommended)
# In your .env file, set:
POSTGRES_PORT=5433

# Option 2: Remove port mapping entirely (if you don't need external access)
# Edit docker-compose.yml and comment out or remove the ports section for postgres
# Containers can still communicate via Docker network using service name 'postgres'
```

**Note**: The app container connects to PostgreSQL via the Docker network using the service name `postgres:5432` (internal port), so changing the host port mapping doesn't affect the app's connection. The host port is only needed if you want to access the database from outside Docker (e.g., for backups, migrations from host machine, etc.).

### SSL Certificate Issues
1. Renew certificate: `sudo certbot renew`
2. Check certificate expiry: `sudo certbot certificates`

## Alternative: Cloudflare Tunnel (No Open Ports)

If you prefer not to open ports, use Cloudflare Tunnel:

1. Install cloudflared on your VM
2. Create a tunnel in Cloudflare dashboard
3. Configure tunnel to point to `localhost:3000`
4. No need for Nginx or SSL certificates (Cloudflare handles it)

## Security Notes

- ✅ Use strong passwords for database
- ✅ Keep `NEXTAUTH_SECRET` secure and never commit it
- ✅ Regularly update Docker images
- ✅ Use Cloudflare's security features (WAF, DDoS protection)
- ✅ Consider setting up firewall rules
- ✅ Regularly backup your database

## Backup Database

```bash
# Create backup
docker compose exec postgres pg_dump -U billiards billiards_boss > backup_$(date +%Y%m%d).sql

# Restore backup
docker compose exec -T postgres psql -U billiards billiards_boss < backup_20240101.sql
```

