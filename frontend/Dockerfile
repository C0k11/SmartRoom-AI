# Frontend Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy application code
COPY . .

# Build the application (for production)
# RUN npm run build

# Expose port
EXPOSE 3000

# Development command
CMD ["npm", "run", "dev"]

# Production command (uncomment for production)
# CMD ["npm", "start"]

