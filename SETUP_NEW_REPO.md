# 🚀 Setup New GitHub Repository

## 📋 Steps to Move Repository to Connected GitHub Account

### Step 1: Create New Repository on GitHub
1. Go to https://github.com/new
2. Repository name: `bnb-xiangqi-game`
3. Description: `BNB Staking Xiangqi Game - Next.js Full Stack`
4. Make it **Public** (for Vercel free deployment)
5. **Don't** initialize with README, .gitignore, or license
6. Click "Create repository"

### Step 2: Update Remote URL
```bash
cd /Users/fen/bnb-xiangqi-game
git remote set-url origin https://github.com/kimidepi/bnb-xiangqi-game.git
```

### Step 3: Push All Changes
```bash
git push -u origin main
```

### Step 4: Connect to Vercel
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import from GitHub: `kimidepi/bnb-xiangqi-game`
4. Framework: Next.js (auto-detected)
5. Click "Deploy"

## 🎯 What's Ready to Deploy

✅ **Complete Next.js Application**
- Fixed all Node.js compatibility issues
- Working API routes
- Game creation and listing system

✅ **Vercel Configuration**
- `vercel.json` configured for Next.js
- Automatic deployments from GitHub
- Global access enabled

✅ **API Endpoints**
- `/api/health` - Health check
- `/api/games` - Create and list games
- `/api/status` - Status check

## 🧪 After Deployment

Test these URLs:
- **Main App**: `https://your-app.vercel.app/`
- **API Health**: `https://your-app.vercel.app/api/health`
- **API Games**: `https://your-app.vercel.app/api/games`

## 🔄 Future Updates

Once set up:
1. Make changes locally
2. `git add .`
3. `git commit -m "Your message"`
4. `git push origin main`
5. Vercel automatically deploys

## 📞 Need Help?

If you encounter issues:
1. Check GitHub repository permissions
2. Verify Vercel project settings
3. Check deployment logs in Vercel dashboard
