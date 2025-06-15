#!/bin/bash

# Build the React application
echo "Building React application..."
npm run build

# Create deployment package
echo "Creating deployment package..."
tar -czf reform-construction-build.tar.gz -C dist .

echo "Build complete! Upload reform-construction-build.tar.gz to your DigitalOcean droplet."
echo ""
echo "On your droplet, extract with:"
echo "tar -xzf reform-construction-build.tar.gz -C /var/www/html/"
