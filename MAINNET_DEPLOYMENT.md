# BNB Xiangqi Game - Mainnet Deployment Guide

## 🚀 **Ready for BSC Mainnet Deployment**

The BNB Xiangqi game is now configured for BSC Mainnet deployment with the following features:

### ✅ **Mainnet Configuration**
- **Network**: BSC Mainnet (Chain ID: 56)
- **RPC**: `https://bsc-dataseed.binance.org/`
- **Explorer**: `https://bscscan.com/`
- **Currency**: BNB (18 decimals)

### ✅ **Removed Features**
- ❌ **Unstaking functionality** - Players cannot unstake once they stake
- ❌ **Staking progress bar** - Simplified UI without progress indicators
- ❌ **Testnet configurations** - All testnet code removed

### ✅ **Core Features**
- ✅ **Real BNB Staking** - Actual BSC Mainnet transactions
- ✅ **Game Pool Wallets** - Individual wallets for each game
- ✅ **Winner Takes All** - Winner receives entire pool
- ✅ **Real-time Updates** - Live game state synchronization
- ✅ **BSCScan Integration** - All transactions visible on BSCScan

## 🔧 **Deployment Steps**

### 1. **Environment Setup**
```bash
# Install dependencies
npm install

# Build for production
npm run build
```

### 2. **Server Deployment**
```bash
# Start the backend server
cd server
npm start
```

### 3. **Frontend Deployment**
```bash
# Build and serve the frontend
npm run build
# Deploy the dist/ folder to your hosting service
```

### 4. **Domain Configuration**
- Update `ServerGameService.ts` with your production server URL
- Configure CORS for your domain
- Set up SSL certificates

## 💰 **Mainnet Requirements**

### **For Players:**
- **MetaMask** wallet with BSC Mainnet configured
- **BNB tokens** for staking (minimum 0.001 BNB)
- **Gas fees** for transactions (very low on BSC)

### **For Developers:**
- **BSC Mainnet RPC** access
- **Domain hosting** for the application
- **SSL certificate** for secure connections

## 🎮 **Game Flow**

1. **Connect Wallet** - Players connect MetaMask with BSC Mainnet
2. **Create Game** - Host creates a game with stake amount
3. **Stake BNB** - Players stake real BNB to join
4. **Play Game** - Traditional Xiangqi gameplay
5. **Winner Takes All** - Winner receives entire BNB pool

## 🔒 **Security Features**

- **Real BNB Transactions** - All staking uses actual BSC transactions
- **Individual Game Pools** - Each game has its own wallet
- **No Unstaking** - Once staked, players cannot unstake
- **Winner Verification** - Only game winner can claim rewards

## 📊 **Monitoring**

- **BSCScan Integration** - All transactions visible on BSCScan
- **Real-time Updates** - Live game state synchronization
- **Transaction Logs** - Complete transaction history

## 🚨 **Important Notes**

- **No Testnet Support** - Application only works on BSC Mainnet
- **Real Money** - All BNB transactions are real and irreversible
- **Gas Fees** - Players pay BSC gas fees for transactions
- **No Refunds** - Once staked, BNB cannot be unstaked

## 🎯 **Ready for Production**

The application is now ready for BSC Mainnet deployment with:
- ✅ Real BNB staking
- ✅ No unstaking functionality
- ✅ Simplified UI
- ✅ Mainnet configuration
- ✅ Production-ready code

**Deploy with confidence!** 🚀
