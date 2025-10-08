#!/bin/bash

echo "🚀 Pushing BNB Xiangqi Game to GitHub..."

# Configure Git with your credentials
git config --global user.email "kimidepi@gmail.com"
git config --global user.name "kimi121212"

# Set up the remote URL with your username
git remote set-url origin https://kimi121212@github.com/fen/bnb-xiangqi-game.git

echo "📤 Pushing changes to GitHub..."
echo "You will be prompted for your GitHub password: kaco2018!"

# Push the changes
git push origin main

echo "✅ Push complete!"
echo "🌐 Vercel should automatically deploy the changes"
echo "🔧 Check your Vercel dashboard for deployment status"
