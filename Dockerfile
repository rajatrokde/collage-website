# Base Image
FROM node:20-alpine

# Working directory
WORKDIR /app

# Copy package definition files explicitly
COPY package.json package-lock.json* ./

# Install production dependencies
RUN npm install --omit=dev

# Copy remaining application code
COPY . .

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Run as non-root user for security
USER node

# Start application
CMD ["node", "server.js"]