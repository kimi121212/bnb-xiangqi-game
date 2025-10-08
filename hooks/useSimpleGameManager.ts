import { useState, useEffect, useCallback } from 'react';
import { useWallet } from './useWallet';
import { useSimpleStaking } from './useSimpleStaking';
import { serverGameService } from '../services/ServerGameService';
import { XiangqiGame } from '../utils/xiangqiLogic';

export interface SimpleGameData {
  id: string;
  title: string;
  stakeAmount: number;
  players: string[];
  maxPlayers: number;
  status: 'waiting' | 'active' | 'finished';
  isPrivate: boolean;
  password?: string;
  createdAt: number;
  host: string;
  spectators: number;
  poolAmount: number;
  stakeCount: number;
  gameInstance?: XiangqiGame;
}

export const useSimpleGameManager = () => {
  const { walletInfo } = useWallet();
  const { stakeBNB, hasStaked, isLoading: isStaking, error: stakingError, success: stakingSuccess } = useSimpleStaking();
  
  const [games, setGames] = useState<SimpleGameData[]>([]);
  const [currentGame, setCurrentGame] = useState<SimpleGameData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load games from server
  useEffect(() => {
    const loadGames = async () => {
      try {
        setIsLoading(true);
        const serverGames = await serverGameService.getGames();
        setGames(serverGames);
        console.log('🎮 Loaded games:', serverGames.length);
        console.log('🎮 Games data:', serverGames);
      } catch (error) {
        console.error('Failed to load games:', error);
        setGames([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadGames();
    
    // Refresh games every 5 seconds
    const interval = setInterval(loadGames, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Create a new game
  const createGame = useCallback(async (gameData: {
    title: string;
    stakeAmount: number;
    isPrivate?: boolean;
    password?: string;
    maxPlayers?: number;
  }): Promise<SimpleGameData | null> => {
    if (!walletInfo.isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoading(true);
      
      const newGame = await serverGameService.createGame({
        ...gameData,
        host: walletInfo.address,
        maxPlayers: gameData.maxPlayers || 2,
        isPrivate: gameData.isPrivate || false
      });

      if (newGame) {
        setCurrentGame(newGame);
        setGames(prev => [...prev, newGame]);
        console.log('🎮 Game created:', newGame.id);
      }

      return newGame;
    } catch (error: any) {
      console.error('Failed to create game:', error);
      throw new Error(error.message || 'Failed to create game');
    } finally {
      setIsLoading(false);
    }
  }, [walletInfo.isConnected, walletInfo.address]);

  // Join a game
  const joinGame = useCallback(async (gameId: string): Promise<SimpleGameData | null> => {
    if (!walletInfo.isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const game = await serverGameService.joinGame(gameId, walletInfo.address);
      if (game) {
        setCurrentGame(game);
        setGames(prev => prev.map(g => g.id === gameId ? game : g));
        console.log('🎮 Joined game:', gameId);
      }
      return game;
    } catch (error: any) {
      console.error('Failed to join game:', error);
      throw new Error(error.message || 'Failed to join game');
    }
  }, [walletInfo.isConnected, walletInfo.address]);

  // Stake for a game
  const stakeForGame = useCallback(async (gameId: string, amount: number): Promise<{ success: boolean; hash?: string; error?: string }> => {
    if (!walletInfo.isConnected) {
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      console.log(`💰 Staking ${amount} BNB for game ${gameId}`);
      
      // Use simple staking
      const result = await stakeBNB(amount, gameId);
      
      if (result.success) {
        // Update game pool amount
        await serverGameService.updatePoolAmount(gameId, amount);
        
        // Update local game state
        setGames(prev => prev.map(game => 
          game.id === gameId 
            ? { 
                ...game, 
                poolAmount: game.poolAmount + amount,
                stakeCount: game.stakeCount + 1,
                players: [...game.players, walletInfo.address]
              }
            : game
        ));

        // Update current game if it's the same
        if (currentGame && currentGame.id === gameId) {
          setCurrentGame(prev => prev ? {
            ...prev,
            poolAmount: prev.poolAmount + amount,
            stakeCount: prev.stakeCount + 1,
            players: [...prev.players, walletInfo.address]
          } : null);
        }

        console.log(`✅ Successfully staked ${amount} BNB for game ${gameId}`);
      }

      return result;
    } catch (error: any) {
      console.error('Staking failed:', error);
      return { success: false, error: error.message || 'Staking failed' };
    }
  }, [walletInfo.isConnected, walletInfo.address, stakeBNB, currentGame]);

  // Make a move in the current game
  const makeMove = useCallback(async (from: string, to: string) => {
    if (!currentGame) {
      throw new Error('No current game');
    }

    try {
      // Add move to server
      await serverGameService.addMove(currentGame.id, { from, to });
      
      // Update local game state
      setCurrentGame(prev => {
        if (!prev) return null;
        return {
          ...prev,
          moves: [...(prev.moves || []), { from, to, timestamp: Date.now() }]
        };
      });

      console.log(`♟️ Move made: ${from} -> ${to}`);
    } catch (error) {
      console.error('Failed to make move:', error);
      throw error;
    }
  }, [currentGame]);

  // Exit current game
  const exitGame = useCallback(() => {
    setCurrentGame(null);
    console.log('🎮 Exited current game');
  }, []);

  // Get user's games
  const getUserGames = useCallback(() => {
    if (!walletInfo.isConnected) return [];
    return games.filter(game => 
      game.players.includes(walletInfo.address) || game.host === walletInfo.address
    );
  }, [games, walletInfo.isConnected, walletInfo.address]);

  // Get active games
  const getActiveGames = useCallback(() => {
    return games.filter(game => game.status === 'active');
  }, [games]);

  // Manual refresh games
  const refreshGames = useCallback(async () => {
    try {
      setIsLoading(true);
      const serverGames = await serverGameService.getGames();
      setGames(serverGames);
      console.log('🔄 Refreshed games:', serverGames.length);
      return serverGames;
    } catch (error) {
      console.error('Failed to refresh games:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // State
    games,
    currentGame,
    isLoading,
    isStaking,
    stakingError,
    stakingSuccess,
    
    // Actions
    createGame,
    joinGame,
    stakeForGame,
    makeMove,
    exitGame,
    getUserGames,
    getActiveGames,
    refreshGames,
    
    // Setters
    setCurrentGame
  };
};
