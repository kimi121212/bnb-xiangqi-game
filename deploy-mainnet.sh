#!/bin/bash

echo "🚀 BNB Xiangqi Game - Mainnet Deployment Script"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the bnb-xiangqi-game directory"
    exit 1
fi

echo "📦 Building application for production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

echo "✅ Build successful!"

echo ""
echo "🌐 Deployment Options:"
echo "====================="
echo ""
echo "1. 🚀 Vercel (Recommended - Free)"
echo "   Command: npx vercel --prod"
echo ""
echo "2. 🌐 Netlify (Free)"
echo "   Command: npx netlify-cli deploy --prod --dir=dist"
echo ""
echo "3. 🚂 Railway (Free tier available)"
echo "   Command: npx @railway/cli@latest deploy"
echo ""
echo "4. 📁 Manual Upload"
echo "   Upload the 'dist/' folder to any static hosting service"
echo ""

echo "🎮 Your BNB Xiangqi Game is ready for BSC Mainnet!"
echo ""
echo "✅ Features:"
echo "   • Real BNB staking on BSC Mainnet"
echo "   • Winner-takes-all prize system"
echo "   • No unstaking functionality"
echo "   • BSCScan transaction visibility"
echo "   • Individual game pool wallets"
echo ""
echo "⚠️  Important: This is a REAL MONEY game!"
echo "   • All BNB transactions are real and irreversible"
echo "   • Players pay real gas fees"
echo "   • No testnet support - mainnet only"
echo ""
echo "🚀 Choose your deployment method and get it live!"
echo ""
echo "📋 Quick Deploy Commands:"
echo "========================="
echo ""
echo "# Vercel (Recommended)"
echo "npx vercel --prod"
echo ""
echo "# Netlify"
echo "npx netlify-cli deploy --prod --dir=dist"
echo ""
echo "# Railway"
echo "npx @railway/cli@latest deploy"
echo ""
echo "🎯 Your game is production-ready for BSC Mainnet! 🚀"
