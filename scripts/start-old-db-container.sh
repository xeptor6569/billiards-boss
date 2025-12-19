#!/bin/bash

# Script to start a temporary PostgreSQL container using an old volume
# This allows you to access the old database for migration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔍 Finding old database volumes...${NC}"
echo ""

# List all postgres volumes
docker volume ls | grep -i postgres || echo "No postgres volumes found"

echo ""
echo -e "${YELLOW}Please provide the following information:${NC}"
echo ""

# Get volume name
read -p "Enter the old volume name (e.g., postgres_data, billiards-boss_postgres_data): " VOLUME_NAME

if [ -z "$VOLUME_NAME" ]; then
    echo -e "${RED}❌ Volume name is required${NC}"
    exit 1
fi

# Check if volume exists
if ! docker volume inspect "$VOLUME_NAME" > /dev/null 2>&1; then
    echo -e "${RED}❌ Volume '$VOLUME_NAME' not found${NC}"
    echo "Available volumes:"
    docker volume ls
    exit 1
fi

# Get database credentials (with defaults)
read -p "PostgreSQL user [billiards]: " PG_USER
PG_USER=${PG_USER:-billiards}

read -p "PostgreSQL password [billiards]: " PG_PASSWORD
PG_PASSWORD=${PG_PASSWORD:-billiards}

read -p "PostgreSQL database name [billiards_boss]: " PG_DB
PG_DB=${PG_DB:-billiards_boss}

read -p "Host port to expose (e.g., 5435) [5435]: " HOST_PORT
HOST_PORT=${HOST_PORT:-5435}

# Check if port is in use
if lsof -Pi :$HOST_PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${RED}❌ Port $HOST_PORT is already in use${NC}"
    exit 1
fi

CONTAINER_NAME="billiards-boss-old-db-temp"

# Stop and remove existing container if it exists
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${YELLOW}⚠️  Removing existing container '${CONTAINER_NAME}'...${NC}"
    docker rm -f "$CONTAINER_NAME" > /dev/null 2>&1 || true
fi

echo ""
echo -e "${GREEN}🚀 Starting temporary PostgreSQL container...${NC}"
echo "   Container name: $CONTAINER_NAME"
echo "   Volume: $VOLUME_NAME"
echo "   Port: $HOST_PORT -> 5432"
echo ""

# Start the container
docker run -d \
    --name "$CONTAINER_NAME" \
    -e POSTGRES_USER="$PG_USER" \
    -e POSTGRES_PASSWORD="$PG_PASSWORD" \
    -e POSTGRES_DB="$PG_DB" \
    -p "$HOST_PORT:5432" \
    -v "$VOLUME_NAME:/var/lib/postgresql/data" \
    postgres:16-alpine

# Wait for database to be ready
echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
sleep 5

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${RED}❌ Container failed to start${NC}"
    echo "Check logs with: docker logs $CONTAINER_NAME"
    exit 1
fi

# Test connection
echo -e "${YELLOW}🔌 Testing connection...${NC}"
for i in {1..30}; do
    if docker exec "$CONTAINER_NAME" pg_isready -U "$PG_USER" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Database is ready!${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Database failed to start after 30 seconds${NC}"
        echo "Check logs with: docker logs $CONTAINER_NAME"
        exit 1
    fi
    sleep 1
done

echo ""
echo -e "${GREEN}✅ Temporary database container is running!${NC}"
echo ""
echo -e "${YELLOW}Connection string:${NC}"
echo "postgresql://${PG_USER}:${PG_PASSWORD}@localhost:${HOST_PORT}/${PG_DB}"
echo ""
echo -e "${YELLOW}To use with migration script:${NC}"
echo "export OLD_DATABASE_URL=\"postgresql://${PG_USER}:${PG_PASSWORD}@localhost:${HOST_PORT}/${PG_DB}\""
echo ""
echo -e "${YELLOW}To stop and remove the container:${NC}"
echo "docker rm -f $CONTAINER_NAME"
echo ""
echo -e "${YELLOW}To view logs:${NC}"
echo "docker logs -f $CONTAINER_NAME"
echo ""

