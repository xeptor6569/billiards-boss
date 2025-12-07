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

# Pull latest changes (if using git)
if [ -d .git ]; then
    echo "📥 Pulling latest changes..."
    git pull
fi

# Stop any existing containers
echo "🛑 Stopping any existing containers..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml down 2>/dev/null || true

# Check if port 3000 is in use by another process
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port 3000 is already in use. Attempting to free it..."
    # Try to find and stop the process
    PID=$(lsof -Pi :3000 -sTCP:LISTEN -t 2>/dev/null | head -1)
    if [ -n "$PID" ]; then
        echo "   Found process $PID using port 3000. Stopping it..."
        kill -9 $PID 2>/dev/null || true
        sleep 2
    fi
fi

# Build and start containers
echo "🐳 Building and starting Docker containers..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run migrations
echo "📊 Running database migrations..."
docker compose exec -T app npm run db:migrate || echo "⚠️  Migration failed or already applied"

# Seed database (idempotent)
echo "🌱 Seeding database..."
docker compose exec -T app npm run db:seed || echo "⚠️  Seeding failed or already done"

# Check health
echo "🏥 Checking application health..."
sleep 5
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Application is healthy!"
else
    echo "⚠️  Health check failed, but containers are running"
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

