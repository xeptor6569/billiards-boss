# Quick Start Guide

Follow these steps to get Billiards Boss running locally:

## Step 1: Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# Generate a secure secret for NextAuth
openssl rand -base64 32
```

Create `.env.local` file for local development:

```bash
# Copy the example template
cp .env.example.local .env.local
```

Then edit `.env.local` and fill in your values:

```env
# Database
DATABASE_URL=postgresql://billiards:billiards@localhost:5432/billiards_boss

# NextAuth (use the secret you generated above)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-here

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3000
```

**Note**: `.env.local` is gitignored and takes highest priority. See [ENV_SETUP.md](ENV_SETUP.md) for more details.

## Step 2: Set Up PostgreSQL Database

### Option A: Using Docker (Easiest)

```bash
# Start PostgreSQL in Docker
docker run --name billiards-postgres \
  -e POSTGRES_USER=billiards \
  -e POSTGRES_PASSWORD=billiards \
  -e POSTGRES_DB=billiards_boss \
  -p 5432:5432 \
  -d postgres:16-alpine
```

### Option B: Local PostgreSQL Installation

1. Install PostgreSQL 16+ if not already installed
2. Create the database:
```sql
CREATE DATABASE billiards_boss;
CREATE USER billiards WITH PASSWORD 'billiards';
GRANT ALL PRIVILEGES ON DATABASE billiards_boss TO billiards;
```

## Step 3: Generate Database Migrations

```bash
npm run db:generate
```

This will create migration files in `src/lib/db/migrations/`.

## Step 4: Apply Database Migrations

You'll need to apply the migrations. Drizzle Kit's migrate command may need configuration. For now, you can:

**Option A: Use Drizzle Studio (Visual)**
```bash
npx drizzle-kit studio
```
Then manually run the SQL from the generated migration files, or use the UI.

**Option B: Manual SQL**
1. Check the generated migration files in `src/lib/db/migrations/`
2. Run the SQL directly in your PostgreSQL client

**Option C: Use Drizzle Push (Development only)**
```bash
npx drizzle-kit push
```
⚠️ This directly modifies your database schema - use only for development!

## Step 5: Seed Default Plans

```bash
npm run db:seed
```

This creates the Free and Premium plans in your database.

## Step 6: Start the Development Server

```bash
npm run dev
```

The server will start on [http://localhost:3000](http://localhost:3000)

## Step 7: Test the Application

1. **Landing Page**: Visit http://localhost:3000
   - You should see the landing page
   - Click "Try It Free" to test anonymous scoring

2. **Sign Up**: Visit http://localhost:3000/auth/signup
   - Create a test account
   - You'll be assigned the Free plan automatically

3. **Dashboard**: After signing up, you'll be redirected to the dashboard
   - Create a new game
   - Test the scoring interface

4. **Save a Game**: Complete a game and save it
   - View it in History
   - Check your Statistics

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running: `docker ps` or `pg_isready`
- Check `DATABASE_URL` in `.env` matches your database setup
- Ensure database exists: `psql -U billiards -d billiards_boss -c "SELECT 1;"`

### NextAuth Errors
- Verify `NEXTAUTH_SECRET` is set in `.env`
- Check that `NEXTAUTH_URL` matches your server URL
- Ensure database tables exist (users, accounts, sessions, verification_tokens)

### WebSocket Connection Issues
- Make sure you're using `npm run dev` (not `next dev`)
- The custom server (`server.ts`) must be running for WebSocket support
- Check browser console for connection errors

### Migration Issues
- If migrations fail, you can use `npx drizzle-kit push` for development
- Or manually create tables using the schema in `src/lib/db/schema.ts`

## What You Should See

✅ Landing page with feature comparison
✅ Anonymous scoring works (scores not saved)
✅ Sign up/Sign in pages
✅ Dashboard with game management
✅ Scoring interface with ball tracker
✅ Game history and statistics
✅ Real-time multiplayer ready (when implemented)

## Next Steps After Setup

- Test the scoring system
- Create multiple games
- Check statistics tracking
- Test the plan limits (free plan allows 10 games)
- Explore the UI and features

Happy scoring! 🎱


