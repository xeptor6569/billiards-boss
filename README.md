# Billiards Boss

A free billiards bowling (bowlliards) scoring platform built with Next.js 16, React 19, and PostgreSQL.

## Features

- 🎱 **Free Score Saving** - Save unlimited games without subscription
- 📊 **Statistics Tracking** - Track your performance with detailed stats
- 👥 **Real-time Multiplayer** - Play with friends in real-time
- 🎯 **Modern UI** - Beautiful, responsive interface
- 🔒 **User Authentication** - Secure account management
- 🐳 **Docker Ready** - Easy deployment with Docker Compose

## Tech Stack

- **Framework**: Next.js 16 with Cache Components (PPR)
- **Runtime**: Node.js 24
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Auth**: NextAuth.js v5
- **Real-time**: Socket.io
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 24+
- PostgreSQL 16+ (or use Docker)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd billiards-boss
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generate a random secret
- `NEXTAUTH_URL` - Your application URL

4. Set up the database:
```bash
# Generate migrations
npm run db:generate

# Run migrations (you'll need to set up your database first)
npm run db:migrate

# Seed default plans
npm run db:seed
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## About the Custom Server

This project uses a custom `server.ts` file to enable WebSocket support via Socket.io. This is necessary because:

- Next.js's default server doesn't support WebSockets natively
- We need real-time multiplayer functionality
- The custom server wraps Next.js and adds WebSocket capabilities

**Note**: While Next.js 16 auto-configures TypeScript for application code (`.ts`/`.tsx` files in `app/`, `components/`, etc.), the custom `server.ts` file runs outside Next.js's build system, so we use `tsx` to execute it directly. This is only needed for the server file - all other TypeScript files are handled automatically by Next.js.

## Docker Deployment

### Using Docker Compose

1. Create a `.env` file with your configuration:
```bash
cp .env.example .env
# Edit .env with your settings
```

2. Build and start services:
```bash
docker compose up -d
```

3. Run database migrations:
```bash
docker compose exec app npm run db:migrate
docker compose exec app npm run db:seed
```

The application will be available at `http://localhost:3000`.

### Manual Docker Build

```bash
# Build the image
docker build -t billiards-boss .

# Run the container
docker run -p 3000:3000 --env-file .env billiards-boss
```

## Database Schema

The application uses the following main tables:
- `users` - User accounts
- `plans` - Subscription plans (free, premium)
- `games` - Game records
- `frames` - Individual frame scores
- `statistics` - User statistics
- `game_participants` - Multiplayer game participants

## Project Structure

```
src/
├── app/              # Next.js App Router
│   ├── (auth)/      # Authentication pages
│   ├── (dashboard)/ # Protected dashboard routes
│   └── api/         # API routes
├── components/       # React components
│   └── scoring/     # Scoring interface components
├── lib/             # Utilities and configurations
│   ├── db/          # Database schema and client
│   ├── auth.ts      # NextAuth configuration
│   └── websocket.ts # WebSocket server
└── hooks/           # React hooks
```

## Development

### Available Scripts

- `npm run dev` - Start development server with WebSocket support (uses tsx for server.ts)
- `npm run build` - Build for production
- `npm run start` - Start production server (uses tsx for server.ts)
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed default plans

### Environment Variables

See `.env.example` for all required environment variables.

## Features in Detail

### Scoring System

Billiards bowling (bowlliards) is 10-ball pocket billiards scored like bowling:
- 10 frames per game
- Strike: All 10 balls on first shot
- Spare: All 10 balls in 2 shots
- Standard bowling scoring rules apply

### Plan System

The application includes a plan system for future monetization:
- **Free Plan**: Limited games (configurable, default 10), no multiplayer
- **Premium Plan**: Unlimited games, multiplayer, tournaments

All users start on the free plan. The system is ready for Stripe integration.

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
