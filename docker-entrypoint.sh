#!/bin/sh
# =============================================================================
# DOCKER ENTRYPOINT SCRIPT FOR ANGULAR APPLICATION
# =============================================================================
# This script handles environment-specific configuration at runtime

set -e

echo "Starting Dynamic Platform Frontend..."
echo "Environment: ${ENVIRONMENT:-production}"

# Create runtime configuration if needed
if [ ! -z "$API_URL" ]; then
    echo "Configuring runtime API URL: $API_URL"
    # Replace API URL in built files if needed
    find /usr/share/nginx/html -name "*.js" -exec sed -i "s|__API_URL_PLACEHOLDER__|$API_URL|g" {} \;
fi

# Set proper permissions
chown -R nginx:nginx /usr/share/nginx/html
chmod -R 755 /usr/share/nginx/html

echo "Frontend configuration completed."
echo "Starting Nginx..."

# Execute the main command
exec "$@"