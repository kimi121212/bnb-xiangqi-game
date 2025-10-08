#!/bin/bash

echo "🚀 Deploying BNB Xiangqi Game to Mainnet..."

# Build the application
echo "📦 Building application..."
npm run build

# Create a simple server for the backend
echo "🔧 Setting up backend server..."
cd server
npm install

# Start the backend server in background
echo "🌐 Starting backend server..."
node server.js &
BACKEND_PID=$!

# Wait a moment for server to start
sleep 3

echo "✅ Deployment complete!"
echo "🎮 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5001"
echo "📊 Health: http://localhost:5001/api/health"

# Keep the script running
echo "Press Ctrl+C to stop the servers"
wait $BACKEND_PID
