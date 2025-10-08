#!/bin/bash

echo "🚀 Setting up BNB Xiangqi Game repository..."

# Configure Git
git config --global user.email "kimidepi@gmail.com"
git config --global user.name "kimidepi"

# Set up remote for your connected GitHub account
git remote set-url origin https://github.com/kimidepi/bnb-xiangqi-game.git

echo "📤 Ready to push to new repository..."
echo "🔧 Make sure you've created the repository on GitHub first:"
echo "   https://github.com/new"
echo "   Repository name: bnb-xiangqi-game"
echo "   Make it Public"
echo "   Don't initialize with README"

echo ""
echo "🚀 Then run:"
echo "   git push -u origin main"
echo ""
echo "✅ After push, connect to Vercel:"
echo "   1. Go to https://vercel.com/dashboard"
echo "   2. Click 'New Project'"
echo "   3. Import from GitHub: kimidepi/bnb-xiangqi-game"
echo "   4. Framework: Next.js"
echo "   5. Click 'Deploy'"
