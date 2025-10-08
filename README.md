# BNB Xiangqi - Chinese Chess with BNB Staking

A unique blockchain-based Xiangqi (Chinese Chess) game that combines traditional strategy gameplay with BNB staking mechanics and play-to-earn features.

## 🎮 Features

### Core Gameplay
- **Traditional Xiangqi Rules**: Authentic Chinese Chess gameplay with all original pieces and movement rules
- **Real-time Multiplayer**: Play against other players in real-time matches
- **Strategic Depth**: Master the ancient art of Xiangqi with modern blockchain integration

### BNB Integration
- **BNB Staking**: Stake BNB tokens to participate in games and earn rewards
- **Play-to-Earn**: Earn BNB rewards by capturing opponent pieces
- **Dynamic Rewards**: Higher stakes = higher potential earnings
- **Smart Contracts**: Secure, transparent gameplay on Binance Smart Chain

### Unique Features
- **Piece Values**: Each piece has a BNB value (General: 100 BNB, Chariot: 50 BNB, etc.)
- **Staking Multipliers**: Staked BNB increases your earning potential
- **Tournament Mode**: Compete in tournaments with larger prize pools
- **Reward System**: Earn BNB for victories, captures, and achievements

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MetaMask or compatible Web3 wallet
- BNB tokens for staking and gas fees

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/bnb-xiangqi-game.git
   cd bnb-xiangqi-game
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Smart Contract Deployment

1. **Deploy to BSC Testnet** (for testing)
   ```bash
   npm run deploy:testnet
   ```

2. **Deploy to BSC Mainnet** (for production)
   ```bash
   npm run deploy:mainnet
   ```

## 🎯 How to Play

### Basic Gameplay
1. **Connect Wallet**: Connect your MetaMask wallet to BSC network
2. **Stake BNB**: Stake BNB tokens to participate in games
3. **Join/Create Game**: Find an opponent or create a new game
4. **Play**: Make strategic moves to capture opponent pieces
5. **Earn**: Win BNB rewards for captures and victories

### Piece Values (BNB)
- **General (帅/将)**: 100 BNB
- **Chariot (车)**: 50 BNB  
- **Horse (马)**: 30 BNB
- **Cannon (炮)**: 25 BNB
- **Advisor (仕/士)**: 20 BNB
- **Elephant (相/象)**: 15 BNB
- **Soldier (兵/卒)**: 5 BNB

### Staking Mechanics
- **Minimum Stake**: 0.1 BNB to join a game
- **Staking Rewards**: Earn 10% APY on staked BNB
- **Lock Period**: 7 days minimum staking period
- **Unstaking**: Can unstake after lock period expires

## 🏗️ Architecture

### Frontend
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development
- **Styled Components**: CSS-in-JS styling with Binance theme
- **Framer Motion**: Smooth animations and transitions
- **Vite**: Fast build tool and development server

### Blockchain Integration
- **Ethers.js**: Ethereum/BSC interaction
- **Web3**: Wallet connection and transaction handling
- **Smart Contracts**: Solidity contracts for game logic and staking

### Smart Contracts
- **BNBStakingContract**: Handles BNB staking and rewards
- **XiangqiGameContract**: Manages game state and moves
- **TournamentContract**: Tournament and prize pool management

## 🔧 Development

### Project Structure
```
src/
├── components/          # React components
│   ├── GameBoard.tsx   # Main game board
│   ├── WalletConnect.tsx
│   └── StakingPanel.tsx
├── contracts/           # Smart contract interfaces
│   ├── BNBStakingContract.ts
│   └── GameContract.ts
├── hooks/              # Custom React hooks
│   ├── useWallet.ts
│   └── useStaking.ts
├── types/              # TypeScript type definitions
│   ├── game.ts
│   └── blockchain.ts
├── utils/              # Game logic and utilities
│   └── xiangqiLogic.ts
└── styles/             # Theme and styling
    └── theme.ts
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run linter

## 🌐 Network Configuration

### BSC Mainnet
- **Chain ID**: 56
- **RPC URL**: https://bsc-dataseed.binance.org/
- **Explorer**: https://bscscan.com/

### BSC Testnet
- **Chain ID**: 97
- **RPC URL**: https://data-seed-prebsc-1-s1.binance.org:8545/
- **Explorer**: https://testnet.bscscan.com/

## 🔒 Security

- **Smart Contract Audits**: All contracts are audited for security
- **Access Control**: Proper role-based access control
- **Reentrancy Protection**: Protection against reentrancy attacks
- **Input Validation**: Comprehensive input validation
- **Gas Optimization**: Optimized for low gas costs

## 🎨 Design System

### Binance Theme
- **Primary Colors**: BNB Yellow (#F0B90B)
- **Background**: Dark theme with Binance styling
- **Typography**: Inter font family
- **Animations**: Smooth transitions and micro-interactions

### Responsive Design
- **Mobile First**: Optimized for mobile devices
- **Desktop**: Enhanced experience on larger screens
- **Touch Controls**: Touch-friendly game controls

## 📊 Analytics & Metrics

- **Game Statistics**: Track wins, losses, and earnings
- **Staking Analytics**: Monitor staking performance
- **Leaderboards**: Global and seasonal rankings
- **Achievements**: Unlock achievements and rewards

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Binance**: For the BNB ecosystem and support
- **Xiangqi Community**: For preserving the ancient game
- **Open Source**: Built on amazing open source libraries

## 📞 Support

- **Discord**: Join our community
- **Telegram**: Get updates and support
- **Email**: support@bnbxiangqi.com
- **GitHub Issues**: Report bugs and request features

---

**Built with ❤️ for the Binance and Xiangqi communities**
