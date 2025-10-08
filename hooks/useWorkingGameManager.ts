import { useState, useEffect, useCallback } from 'react';
import { useWallet } from './useWallet';
import { simpleGameService } from '../services/SimpleGameService';
import { XiangqiGame } from '../utils/xiangqiLogic';

export interface WorkingGameData {
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

export const useWorkingGameManager = () => {
  const { walletInfo } = useWallet();
  
  const [games, setGames] = useState<WorkingGameData[]>([]);
  const [currentGame, setCurrentGame] = useState<WorkingGameData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stakingStatus, setStakingStatus] = useState({
    isStaked: false,
    isStaking: false,
    error: null as string | null,
    success: null as string | null
  });

  // Load games from server
  const loadGames = useCallback(async () => {
    try {
      console.log('🔄 Loading games...');
      setIsLoading(true);
      const serverGames = await simpleGameService.getGames();
      setGames(serverGames);
      console.log(`🎮 Loaded ${serverGames.length} games`);
      return serverGames;
    } catch (error) {
      console.error('❌ Failed to load games:', error);
      setGames([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load games on mount and every 10 seconds
  useEffect(() => {
    loadGames();
    const interval = setInterval(loadGames, 10000);
    return () => clearInterval(interval);
  }, [loadGames]);

  // Create a new game
  const createGame = useCallback(async (gameData: {
    title: string;
    stakeAmount: number;
    isPrivate?: boolean;
    password?: string;
    maxPlayers?: number;
  }): Promise<WorkingGameData | null> => {
    if (!walletInfo.isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      console.log('🎮 Creating game:', gameData);
      setIsLoading(true);
      
      const newGame = await simpleGameService.createGame({
        ...gameData,
        host: walletInfo.address,
        maxPlayers: gameData.maxPlayers || 2,
        isPrivate: gameData.isPrivate || false
      });

      if (newGame) {
        setCurrentGame(newGame);
        await loadGames(); // Refresh games list
        console.log('🎮 Game created successfully:', newGame.id);
      }

      return newGame;
    } catch (error: any) {
      console.error('❌ Failed to create game:', error);
      throw new Error(error.message || 'Failed to create game');
    } finally {
      setIsLoading(false);
    }
  }, [walletInfo.isConnected, walletInfo.address, loadGames]);

  // Join a game
  const joinGame = useCallback(async (gameId: string): Promise<WorkingGameData | null> => {
    if (!walletInfo.isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      console.log(`👤 Joining game: ${gameId}`);
      const game = await simpleGameService.joinGame(gameId, walletInfo.address);
      
      if (game) {
        setCurrentGame(game);
        await loadGames(); // Refresh games list
        console.log('👤 Joined game successfully:', gameId);
      }
      
      return game;
    } catch (error: any) {
      console.error('❌ Failed to join game:', error);
      throw new Error(error.message || 'Failed to join game');
    }
  }, [walletInfo.isConnected, walletInfo.address, loadGames]);

  // Stake for a game (SIMPLIFIED - NO REAL BNB TRANSACTION)
  const stakeForGame = useCallback(async (gameId: string, amount: number): Promise<{ success: boolean; hash?: string; error?: string }> => {
    if (!walletInfo.isConnected) {
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      console.log(`💰 Staking ${amount} BNB for game ${gameId}`);
      setStakingStatus(prev => ({ ...prev, isStaking: true, error: null }));
      
      // Update game with stake (SIMULATED)
      const game = await simpleGameService.stakeForGame(gameId, amount, walletInfo.address);
      
      if (game) {
        setCurrentGame(game);
        await loadGames(); // Refresh games list
        
        setStakingStatus(prev => ({ 
          ...prev, 
          isStaked: true, 
          success: `Successfully staked ${amount} BNB`,
          isStaking: false 
        }));
        
        console.log(`✅ Staked successfully for game ${gameId}`);
        return { success: true, hash: `0x${Math.random().toString(16).substr(2, 64)}` };
      } else {
        throw new Error('Failed to stake for game');
      }
    } catch (error: any) {
      console.error('❌ Staking failed:', error);
      setStakingStatus(prev => ({ 
        ...prev, 
        error: error.message || 'Staking failed',
        isStaking: false 
      }));
      return { success: false, error: error.message || 'Staking failed' };
    }
  }, [walletInfo.isConnected, walletInfo.address, loadGames]);

  // Make a move in the current game
  const makeMove = useCallback(async (from: string, to: string) => {
    if (!currentGame) {
      throw new Error('No current game');
    }

    try {
      console.log(`♟️ Making move: ${from} -> ${to}`);
      const updatedGame = await simpleGameService.updateGame(currentGame.id, {
        moves: [...(currentGame.moves || []), { from, to, timestamp: Date.now() }]
      });
      
      if (updatedGame) {
        setCurrentGame(updatedGame);
        await loadGames(); // Refresh games list
      }
    } catch (error) {
      console.error('❌ Failed to make move:', error);
      throw error;
    }
  }, [currentGame, loadGames]);

  // Exit current game
  const exitGame = useCallback(() => {
    setCurrentGame(null);
    setStakingStatus({
      isStaked: false,
      isStaking: false,
      error: null,
      success: null
    });
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

  return {
    // State
    games,
    currentGame,
    isLoading,
    stakingStatus,
    
    // Actions
    createGame,
    joinGame,
    stakeForGame,
    makeMove,
    exitGame,
    getUserGames,
    getActiveGames,
    loadGames,
    
    // Setters
    setCurrentGame
  };
};
