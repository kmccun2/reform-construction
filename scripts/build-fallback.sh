#!/bin/bash

# Build script with multiple fallback options for DigitalOcean
echo "🚀 Starting build process..."

# Check if we have node_modules
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install --include=dev
fi

# Try multiple build approaches
echo "🔨 Attempting to build..."

# Method 1: Direct npx
if npx vite build; then
  echo "✅ Build successful with npx vite build"
  exit 0
fi

# Method 2: Try with node_modules bin
if ./node_modules/.bin/vite build; then
  echo "✅ Build successful with node_modules bin"
  exit 0
fi

# Method 3: Try npm script
if npm run build; then
  echo "✅ Build successful with npm run build"
  exit 0
fi

# Method 4: Install vite globally and try
echo "🔄 Installing vite globally as fallback..."
npm install -g vite
if vite build; then
  echo "✅ Build successful with global vite"
  exit 0
fi

echo "❌ All build methods failed"
exit 1
