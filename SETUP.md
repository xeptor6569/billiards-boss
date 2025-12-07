# Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   
   Create a `.env` file in the root directory with the following:
   ```env
   # Database
   DATABASE_URL=postgresql://billiards:billiards@localhost:5432/billiards_boss
   
   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here-change-in-production
   
   # Application
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_WS_URL=http://localhost:3000
   ```

   **Important**: Generate a secure `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

3. **Set Up PostgreSQL Database**
   
   Create a PostgreSQL database:
   ```sql
   CREATE DATABASE billiards_boss;
   ```

4. **Run Database Migrations**
   ```bash
   # Generate migration files
   npm run db:generate
   
   # Apply migrations (you may need to configure drizzle-kit migrate command)
   # Or manually run the SQL from generated migration files
   ```

5. **Seed Default Plans**
   ```bash
   npm run db:seed
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

## Docker Setup

1. **Create `.env` file** (see above)

2. **Start Services**
   ```bash
   docker compose up -d
   ```

3. **Run Migrations and Seed**
   ```bash
   docker compose exec app npm run db:generate
   docker compose exec app npm run db:seed
   ```

## Database Migrations

Drizzle ORM is configured for migrations. The migration files will be generated in `src/lib/db/migrations/`.

To apply migrations manually, you can:
1. Use `drizzle-kit push` for development (not recommended for production)
2. Use `drizzle-kit migrate` if configured
3. Manually run the SQL from migration files

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check `DATABASE_URL` format: `postgresql://user:password@host:port/database`
- Verify database exists

### NextAuth Issues
- Ensure `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your application URL
- Verify database tables are created (users, accounts, sessions, verification_tokens)

### WebSocket Issues
- Ensure you're using the custom server (`npm run dev` uses `server.ts`)
- Check `NEXT_PUBLIC_WS_URL` matches your server URL
- Verify Socket.io is properly initialized

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong, unique `NEXTAUTH_SECRET`
3. Configure proper `DATABASE_URL` for production database
4. Set up SSL/TLS for production
5. Configure Cloudflare (if using)
6. Set up proper logging and monitoring

## Features Implemented

✅ Next.js 16 with Cache Components (PPR)
✅ React 19 with React Compiler
✅ PostgreSQL database with Drizzle ORM
✅ NextAuth.js v5 authentication
✅ Scoring system (billiards bowling)
✅ Game management (create, view, delete)
✅ Statistics tracking
✅ Score history
✅ Plan system (free/premium) for future monetization
✅ Real-time WebSocket support (Socket.io)
✅ Docker configuration
✅ Anonymous scoring (no login required)
✅ Modern UI with Tailwind CSS v4

## Next Steps

- Set up production database
- Configure domain and SSL
- Deploy to Proxmox VM
- Test multiplayer functionality
- Add tournament bracket system
- Implement Stripe integration (when ready to monetize)

