#!/bin/bash

# Script to fix dev database configuration issues
# This ensures the database exists and has the correct name

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔧 Fixing dev database configuration...${NC}"
echo ""

# Check if container is running
CONTAINER_NAME="billiards-boss-db-dev"

if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${YELLOW}⚠️  Database container '${CONTAINER_NAME}' is not running${NC}"
    echo "   Starting containers..."
    cd "$(dirname "$0")/.."
    docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d postgres
    echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
    sleep 5
fi

# Get database credentials from environment or use defaults
PG_USER="${POSTGRES_USER:-billiards}"
PG_PASSWORD="${POSTGRES_PASSWORD:-billiards}"
PG_DB="${POSTGRES_DB:-billiards_boss}"

echo -e "${YELLOW}Checking database '${PG_DB}'...${NC}"

# Check if database exists
DB_EXISTS=$(docker exec "$CONTAINER_NAME" psql -U "$PG_USER" -tAc "SELECT 1 FROM pg_database WHERE datname='$PG_DB'" 2>/dev/null || echo "0")

if [ "$DB_EXISTS" = "1" ]; then
    echo -e "${GREEN}✅ Database '${PG_DB}' exists${NC}"
else
    echo -e "${YELLOW}⚠️  Database '${PG_DB}' does not exist. Creating it...${NC}"
    docker exec "$CONTAINER_NAME" psql -U "$PG_USER" -c "CREATE DATABASE $PG_DB;" 2>/dev/null || {
        echo -e "${RED}❌ Failed to create database${NC}"
        echo "   Trying with postgres user..."
        docker exec "$CONTAINER_NAME" psql -U postgres -c "CREATE DATABASE $PG_DB;"
        docker exec "$CONTAINER_NAME" psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $PG_DB TO $PG_USER;"
    }
    echo -e "${GREEN}✅ Database '${PG_DB}' created${NC}"
fi

# Check for incorrect database name "billiards"
WRONG_DB_EXISTS=$(docker exec "$CONTAINER_NAME" psql -U "$PG_USER" -tAc "SELECT 1 FROM pg_database WHERE datname='billiards'" 2>/dev/null || echo "0")

if [ "$WRONG_DB_EXISTS" = "1" ]; then
    echo -e "${YELLOW}⚠️  Found database 'billiards' (incorrect name)${NC}"
    echo "   This database should be 'billiards_boss'"
    echo "   You may need to migrate data or recreate the database"
    read -p "   Do you want to see what's in the 'billiards' database? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo -e "${YELLOW}Tables in 'billiards' database:${NC}"
        docker exec "$CONTAINER_NAME" psql -U "$PG_USER" -d billiards -c "\dt" || true
    fi
fi

echo ""
echo -e "${GREEN}✅ Database check complete${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Ensure your .env or .env.development has:"
echo "   POSTGRES_DB=billiards_boss"
echo ""
echo "2. Restart the app container:"
echo "   docker compose -f docker-compose.yml -f docker-compose.dev.yml restart app"
echo ""

