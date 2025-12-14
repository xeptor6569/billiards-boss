# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Accept build arguments for build info
ARG BUILD_NUMBER
ARG COMMIT_HASH

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.ts ./
COPY drizzle.config.ts ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application with build info from args
RUN BUILD_NUMBER=${BUILD_NUMBER} COMMIT_HASH=${COMMIT_HASH} npm run build

# Production stage
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
# Copy source files needed for runtime (server.ts dependencies)
# Copy database files for seeding and migrations
COPY --from=builder /app/src/lib/db ./src/lib/db
# Copy websocket server (needed by server.ts)
COPY --from=builder /app/src/lib/websocket ./src/lib/websocket
# Copy game-logic (needed by websocket server and uses @/ alias)
COPY --from=builder /app/src/lib/game-logic.ts ./src/lib/game-logic.ts
# Copy tsconfig.json for TypeScript compilation (needed for @/ path aliases)
COPY --from=builder /app/tsconfig.json ./

# Install wget for healthcheck
RUN apk add --no-cache wget

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Start the server
CMD ["npm", "start"]

