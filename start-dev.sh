#!/bin/bash

# BNB Xiangqi Game Development Startup Script
echo "🚀 Starting BNB Xiangqi Game Development Environment"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Load NVM if available
if [ -s "$HOME/.nvm/nvm.sh" ]; then
    echo "📦 Loading NVM..."
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm use 18
fi

# Start the backend server
echo "🖥️  Starting backend server..."
cd server
npm start &
SERVER_PID=$!
echo "✅ Backend server started (PID: $SERVER_PID)"

# Wait a moment for server to start
sleep 3

# Start the frontend client
echo "🌐 Starting frontend client..."
cd ../src
npm run dev &
CLIENT_PID=$!
echo "✅ Frontend client started (PID: $CLIENT_PID)"

echo ""
echo "🎮 BNB Xiangqi Game is now running!"
echo "📡 Backend Server: http://localhost:5000"
echo "🌐 Frontend Client: http://localhost:3000 (or 3001)"
echo ""
echo "🔧 To stop the servers, press Ctrl+C"
echo ""

# Wait for user to stop
wait

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $SERVER_PID 2>/dev/null
    kill $CLIENT_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep script running
wait
