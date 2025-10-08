import { ethers } from 'ethers';

export interface GamePoolWallet {
  gameId: string;
  address: string;
  privateKey: string;
  balance: string;
  isActive: boolean;
  createdAt: number;
}

export class GamePoolWalletManager {
  private provider: ethers.Provider;
  private signer: ethers.Signer;
  private gameWallets: Map<string, GamePoolWallet> = new Map();

  constructor(provider: ethers.Provider, signer: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
  }

  // Create a new game pool wallet
  async createGamePoolWallet(gameId: string): Promise<GamePoolWallet> {
    try {
      // Generate a new wallet for this specific game
      const wallet = ethers.Wallet.createRandom();
      
      const gameWallet: GamePoolWallet = {
        gameId,
        address: wallet.address,
        privateKey: wallet.privateKey,
        balance: '0',
        isActive: true,
        createdAt: Date.now()
      };

      this.gameWallets.set(gameId, gameWallet);
      
      console.log(`Created game pool wallet for game ${gameId}:`, wallet.address);
      console.log(`Private key for game ${gameId}:`, wallet.privateKey);
      
      // Save to documentation file
      await this.saveWalletToFile(gameWallet);
      
      return gameWallet;
    } catch (error) {
      console.error('Failed to create game pool wallet:', error);
      throw error;
    }
  }

  // Get game pool wallet info
  getGamePoolWallet(gameId: string): GamePoolWallet | null {
    return this.gameWallets.get(gameId) || null;
  }

  // Check BNB balance of game pool wallet
  async getGamePoolBalance(gameId: string): Promise<string> {
    try {
      const gameWallet = this.gameWallets.get(gameId);
      if (!gameWallet) {
        throw new Error('Game pool wallet not found');
      }

      const balance = await this.provider.getBalance(gameWallet.address);
      const balanceInBNB = ethers.formatEther(balance);
      
      // Update stored balance
      gameWallet.balance = balanceInBNB;
      
      return balanceInBNB;
    } catch (error) {
      console.error('Failed to get game pool balance:', error);
      throw error;
    }
  }

  // Stake BNB to game pool wallet
  async stakeToGamePool(gameId: string, amount: string): Promise<string> {
    try {
      const gameWallet = this.gameWallets.get(gameId);
      if (!gameWallet) {
        throw new Error('Game pool wallet not found');
      }

      const amountWei = ethers.parseEther(amount);
      
      // Send BNB from user's wallet to game pool wallet
      const tx = await this.signer.sendTransaction({
        to: gameWallet.address,
        value: amountWei,
        gasLimit: 21000
      });

      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        console.log(`Successfully staked ${amount} BNB to game ${gameId}`);
        // Update balance
        await this.getGamePoolBalance(gameId);
        return tx.hash;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Failed to stake to game pool:', error);
      throw error;
    }
  }

  // Withdraw winnings from game pool wallet
  async withdrawWinnings(gameId: string, winnerAddress: string): Promise<string> {
    try {
      const gameWallet = this.gameWallets.get(gameId);
      if (!gameWallet) {
        throw new Error('Game pool wallet not found');
      }

      const balance = await this.getGamePoolBalance(gameId);
      const balanceWei = ethers.parseEther(balance);

      if (balanceWei === 0n) {
        throw new Error('No funds to withdraw');
      }

      // Create a transaction to send all funds to winner
      const tx = await this.signer.sendTransaction({
        to: winnerAddress,
        value: balanceWei,
        gasLimit: 21000
      });

      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        console.log(`Successfully sent ${balance} BNB to winner ${winnerAddress}`);
        // Update balance
        await this.getGamePoolBalance(gameId);
        return tx.hash;
      } else {
        throw new Error('Withdrawal transaction failed');
      }
    } catch (error) {
      console.error('Failed to withdraw winnings:', error);
      throw error;
    }
  }

  // Get all game pool wallets
  getAllGameWallets(): GamePoolWallet[] {
    return Array.from(this.gameWallets.values());
  }

  // Check if game pool wallet exists
  hasGamePoolWallet(gameId: string): boolean {
    return this.gameWallets.has(gameId);
  }

  // Refund BNB to player (when unstaking or game ends)
  async refundToPlayer(gameId: string, playerAddress: string, amount: string): Promise<string> {
    try {
      const gameWallet = this.gameWallets.get(gameId);
      if (!gameWallet) {
        throw new Error('Game pool wallet not found');
      }

      const amountWei = ethers.parseEther(amount);
      const balance = await this.getGamePoolBalance(gameId);
      const balanceWei = ethers.parseEther(balance);

      if (balanceWei < amountWei) {
        throw new Error('Insufficient funds in game pool for refund');
      }

      // Create wallet instance with private key
      const wallet = new ethers.Wallet(gameWallet.privateKey, this.provider);
      
      // Send refund transaction
      const tx = await wallet.sendTransaction({
        to: playerAddress,
        value: amountWei,
        gasLimit: 21000
      });

      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        console.log(`Successfully refunded ${amount} BNB to ${playerAddress} from game ${gameId}`);
        // Update balance
        await this.getGamePoolBalance(gameId);
        return tx.hash;
      } else {
        throw new Error('Refund transaction failed');
      }
    } catch (error) {
      console.error('Failed to refund to player:', error);
      throw error;
    }
  }

  // Refund all remaining funds to players (when game ends)
  async refundAllToPlayers(gameId: string, playerAddresses: string[]): Promise<string[]> {
    try {
      const gameWallet = this.gameWallets.get(gameId);
      if (!gameWallet) {
        throw new Error('Game pool wallet not found');
      }

      const balance = await this.getGamePoolBalance(gameId);
      const balanceWei = ethers.parseEther(balance);
      
      if (balanceWei === 0n) {
        console.log('No funds to refund for game', gameId);
        return [];
      }

      const refundAmount = balance / BigInt(playerAddresses.length);
      const refundAmountEther = ethers.formatEther(refundAmount);
      
      const txHashes: string[] = [];
      
      // Create wallet instance with private key
      const wallet = new ethers.Wallet(gameWallet.privateKey, this.provider);
      
      // Send refunds to all players
      for (const playerAddress of playerAddresses) {
        const tx = await wallet.sendTransaction({
          to: playerAddress,
          value: refundAmount,
          gasLimit: 21000
        });

        const receipt = await tx.wait();
        
        if (receipt.status === 1) {
          console.log(`Refunded ${refundAmountEther} BNB to ${playerAddress} from game ${gameId}`);
          txHashes.push(tx.hash);
        } else {
          console.error(`Failed to refund to ${playerAddress}`);
        }
      }

      return txHashes;
    } catch (error) {
      console.error('Failed to refund all to players:', error);
      throw error;
    }
  }

  // Save wallet info to documentation file (Node.js only)
  private async saveWalletToFile(gameWallet: GamePoolWallet): Promise<void> {
    try {
      // Only save in Node.js environment
      if (typeof process === 'undefined' || typeof window !== 'undefined') {
        console.log('Skipping file save in browser environment');
        return;
      }

      const fs = await import('fs/promises');
      const path = await import('path');
      
      const filePath = path.join(process.cwd(), 'game-pool-wallets.md');
      const content = `# Game Pool Wallets

## Game ID: ${gameWallet.gameId}
- **Address**: \`${gameWallet.address}\`
- **Private Key**: \`${gameWallet.privateKey}\`
- **Created**: ${new Date(gameWallet.createdAt).toISOString()}
- **Status**: ${gameWallet.isActive ? 'Active' : 'Inactive'}

---

`;
      
      // Append to file
      await fs.appendFile(filePath, content);
      console.log(`Wallet info saved to ${filePath}`);
    } catch (error) {
      console.error('Failed to save wallet to file:', error);
      // Don't throw error as this is just documentation
    }
  }

  // Deactivate game pool wallet (after game ends)
  deactivateGamePoolWallet(gameId: string): void {
    const gameWallet = this.gameWallets.get(gameId);
    if (gameWallet) {
      gameWallet.isActive = false;
      console.log(`Deactivated game pool wallet for game ${gameId}`);
    }
  }
}
