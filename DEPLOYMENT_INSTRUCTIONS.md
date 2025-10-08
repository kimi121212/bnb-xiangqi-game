# 🚀 BNB Xiangqi Game - Mainnet Deployment Instructions

## ✅ **Ready for Mainnet Deployment!**

Your BNB Xiangqi game is now ready for BSC Mainnet deployment. Here are the deployment options:

## 🌐 **Option 1: Quick Deployment (Recommended)**

### **Using Vercel (Free)**
1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd /Users/fen/bnb-xiangqi-game
   vercel --prod
   ```

3. **Follow the prompts** to create your account and deploy

### **Using Netlify (Free)**
1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy:**
   ```bash
   cd /Users/fen/bnb-xiangqi-game
   netlify deploy --prod --dir=dist
   ```

## 🔧 **Option 2: Manual Deployment**

### **Step 1: Build the Application**
```bash
cd /Users/fen/bnb-xiangqi-game
npm run build
```

### **Step 2: Deploy Frontend**
- Upload the `dist/` folder to any static hosting service:
  - **GitHub Pages**
  - **Firebase Hosting**
  - **AWS S3**
  - **Cloudflare Pages**

### **Step 3: Deploy Backend**
- Deploy the `server/` folder to:
  - **Railway** (railway.app)
  - **Render** (render.com)
  - **Heroku**
  - **AWS EC2**

## 📋 **Production Checklist**

### ✅ **Frontend (Ready)**
- ✅ Built for production (`dist/` folder)
- ✅ BSC Mainnet configured
- ✅ Real BNB staking enabled
- ✅ No unstaking functionality
- ✅ Clean UI without progress bars

### ✅ **Backend (Ready)**
- ✅ Express.js server
- ✅ Socket.IO for real-time updates
- ✅ CORS configured
- ✅ Real wallet generation
- ✅ Game pool management

## 🎮 **Game Features**

### **Core Functionality**
- ✅ **Real BNB Staking** - Actual BSC Mainnet transactions
- ✅ **Winner Takes All** - Winner receives entire BNB pool
- ✅ **No Unstaking** - Once staked, cannot unstake
- ✅ **Game Pool Wallets** - Individual wallets for each game
- ✅ **Real-time Updates** - Live game state synchronization
- ✅ **BSCScan Integration** - All transactions visible on BSCScan

### **Network Configuration**
- ✅ **BSC Mainnet** (Chain ID: 56)
- ✅ **RPC**: `https://bsc-dataseed.binance.org/`
- ✅ **Explorer**: `https://bscscan.com/`
- ✅ **Currency**: BNB (18 decimals)

## 🚨 **Important Notes**

- **Real Money**: All BNB transactions are real and irreversible
- **No Testnet**: Application only works on BSC Mainnet
- **Gas Fees**: Players pay BSC gas fees for transactions
- **No Refunds**: Once staked, BNB cannot be unstaked

## 🎯 **Ready to Deploy!**

Your BNB Xiangqi game is **production-ready** for BSC Mainnet! 

**Choose your deployment method and get it live!** 🚀

## 📞 **Support**

If you need help with deployment, the application is fully configured and ready to go live on BSC Mainnet!
