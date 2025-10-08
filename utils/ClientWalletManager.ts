import { ethers } from 'ethers';

export interface GameWallet {
  gameId: string;
  address: string;
  privateKey: string;
  createdAt: number;
}

export class ClientWalletManager {
  private wallets: Map<string, GameWallet> = new Map();
  private localStorageKey = 'bnb-xiangqi-game-wallets';

  constructor() {
    this.loadWalletsFromStorage();
  }

  // Load wallets from localStorage
  private loadWalletsFromStorage() {
    try {
      const storedWallets = localStorage.getItem(this.localStorageKey);
      if (storedWallets) {
        const parsedWallets: GameWallet[] = JSON.parse(storedWallets);
        parsedWallets.forEach(wallet => {
          this.wallets.set(wallet.gameId, wallet);
        });
        console.log(`Loaded ${this.wallets.size} wallets from localStorage`);
      }
    } catch (error) {
      console.error('Error loading wallets from localStorage:', error);
    }
  }

  // Save wallets to localStorage
  private saveWalletsToStorage() {
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(Array.from(this.wallets.values())));
    } catch (error) {
      console.error('Error saving wallets to localStorage:', error);
    }
  }

  // Create a new wallet for a game
  createGameWallet(gameId: string): GameWallet {
    // Check if wallet already exists
    if (this.wallets.has(gameId)) {
      return this.wallets.get(gameId)!;
    }

    // Generate new wallet using ethers
    const wallet = ethers.Wallet.createRandom();
    const gameWallet: GameWallet = {
      gameId,
      address: wallet.address,
      privateKey: wallet.privateKey,
      createdAt: Date.now()
    };

    this.wallets.set(gameId, gameWallet);
    this.saveWalletsToStorage();

    console.log(`Created new wallet for game ${gameId}: ${gameWallet.address}`);
    return gameWallet;
  }

  // Get wallet for a game
  getGameWallet(gameId: string): GameWallet | null {
    return this.wallets.get(gameId) || null;
  }

  // Get wallet signer for a game
  getGameSigner(gameId: string, provider: ethers.Provider): ethers.Wallet | null {
    const wallet = this.getGameWallet(gameId);
    if (!wallet) return null;

    return new ethers.Wallet(wallet.privateKey, provider);
  }

  // Send BNB from game wallet to winner
  async sendToWinner(gameId: string, winnerAddress: string, amount: number, provider: ethers.Provider): Promise<{ success: boolean; hash?: string; error?: string }> {
    try {
      const signer = this.getGameSigner(gameId, provider);
      if (!signer) {
        return { success: false, error: 'Game wallet not found' };
      }

      // Check balance
      const balance = await provider.getBalance(signer.address);
      const amountWei = ethers.parseEther(amount.toString());
      
      if (balance < amountWei) {
        return { success: false, error: 'Insufficient balance in game wallet' };
      }

      // Get current gas price
      let gasPrice;
      try {
        const feeData = await provider.getFeeData();
        gasPrice = feeData.gasPrice;
      } catch (error) {
        console.warn('getFeeData failed, using fallback gas price:', error);
        gasPrice = ethers.parseUnits('5', 'gwei');
      }
      
      if (!gasPrice) {
        gasPrice = ethers.parseUnits('5', 'gwei');
      }

      // Send BNB to winner
      const tx = await signer.sendTransaction({
        to: winnerAddress,
        value: amountWei,
        gasLimit: 21000,
        gasPrice: gasPrice
      });

      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        console.log(`Sent ${amount} BNB to winner ${winnerAddress} from game ${gameId}`);
        return { success: true, hash: tx.hash };
      } else {
        return { success: false, error: 'Transaction failed' };
      }
    } catch (error: any) {
      console.error('Error sending to winner:', error);
      return { success: false, error: error.message };
    }
  }

  // Get wallet balance
  async getWalletBalance(gameId: string, provider: ethers.Provider): Promise<number> {
    try {
      const wallet = this.getGameWallet(gameId);
      if (!wallet) return 0;

      const balance = await provider.getBalance(wallet.address);
      return parseFloat(ethers.formatEther(balance));
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      return 0;
    }
  }

  // List all game wallets
  getAllWallets(): GameWallet[] {
    return Array.from(this.wallets.values());
  }
}

export const clientWalletManager = new ClientWalletManager();
