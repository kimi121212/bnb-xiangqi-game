#!/bin/bash

echo "🚀 Deploying BNB Xiangqi Game to Railway..."

# Build the frontend
echo "📦 Building frontend..."
npm run build

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway (interactive)
echo "🔐 Please login to Railway in your browser..."
railway login

# Initialize Railway project
echo "🚂 Initializing Railway project..."
railway init

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo "🌐 Your app should be available at the Railway URL shown above."
