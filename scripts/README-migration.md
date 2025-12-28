# Database Migration Script

## Migrating Games from Old Database Volume

This script copies games from an old database volume to the current database, handling ID conflicts and preserving relationships.

## Prerequisites

1. Access to both database volumes:
   - Old database (the one with missing games)
   - Current database (where games should be migrated to)

2. Database connection strings for both

## Setup

### Option 1: If you have a Docker Volume (Recommended)

If you only have access to the Docker volume (not a running container), use the helper script to start a temporary container:

1. **Find the volume name in Portainer:**
   - Look for volumes like `postgres_data`, `billiards-boss_postgres_data`, etc.
   - Note the exact volume name

2. **Start a temporary database container:**
   ```bash
   ./scripts/start-old-db-container.sh
   ```
   
   The script will:
   - List available postgres volumes
   - Ask you for the volume name
   - Ask for database credentials (defaults: user=`billiards`, password=`billiards`, db=`billiards_boss`)
   - Ask for a host port (default: `5435`)
   - Start a temporary PostgreSQL container
   - Provide you with the connection string

3. **Use the provided connection string:**
   ```bash
   export OLD_DATABASE_URL="postgresql://billiards:billiards@localhost:5435/billiards_boss"
   ```

4. **After migration, stop the temporary container:**
   ```bash
   docker rm -f billiards-boss-old-db-temp
   ```

### Option 2: If you have a running container or connection string

1. **Get the old database connection string:**
   - From Portainer, find the old database container
   - Get the connection string (format: `postgresql://user:password@host:port/database`)
   - Or construct it from container details

2. **Set environment variables:**
   ```bash
   # Old database (the one with missing games)
   export OLD_DATABASE_URL="postgresql://user:password@old-host:5432/database"
   
   # Current database (already set in your .env, but can override)
   export DATABASE_URL="postgresql://user:password@current-host:5432/database"
   ```

   Or create a `.env.migration` file:
   ```env
   OLD_DATABASE_URL=postgresql://user:password@old-host:5432/database
   DATABASE_URL=postgresql://user:password@current-host:5432/database
   ```

## Running the Migration

```bash
# Load environment variables if using .env.migration
source .env.migration  # or: export $(cat .env.migration | xargs)

# Run the migration script
tsx scripts/migrate-games-from-old-db.ts
```

Or with npm script (add to package.json):
```bash
npm run db:migrate:from-old
```

## What the Script Does

1. **Connects to both databases** (old and new)
2. **Fetches all games** from the old database
3. **Checks for ID conflicts** - assigns new IDs starting from (max current ID + 1000)
4. **Verifies users exist** - skips games for users that don't exist in new DB
5. **Migrates games** - copies games with remapped IDs
6. **Migrates frames** - copies all frame data associated with games
7. **Migrates participants** - copies multiplayer game participants
8. **Preserves timestamps** - keeps original created_at dates
9. **Handles game types** - defaults old games to 'bowlliards' if game_type is missing

## Safety Features

- **ID remapping**: Old game IDs are remapped to avoid conflicts
- **User verification**: Games for non-existent users are skipped
- **Duplicate detection**: Checks if games already exist before migrating
- **Error handling**: Continues migration even if individual items fail
- **Progress reporting**: Shows progress every 10 games / 50 frames

## Output

The script will show:
- Number of games found in old database
- Current max ID in new database
- Migration progress
- Summary of migrated vs skipped items

Example output:
```
📊 Migration Summary
============================================================
Games:     13 migrated, 0 skipped
Frames:    130 migrated, 0 skipped
Participants: 0 migrated, 0 skipped
============================================================
```

## Quick Reference

### Finding the Volume Name in Portainer

1. Go to **Volumes** in Portainer
2. Look for volumes with names like:
   - `postgres_data` (original, before multi-env)
   - `billiards-boss_postgres_data` (Docker Compose default naming)
   - `postgres_data_dev` or `postgres_data_prod` (if you know which environment)
3. Check the volume's **Labels** or **Mount path** to confirm it's the old one
4. Copy the exact volume name

### Typical Volume Names

Based on your docker-compose setup:
- **Old volume (before multi-env)**: `postgres_data` or `billiards-boss_postgres_data`
- **Dev volume**: `postgres_data_dev`
- **Prod volume**: `postgres_data_prod`

## Troubleshooting

### "OLD_DATABASE_URL not set"
- Make sure you've exported the environment variable or set it in your environment

### "User not found" warnings
- Games for users that don't exist in the new database will be skipped
- This is expected if you've cleaned up test users

### "Game already exists" messages
- The script checks for duplicates and skips them
- If you see this, the game was already migrated

### Connection errors
- Verify both database connection strings are correct
- Check network access to both databases
- Ensure databases are running and accessible

## After Migration

1. **Verify games appear** in the history page
2. **Check game details** - click on a migrated game to ensure frames loaded correctly
3. **Update statistics** - statistics may need recalculation after migration

## Notes

- Game IDs will be different after migration (old game #1 might become #1015)
- Original timestamps are preserved
- The script is idempotent - safe to run multiple times (skips duplicates)

