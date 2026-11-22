#!/bin/bash

# Mini Thailand BD Production Startup Script
# This script builds and starts the production server

echo "🚀 Starting Mini Thailand BD Production Server..."
echo "================================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file with production configuration (see .env.example)."
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build application
echo "🔨 Building Next.js application..."
npm run build

echo ""
echo "✅ Production build succeeded!"
echo ""
echo "📝 Starting server on port ${PORT:-3002}..."
echo ""

# Start the production server
npm run start
