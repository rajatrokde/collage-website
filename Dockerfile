# Base Image
FROM node:20-alpine

# Working directory
WORKDIR /app

# Copy dependency definition files
COPY package*.json ./

# Install production dependencies cleanly
RUN npm ci --omit=dev || npm install --omit=dev

# Copy application source code
COPY . .

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Run as non-root user for security
USER node

# Start server application
CMD ["node", "server.js"]
