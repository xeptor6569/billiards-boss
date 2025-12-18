## Environment Configuration Guide

This guide explains how to configure environment variables for different deployment environments.

## Overview

The project uses Next.js standard environment file naming convention:
- `.env.local` - Local development (highest priority, gitignored)
- `.env.development` - Development/staging environment (dev.billiardsboss.com)
- `.env.production` - Production environment (billiardsboss.com)
- `.env` - Base/shared variables (fallback)

## Environment File Priority

### Next.js Application (Local Development)

When running the Next.js app locally, files are loaded in this order (later files override earlier ones):

1. `.env.local` - **Highest priority**, always loaded, never committed to git
2. `.env.development` - Loaded when `NODE_ENV=development` (default for `npm run dev`)
3. `.env.production` - Loaded when `NODE_ENV=production`
4. `.env` - Base configuration, shared across environments

**Note**: `.env.local` always takes precedence and is never committed to version control.

### Docker Compose

Docker Compose loads environment files based on which compose files are used:

**For Development (using `docker-compose.dev.yml`):**
1. `.env` (base, loaded first)
2. `.env.development` (overrides `.env`)

**For Production (using `docker-compose.prod.yml`):**
1. `.env` (base, loaded first)
2. `.env.production` (overrides `.env`)

The `env_file` directive in the environment-specific compose files automatically loads these files in the correct order. Environment variables can also be overridden by:
- Shell environment variables (highest priority)
- Direct `environment:` section in docker-compose files

**Note**: `.env.local` is **NOT** used by Docker Compose - it's only for Next.js when running `npm run dev` locally.

## Setting Up Environment Files

### Local Development

When running `npm run dev` locally (not using Docker), Next.js automatically loads environment files in this order:

1. `.env.local` - **Highest priority**, always loaded, gitignored
2. `.env.development` - Loaded when `NODE_ENV=development` (default)
3. `.env` - Base configuration

**Setting up `.env.local`:**

1. Copy the example template:
   ```bash
   cp .env.example.local .env.local
   ```

2. Edit `.env.local` and fill in your values:
   - Generate `NEXTAUTH_SECRET`: `openssl rand -base64 32`
   - Set up your local PostgreSQL connection
   - Add your Resend API key (optional, for email features)

3. Start the development server:
   ```bash
   npm run dev
   ```

**Important**: `.env.local` is **only** used by Next.js when running `npm run dev` or `npm run build`. It is **NOT** used by Docker Compose. If you're running the app via Docker locally, use `.env` or `.env.development` instead.

### Development Environment (dev.billiardsboss.com)

1. On your deployment server, navigate to the dev deployment directory:
   ```bash
   cd /opt/billiards-boss-dev
   ```

2. Copy the example template:
   ```bash
   cp .env.example.development .env.development
   ```

3. Edit `.env.development` and fill in your values:
   - Generate a unique `NEXTAUTH_SECRET` (different from production!)
   - Set strong database passwords
   - Configure dev domain URLs
   - Set `APP_PORT=3001` (to avoid conflicts with production)

4. The GitHub Actions workflow will automatically use this file during deployment.

### Production Environment (billiardsboss.com)

1. On your deployment server, navigate to the production deployment directory:
   ```bash
   cd /opt/billiards-boss-prod
   ```

2. Copy the example template:
   ```bash
   cp .env.example.production .env.production
   ```

3. Edit `.env.production` and fill in your values:
   - Generate a unique `NEXTAUTH_SECRET` (different from development!)
   - Set very strong database passwords
   - Configure production domain URLs
   - Set `APP_PORT=3000` (standard production port)

4. The GitHub Actions workflow will automatically use this file during deployment.

## Required Environment Variables

### Database Configuration

**For Local Development:**
- `DATABASE_URL` - Full PostgreSQL connection string

**For Docker Deployments:**
- `POSTGRES_USER` - Database username
- `POSTGRES_PASSWORD` - Database password (use strong passwords!)
- `POSTGRES_DB` - Database name
- `POSTGRES_PORT` - Host port mapping (dev: 5433, prod: 5434)

### NextAuth Configuration

- `NEXTAUTH_URL` - Base URL of your application
  - Local: `http://localhost:3000`
  - Dev: `https://dev.billiardsboss.com`
  - Prod: `https://billiardsboss.com`

- `NEXTAUTH_SECRET` - Secret key for session encryption
  - Generate with: `openssl rand -base64 32`
  - **Must be different for each environment!**

### Application URLs

- `NEXT_PUBLIC_APP_URL` - Public-facing application URL
  - Used for email links and redirects
  - Must match `NEXTAUTH_URL` domain

- `NEXT_PUBLIC_WS_URL` - WebSocket server URL
  - Used for real-time multiplayer features
  - Must match `NEXTAUTH_URL` domain

### Docker Configuration

- `APP_PORT` - Host port for the application
  - Dev: `3001` (to avoid conflicts)
  - Prod: `3000` (standard)

### Email Configuration (Optional)

- `RESEND_API_KEY` - API key from Resend.com
  - Required for email verification and password reset
  - Get your key from https://resend.com

- `EMAIL_FROM` - Email address for sending emails
  - Default: `noreply@billiardsboss.com`

- `EMAIL_FROM_NAME` - Display name for emails
  - Default: `Billiards Boss`

## Environment-Specific Defaults

### Local Development (.env.local)

```env
DATABASE_URL=postgresql://billiards:billiards@localhost:5432/billiards_boss
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3000
APP_PORT=3000
```

### Development (.env.development)

```env
POSTGRES_USER=billiards
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=billiards_boss
POSTGRES_PORT=5433
NEXTAUTH_URL=https://dev.billiardsboss.com
NEXT_PUBLIC_APP_URL=https://dev.billiardsboss.com
NEXT_PUBLIC_WS_URL=https://dev.billiardsboss.com
APP_PORT=3001
```

### Production (.env.production)

```env
POSTGRES_USER=billiards
POSTGRES_PASSWORD=<very-strong-password>
POSTGRES_DB=billiards_boss
POSTGRES_PORT=5434
NEXTAUTH_URL=https://billiardsboss.com
NEXT_PUBLIC_APP_URL=https://billiardsboss.com
NEXT_PUBLIC_WS_URL=https://billiardsboss.com
APP_PORT=3000
```

## Security Best Practices

1. **Never commit `.env` files** - They are gitignored for a reason
2. **Use different secrets** - Each environment should have unique `NEXTAUTH_SECRET`
3. **Strong passwords** - Use strong, unique passwords for production databases
4. **Rotate secrets** - Periodically rotate `NEXTAUTH_SECRET` and database passwords
5. **Limit access** - Restrict file permissions: `chmod 600 .env.production`
6. **Backup securely** - If backing up env files, encrypt them

## Troubleshooting

### Environment Variables Not Loading

1. **Check file exists**: Ensure `.env.local`, `.env.development`, or `.env.production` exists
2. **Check file location**: Environment files must be in the project root
3. **Check syntax**: No spaces around `=` sign: `KEY=value` not `KEY = value`
4. **Restart server**: Environment variables are loaded at startup

### Docker Not Loading Variables

1. **Check env_file**: Verify `env_file` is specified in `docker-compose.yml`
2. **Check file path**: Ensure env file is in the same directory as `docker-compose.yml`
3. **Check permissions**: Ensure the file is readable: `chmod 644 .env.production`
4. **Check syntax**: No quotes needed for values in .env files

### Wrong Environment Loaded

1. **Check NODE_ENV**: Next.js uses `NODE_ENV` to determine which file to load
   - `development` → `.env.development`
   - `production` → `.env.production`
2. **Check priority**: `.env.local` always takes precedence
3. **Check Docker**: Docker Compose loads files in order specified in `env_file`

## Example Files

Template files are provided as examples:
- `.env.example.local` - Local development template
- `.env.example.development` - Development environment template
- `.env.example.production` - Production environment template

Copy these to create your actual environment files:
```bash
cp .env.example.local .env.local
cp .env.example.development .env.development
cp .env.example.production .env.production
```

## Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Docker Compose Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)

