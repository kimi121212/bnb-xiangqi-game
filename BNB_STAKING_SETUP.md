# BNB Staking Setup Guide

## 🚀 Real BNB Staking Implementation

The game now uses **real BNB transactions** on the Binance Smart Chain (BSC) Testnet. Users must have BNB in their wallet and confirm transactions through their wallet provider (MetaMask, etc.).

## 🔧 Setup Requirements

### 1. **BSC Testnet Configuration**
- **Network**: BSC Testnet (Chain ID: 97)
- **RPC URL**: `https://data-seed-prebsc-1-s1.binance.org:8545/`
- **Block Explorer**: `https://testnet.bscscan.com/`

### 2. **Wallet Setup**
- Connect MetaMask or compatible wallet
- Switch to BSC Testnet (automatically prompted)
- Get test BNB from BSC Testnet faucet: https://testnet.binance.org/faucet

### 3. **Transaction Flow**
1. **Create Game**: Wallet address is generated immediately
2. **Stake BNB**: Real transaction to pool wallet (requires wallet confirmation)
3. **Game Starts**: When 2 players have staked
4. **Winner Takes All**: Winner receives all staked BNB

## 💰 How It Works

### Staking Process:
1. User clicks "Stake" button
2. Wallet prompts for transaction confirmation
3. Real BNB is sent to the game's pool wallet
4. Transaction is confirmed on BSC Testnet
5. Game state updates with new staking status

### Unstaking Process:
1. User clicks "Unstake" (only before game starts)
2. Wallet prompts for refund transaction
3. BNB is sent back to user's wallet
4. Game state updates accordingly

## 🔍 Transaction Details

- **Gas Limit**: 21,000 (standard transfer)
- **Network**: BSC Testnet
- **Currency**: Test BNB (free from faucet)
- **Confirmation**: Required from user's wallet

## 🎯 Features

- ✅ Real BNB transactions
- ✅ Wallet confirmation prompts
- ✅ Transaction hash tracking
- ✅ BSC Testnet integration
- ✅ Automatic network switching
- ✅ Pool wallet creation
- ✅ Staking progress tracking (1/2, 2/2)

## 🚨 Important Notes

- **Testnet Only**: Currently uses BSC Testnet (not mainnet)
- **Test BNB**: Get free test BNB from the faucet
- **Wallet Required**: Must have MetaMask or compatible wallet
- **Network Switch**: Automatically switches to BSC Testnet
- **Real Transactions**: All staking requires real wallet confirmations
- **Simulation Mode**: Pool wallets are simulated for testing (addresses starting with "pool_")

## 🔗 Useful Links

- [BSC Testnet Faucet](https://testnet.binance.org/faucet)
- [BSC Testnet Explorer](https://testnet.bscscan.com/)
- [MetaMask Setup](https://metamask.io/)
