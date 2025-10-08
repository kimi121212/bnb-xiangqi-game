# 🚀 BNB Xiangqi Game - Deployment Guide

## 📋 Current Status
- ✅ **Next.js Conversion**: Complete
- ✅ **API Routes**: Fixed and working
- ✅ **Vercel Configuration**: Ready
- ❌ **GitHub Push**: Needs authentication

## 🔧 Authentication Setup

### Option 1: GitHub Personal Access Token (Recommended)
1. Go to GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name: "BNB Xiangqi Game"
4. Select scopes: `repo` (full control of private repositories)
5. Click "Generate token"
6. Copy the token

### Option 2: SSH Key Authentication
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "kimidepi@gmail.com"

# Add to GitHub
# Copy ~/.ssh/id_ed25519.pub to GitHub → Settings → SSH keys
```

## 🚀 Deployment Steps

### Step 1: Push to GitHub
```bash
cd /Users/fen/bnb-xiangqi-game

# Configure Git
git config --global user.email "kimidepi@gmail.com"
git config --global user.name "kimi121212"

# Push with token (use token as password)
git push origin main
```

### Step 2: Verify Vercel Connection
1. Go to https://vercel.com/dashboard
2. Find project: `bnb-xiangqi-game`
3. Check "Git" tab to ensure GitHub connection
4. Click "Redeploy" if needed

### Step 3: Test Deployment
- **Main App**: `https://bnb-xiangqi-game.vercel.app/`
- **API Health**: `https://bnb-xiangqi-game.vercel.app/api/health`
- **API Games**: `https://bnb-xiangqi-game.vercel.app/api/games`

## 🎯 What's Fixed

### ✅ Next.js Conversion
- Removed Node.js compatibility issues
- Proper server/client separation
- Built-in API routes

### ✅ API Endpoints
- `/api/health` - Health check
- `/api/games` - Create and list games
- `/api/status` - Status check

### ✅ Vercel Configuration
- `vercel.json` configured for Next.js
- Automatic deployments from GitHub
- Global access enabled

## 🧪 Testing Checklist

After deployment, test:
- [ ] Main page loads: `/`
- [ ] Health API works: `/api/health`
- [ ] Games API works: `/api/games`
- [ ] Can create games
- [ ] Games appear in listing
- [ ] No 404 errors

## 🔄 Future Updates

Once set up, future updates are simple:
1. Make changes locally
2. `git add .`
3. `git commit -m "Your message"`
4. `git push origin main`
5. Vercel automatically deploys

## 📞 Troubleshooting

### If API still returns 404:
1. Check Vercel dashboard for build errors
2. Verify `vercel.json` configuration
3. Check deployment logs

### If GitHub push fails:
1. Use Personal Access Token instead of password
2. Check GitHub repository permissions
3. Verify Git configuration

## 🎮 Features Ready

- ✅ Game creation form
- ✅ Public game listing
- ✅ Real-time updates
- ✅ Private games with passwords
- ✅ Global access
- ✅ Persistent storage (session-based)
