#!/bin/bash

echo "🚀 Deploying BNB Xiangqi Game to Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel (this will open a browser)
echo "🔐 Logging into Vercel..."
vercel login

# Deploy to production
echo "🚀 Deploying to production..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your app should be available at: https://bnb-xiangqi-game.vercel.app"
echo "🔧 Test your API endpoints:"
echo "   - Health: https://bnb-xiangqi-game.vercel.app/api/health"
echo "   - Test: https://bnb-xiangqi-game.vercel.app/api/test"
echo "   - Games: https://bnb-xiangqi-game.vercel.app/api/games"
