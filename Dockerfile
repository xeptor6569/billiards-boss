# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.ts ./
COPY drizzle.config.ts ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

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
# Copy source files needed for database seeding and migrations
# Copy the entire src/lib/db directory (includes seed.ts, index.ts, schema.ts)
COPY --from=builder /app/src/lib/db ./src/lib/db
# Copy tsconfig.json for TypeScript compilation
COPY --from=builder /app/tsconfig.json ./

# Install wget for healthcheck
RUN apk add --no-cache wget

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Start the server
CMD ["npm", "start"]

