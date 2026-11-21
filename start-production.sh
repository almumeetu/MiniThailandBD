#!/bin/bash

# NovaMart Production Startup Script
# This script helps start the production server

echo "🚀 Starting NovaMart Production Server..."
echo "========================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file with production configuration."
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .next exists, if not build
if [ ! -d .next ]; then
    echo "🔨 Building application..."
    npm run build
fi

echo ""
echo "✅ All checks passed!"
echo ""
echo "🌐 URLs:"
echo "   Frontend: https://novamart.webdevss.tech"
echo "   API: https://api-novamart.webdevss.tech"
echo ""
echo "📝 Starting server on port 3002..."
echo ""

# Start the production server
npm run start
