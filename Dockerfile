# =============================================================================
# MULTI-STAGE DOCKERFILE FOR ANGULAR APPLICATION
# =============================================================================
# This Dockerfile supports building for different environments (dev, uat, prod)

# Stage 1: Build the Angular application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build argument for environment
ARG BUILD_CONFIGURATION=production
ENV BUILD_CONFIGURATION=${BUILD_CONFIGURATION}

# Build the application based on configuration
RUN npm run build:${BUILD_CONFIGURATION}

# Stage 2: Serve the application with Nginx
FROM nginx:alpine AS production

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder stage
COPY --from=builder /app/dist/dynamic-platform /usr/share/nginx/html

# Copy environment-specific configuration script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]