#!/bin/bash

# Quick deployment script for dev.billiardsboss.com
# Usage: ./deploy.sh

set -e

echo "🚀 Deploying Billiards Boss to dev.billiardsboss.com..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your production configuration."
    exit 1
fi

# Load environment variables from .env file
set -a
source .env
set +a

# Set default APP_PORT if not set
APP_PORT=${APP_PORT:-3000}

# Pull latest changes (if using git)
if [ -d .git ]; then
    echo "📥 Pulling latest changes..."
    git pull
fi

# Generate build info before Docker build
echo "📦 Generating build info..."
if [ -d .git ]; then
    BUILD_NUMBER=$(git rev-list --count HEAD 2>/dev/null || echo "0")
    COMMIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "dev")
    echo "   Build number: $BUILD_NUMBER"
    echo "   Commit hash: $COMMIT_HASH"
    
    # Also generate the build-info.ts file directly as a backup
    # This ensures it's available even if Docker build args don't work
    BUILD_NUMBER=$BUILD_NUMBER COMMIT_HASH=$COMMIT_HASH npm run build:info || echo "   ⚠️  Failed to pre-generate build info, will use Docker build args"
else
    BUILD_NUMBER="0"
    COMMIT_HASH="dev"
    echo "   ⚠️  No git repository found, using fallback values"
fi

# Export for Docker build
export BUILD_NUMBER
export COMMIT_HASH

# Stop any existing containers
echo "🛑 Stopping any existing containers..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml down 2>/dev/null || true

# Check if APP_PORT is in use by another process
if lsof -Pi :${APP_PORT} -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port ${APP_PORT} is already in use. Attempting to free it..."
    # Try to find and stop the process
    PID=$(lsof -Pi :${APP_PORT} -sTCP:LISTEN -t 2>/dev/null | head -1)
    if [ -n "$PID" ]; then
        echo "   Found process $PID using port ${APP_PORT}. Stopping it..."
        kill -9 $PID 2>/dev/null || true
        sleep 2
    fi
fi

# Build and start containers (build args are passed via environment variables)
echo "🐳 Building and starting Docker containers..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 15  # Give database more time to be fully ready

# Wait for app container to be healthy
echo "⏳ Waiting for app container to be ready..."
timeout=60
elapsed=0
while [ $elapsed -lt $timeout ]; do
    if docker compose ps app | grep -q "running"; then
        sleep 3  # Give it a moment to fully start
        break
    fi
    sleep 2
    elapsed=$((elapsed + 2))
done

# Run migrations
echo "📊 Running database migrations..."
docker compose exec app npm run db:migrate || echo "⚠️  Migration failed or already applied"

# Seed database (idempotent)
echo "🌱 Seeding database..."
docker compose exec app npm run db:seed || echo "⚠️  Seeding failed or already done"

# Seed database (idempotent)
echo "🌱 Seeding database..."
docker compose exec app npm run db:seed:users || echo "⚠️  Seeding users failed or already done"

# Check health
echo "🏥 Checking application health..."
sleep 5
if curl -f http://localhost:${APP_PORT}/api/health > /dev/null 2>&1; then
    echo "✅ Application is healthy!"
else
    echo "⚠️  Health check failed, but containers are running"
    echo "💡 App is running on port ${APP_PORT}"
    echo "Check logs with: docker compose logs -f"
fi

echo ""
echo "✅ Deployment complete!"
echo "🌐 Application should be available at: https://dev.billiardsboss.com"
echo ""
echo "📋 Useful commands:"
echo "  View logs: docker compose logs -f"
echo "  Stop: docker compose down"
echo "  Restart: docker compose restart"
echo "  Check status: docker compose ps"

