# Base Image
FROM node:20-alpine

# Working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install production dependencies
RUN npm install
# Copy application source code
COPY . .

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Run as non-root user
USER node

# Start application
CMD ["node", "server.js"]
