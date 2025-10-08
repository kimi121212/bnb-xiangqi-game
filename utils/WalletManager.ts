import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';

export interface GameWallet {
  gameId: string;
  address: string;
  privateKey: string;
  createdAt: number;
}

export class WalletManager {
  private privateKeysFile: string;
  private wallets: Map<string, GameWallet> = new Map();

  constructor() {
    this.privateKeysFile = path.join(process.cwd(), 'privatekeys.md');
    this.loadWallets();
  }

  // Load wallets from privatekeys.md file
  private loadWallets() {
    try {
      if (fs.existsSync(this.privateKeysFile)) {
        const content = fs.readFileSync(this.privateKeysFile, 'utf8');
        const lines = content.split('\n');
        
        for (const line of lines) {
          if (line.trim() && !line.startsWith('#')) {
            const parts = line.split('|');
            if (parts.length >= 4) {
              const wallet: GameWallet = {
                gameId: parts[0].trim(),
                address: parts[1].trim(),
                privateKey: parts[2].trim(),
                createdAt: parseInt(parts[3].trim()) || Date.now()
              };
              this.wallets.set(wallet.gameId, wallet);
            }
          }
        }
        console.log(`Loaded ${this.wallets.size} game wallets`);
      }
    } catch (error) {
      console.error('Error loading wallets:', error);
    }
  }

  // Save wallets to privatekeys.md file
  private saveWallets() {
    try {
      const lines = [
        '# Game Wallets - Private Keys',
        '# Format: gameId|address|privateKey|createdAt',
        '# DO NOT SHARE THESE PRIVATE KEYS!',
        ''
      ];

      for (const wallet of this.wallets.values()) {
        lines.push(`${wallet.gameId}|${wallet.address}|${wallet.privateKey}|${wallet.createdAt}`);
      }

      fs.writeFileSync(this.privateKeysFile, lines.join('\n'));
      console.log(`Saved ${this.wallets.size} wallets to privatekeys.md`);
    } catch (error) {
      console.error('Error saving wallets:', error);
    }
  }

  // Create a new wallet for a game
  createGameWallet(gameId: string): GameWallet {
    // Check if wallet already exists
    if (this.wallets.has(gameId)) {
      return this.wallets.get(gameId)!;
    }

    // Generate new wallet
    const wallet = ethers.Wallet.createRandom();
    const gameWallet: GameWallet = {
      gameId,
      address: wallet.address,
      privateKey: wallet.privateKey,
      createdAt: Date.now()
    };

    this.wallets.set(gameId, gameWallet);
    this.saveWallets();

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

      // Send BNB to winner
      const tx = await signer.sendTransaction({
        to: winnerAddress,
        value: amountWei,
        gasLimit: 21000
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

export const walletManager = new WalletManager();
