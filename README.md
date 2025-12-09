# Billiards Boss

A free billiards bowling (bowlliards) scoring platform built with Next.js 16, React 19, and PostgreSQL. Billiards Boss combines the precision of 10-ball pocket billiards with the scoring excitement of bowling, offering both casual players and serious competitors a modern, feature-rich scoring experience.

## 🎯 Project Overview

Billiards Boss is a full-stack web application that allows users to:
- Score billiards bowling games with two distinct UI modes (Simple and Immersive)
- Save unlimited games and track performance over time
- View detailed statistics including strikes, spares, averages, and trends
- Edit past games to correct scores
- Play anonymously or create an account to save progress
- Access real-time multiplayer capabilities (WebSocket ready)

The application is production-ready with Docker deployment, comprehensive error handling, and a robust database schema designed for scalability.

## ✨ Features

### Scoring & Gameplay
- 🎱 **Dual Scoring Interfaces**
  - **Simple Interface**: Traditional grid-based scoring board for quick, familiar scoring
  - **Immersive Interface**: Modern, full-screen experience with visual rack representation, frame ribbon navigation, and haptic feedback
- 🎯 **Accurate Scoring Logic**: Full bowling rules implementation including:
  - Strikes (all 10 balls on first shot)
  - Spares (all 10 balls in 2 shots)
  - 10th frame special rules (up to 3 shots with multiple strikes)
  - Automatic score calculation with strike/spare bonuses
- 📱 **Mobile-Optimized**: Responsive design that works beautifully on phones, tablets, and desktops
- 🎨 **Dark Mode Support**: Automatic theme detection with manual toggle

### Account & Data Management
- 🔒 **Secure Authentication**: NextAuth.js v5 with email/password authentication
- 💾 **Unlimited Game Saving**: Free plan allows unlimited saved games (no subscription required)
- 📊 **Comprehensive Statistics**:
  - Games played, total frames, average score
  - Strike and spare counts with percentages
  - Performance trends and visual charts
  - Best game and personal records
- 📜 **Game History**: View, search, and edit past games
- ✏️ **Game Editing**: Correct mistakes in saved games with full frame-by-frame editing

### Technical Features
- ⚡ **Real-time Multiplayer**: WebSocket support via Socket.io (ready for multiplayer games)
- 🐳 **Docker Deployment**: Production-ready Docker Compose setup
- 🔄 **Database Migrations**: Robust migration system with error handling
- 📈 **Performance Optimized**: Next.js 16 Cache Components (PPR) for fast page loads
- 🛡️ **Error Handling**: Comprehensive error boundaries and user-friendly error pages
- 🔧 **Build System**: Automated build ID generation for deployment tracking

### Future-Ready
- 💳 **Plan System**: Infrastructure for free/premium tiers (ready for Stripe integration)
- 🏆 **Tournament Support**: Database schema supports multiplayer tournaments
- 🌐 **Production Deployment**: Tested deployment guide for Proxmox VMs with Nginx reverse proxy

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
├── app/                    # Next.js App Router
│   ├── api/                # API routes
│   │   ├── auth/           # NextAuth endpoints
│   │   ├── games/          # Game CRUD operations
│   │   └── ws/             # WebSocket endpoint
│   ├── auth/               # Authentication pages (signin/signup)
│   ├── dashboard/          # Protected dashboard routes
│   │   ├── games/          # Game management (new, history, detail)
│   │   ├── stats/          # Statistics page
│   │   └── page.tsx        # Dashboard home
│   ├── play/               # Public scoring page
│   └── layout.tsx          # Root layout with providers
├── components/
│   ├── scoring/            # Scoring interface components
│   │   ├── ScoringBoard.tsx        # Simple interface
│   │   ├── ModernScoringBoard.tsx   # Immersive interface
│   │   ├── FrameRibbon.tsx          # Frame navigation ribbon
│   │   ├── RackVisualizer.tsx       # Visual ball rack
│   │   ├── ControlDeck.tsx          # Ball entry controls
│   │   └── InterfaceToggle.tsx      # UI mode switcher
│   └── stats/              # Statistics components
├── lib/
│   ├── db/                 # Database configuration
│   │   ├── schema.ts       # Drizzle ORM schema
│   │   ├── index.ts        # Database client
│   │   ├── run-migrations.ts  # Migration runner
│   │   └── seed.ts         # Database seeding
│   ├── game-logic.ts       # Core scoring logic
│   ├── statistics.ts       # Statistics calculations
│   ├── auth.ts             # NextAuth configuration
│   └── websocket/          # WebSocket server setup
├── hooks/                  # React hooks
│   └── useScoringInterface.ts  # Scoring UI state management
├── contexts/               # React contexts
│   └── ScoringInterfaceContext.tsx  # Global UI state
└── server.ts               # Custom server with WebSocket support
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
- **10 frames per game**: Each frame represents one turn at the table
- **Strike**: All 10 balls pocketed on the first shot (marked as "X")
  - Regular frames: Strike ends the frame
  - 10th frame: Strike allows 2 additional shots (can have multiple strikes)
- **Spare**: All 10 balls pocketed in 2 shots (marked as "/")
  - Regular frames: Spare ends the frame
  - 10th frame: Spare allows 1 additional shot
- **Scoring Rules**:
  - Strike bonus: Add next 2 balls to the strike score
  - Spare bonus: Add next 1 ball to the spare score
  - 10th frame: All balls pocketed count toward final score (no bonus needed)

### Scoring Interfaces

#### Simple Interface
- Traditional grid-based layout showing all 10 frames
- Quick ball entry with numbered buttons
- Clear visual indicators for strikes and spares
- Perfect for quick games and familiar scoring

#### Immersive Interface
- Full-screen, modern design optimized for mobile
- Visual rack representation showing remaining balls
- Horizontal frame ribbon with smooth scrolling
- Large, touch-friendly controls with haptic feedback
- Real-time cumulative score display
- Color-coded shot breakdown within each frame

### Statistics & Analytics

The dashboard provides comprehensive performance tracking:
- **Overview Metrics**: Games played, total frames, average score, best game
- **Strike/Spare Analysis**: Counts and percentages with visual progress bars
- **Performance Charts**: Interactive charts showing trends over time
- **Game History**: Chronological list of all games with quick access to details

### Plan System

The application includes a plan system infrastructure for future monetization:
- **Free Plan**: Currently unlimited games (configurable limit available)
- **Premium Plan**: Ready for unlimited games, multiplayer, tournaments
- All users start on the free plan
- Database schema supports plan upgrades and Stripe integration

## Current Status

### ✅ Completed Features
- Full scoring system with accurate bowling rules
- Dual UI modes (Simple and Immersive)
- User authentication and account management
- Game saving, editing, and history
- Comprehensive statistics dashboard
- Database migrations and seeding
- Docker deployment configuration
- Production deployment guide
- Error handling and user feedback
- Mobile-responsive design
- Dark mode support

### 🚧 In Progress / Planned
- Real-time multiplayer game implementation
- Tournament bracket system
- Stripe payment integration
- Social features (friend lists, challenges)
- Advanced analytics and insights

## Deployment

For detailed production deployment instructions, see [DEPLOY.md](./DEPLOY.md).

Quick deployment overview:
1. Set up PostgreSQL database
2. Configure environment variables (`.env`)
3. Build and start Docker containers
4. Run database migrations and seeding
5. Configure Nginx reverse proxy (optional)
6. Set up SSL/TLS certificates

The application is currently deployed and tested at `dev.billiardsboss.com`.

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint for code quality
- Write descriptive commit messages
- Test changes locally before submitting
- Update documentation for new features
