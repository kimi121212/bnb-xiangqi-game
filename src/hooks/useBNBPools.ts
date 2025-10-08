import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import { GamePoolWalletManager, GamePoolWallet } from '../contracts/GamePoolWallet';

export interface GamePoolData {
  gameId: string;
  poolAddress: string;
  totalStaked: number;
  playerStakes: {
    [playerAddress: string]: number;
  };
  isActive: boolean;
  winner?: string;
}

export const useBNBPools = () => {
  const { walletInfo, provider, signer } = useWallet();
  const [poolManager, setPoolManager] = useState<GamePoolWalletManager | null>(null);
  const [gamePools, setGamePools] = useState<Map<string, GamePoolData>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize pool manager when wallet connects
  useEffect(() => {
    if (provider && signer && walletInfo.isConnected) {
      const manager = new GamePoolWalletManager(provider, signer);
      setPoolManager(manager);
      console.log('BNB Pool Manager initialized');
    }
  }, [provider, signer, walletInfo.isConnected]);

  // Create a new game pool
  const createGamePool = useCallback(async (gameId: string): Promise<GamePoolData> => {
    if (!poolManager) {
      throw new Error('Pool manager not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create game pool wallet
      const gameWallet = await poolManager.createGamePoolWallet(gameId);
      
      const poolData: GamePoolData = {
        gameId,
        poolAddress: gameWallet.address,
        totalStaked: 0,
        playerStakes: {},
        isActive: true
      };

      setGamePools(prev => new Map(prev.set(gameId, poolData)));
      
      console.log(`Created BNB pool for game ${gameId}:`, gameWallet.address);
      return poolData;
    } catch (error: any) {
      console.error('Failed to create game pool:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [poolManager]);

  // Stake BNB to a game pool
  const stakeToPool = useCallback(async (gameId: string, amount: number, playerAddress: string): Promise<string> => {
    if (!poolManager) {
      throw new Error('Pool manager not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Ensure game pool exists
      if (!gamePools.has(gameId)) {
        await createGamePool(gameId);
      }

      // Stake BNB to the pool
      const txHash = await poolManager.stakeToGamePool(gameId, amount.toString());
      
      // Update pool data
      setGamePools(prev => {
        const newPools = new Map(prev);
        const pool = newPools.get(gameId);
        if (pool) {
          pool.playerStakes[playerAddress] = (pool.playerStakes[playerAddress] || 0) + amount;
          pool.totalStaked += amount;
        }
        return newPools;
      });

      console.log(`Staked ${amount} BNB to game ${gameId} pool`);
      return txHash;
    } catch (error: any) {
      console.error('Failed to stake to pool:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [poolManager, gamePools, createGamePool]);

  // Get pool balance
  const getPoolBalance = useCallback(async (gameId: string): Promise<number> => {
    if (!poolManager) {
      throw new Error('Pool manager not initialized');
    }

    try {
      const balance = await poolManager.getGamePoolBalance(gameId);
      return parseFloat(balance);
    } catch (error: any) {
      console.error('Failed to get pool balance:', error);
      throw error;
    }
  }, [poolManager]);

  // Withdraw winnings to winner
  const withdrawWinnings = useCallback(async (gameId: string, winnerAddress: string): Promise<string> => {
    if (!poolManager) {
      throw new Error('Pool manager not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      const txHash = await poolManager.withdrawWinnings(gameId, winnerAddress);
      
      // Update pool data
      setGamePools(prev => {
        const newPools = new Map(prev);
        const pool = newPools.get(gameId);
        if (pool) {
          pool.isActive = false;
          pool.winner = winnerAddress;
        }
        return newPools;
      });

      console.log(`Withdrew winnings from game ${gameId} to ${winnerAddress}`);
      return txHash;
    } catch (error: any) {
      console.error('Failed to withdraw winnings:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [poolManager]);

  // Refund BNB to player (unstaking)
  const refundToPlayer = useCallback(async (gameId: string, playerAddress: string, amount: number): Promise<string> => {
    if (!poolManager) {
      throw new Error('Pool manager not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      const txHash = await poolManager.refundToPlayer(gameId, playerAddress, amount.toString());
      
      // Update pool data
      setGamePools(prev => {
        const newPools = new Map(prev);
        const pool = newPools.get(gameId);
        if (pool) {
          pool.totalStaked -= amount;
          pool.playerStakes[playerAddress] = Math.max(0, (pool.playerStakes[playerAddress] || 0) - amount);
        }
        return newPools;
      });

      console.log(`Refunded ${amount} BNB to ${playerAddress} from game ${gameId}`);
      return txHash;
    } catch (error: any) {
      console.error('Failed to refund to player:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [poolManager]);

  // Refund all players (game end)
  const refundAllPlayers = useCallback(async (gameId: string, playerAddresses: string[]): Promise<string[]> => {
    if (!poolManager) {
      throw new Error('Pool manager not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      const txHashes = await poolManager.refundAllToPlayers(gameId, playerAddresses);
      
      // Update pool data
      setGamePools(prev => {
        const newPools = new Map(prev);
        const pool = newPools.get(gameId);
        if (pool) {
          pool.isActive = false;
          pool.totalStaked = 0;
          pool.playerStakes = {};
        }
        return newPools;
      });

      console.log(`Refunded all players from game ${gameId}`);
      return txHashes;
    } catch (error: any) {
      console.error('Failed to refund all players:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [poolManager]);

  // Get game pool data
  const getGamePool = useCallback((gameId: string): GamePoolData | null => {
    return gamePools.get(gameId) || null;
  }, [gamePools]);

  // Check if player has staked in a game
  const hasPlayerStaked = useCallback((gameId: string, playerAddress: string): boolean => {
    const pool = gamePools.get(gameId);
    return pool ? (pool.playerStakes[playerAddress] || 0) > 0 : false;
  }, [gamePools]);

  // Get player's stake amount
  const getPlayerStake = useCallback((gameId: string, playerAddress: string): number => {
    const pool = gamePools.get(gameId);
    return pool ? (pool.playerStakes[playerAddress] || 0) : 0;
  }, [gamePools]);

  // Get all active pools
  const getActivePools = useCallback((): GamePoolData[] => {
    return Array.from(gamePools.values()).filter(pool => pool.isActive);
  }, [gamePools]);

  // Deactivate game pool
  const deactivateGamePool = useCallback((gameId: string): void => {
    setGamePools(prev => {
      const newPools = new Map(prev);
      const pool = newPools.get(gameId);
      if (pool) {
        pool.isActive = false;
      }
      return newPools;
    });
  }, []);

  return {
    createGamePool,
    stakeToPool,
    getPoolBalance,
    withdrawWinnings,
    refundToPlayer,
    refundAllPlayers,
    getGamePool,
    hasPlayerStaked,
    getPlayerStake,
    getActivePools,
    deactivateGamePool,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};
