# Multi-stage build for production deployment

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source files
COPY . .

# Build frontend
RUN npm run build

# Stage 2: Setup backend and serve
FROM node:20-alpine AS production

WORKDIR /app

# Install production dependencies for server
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --only=production

# Copy server source
COPY server/ ./

# Copy built frontend from previous stage
WORKDIR /app
COPY --from=frontend-builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
WORKDIR /app/server
CMD ["node", "index.js"]
