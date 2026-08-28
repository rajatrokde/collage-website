# Base Image
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application source code
COPY . .

# Set environment to production
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Non-root user for security
USER node

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/healthz || exit 1

# Command to run the server
CMD ["node", "server.js"]
