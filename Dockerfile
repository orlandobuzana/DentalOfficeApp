# SmileCare Dental Management System
# Multi-stage Docker build for production

# Stage 1: Dependencies and build
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S dental -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist

# Copy other necessary files
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/server ./server

# Change ownership to app user
RUN chown -R dental:nodejs /app
USER dental

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http=require('http');const req=http.request({hostname:'localhost',port:5000,path:'/health',timeout:2000},r=>process.exit(r.statusCode===200?0:1));req.on('error',()=>process.exit(1));req.end();"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]