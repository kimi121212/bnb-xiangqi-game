import { useState, useEffect, useCallback } from 'react';
import { useWallet } from './useWallet';
import { useBNBPools } from './useBNBPools';
import { simpleGameService } from '../services/SimpleGameService';
import { XiangqiGame } from '../utils/xiangqiLogic';
import { useBNBTransactions } from './useBNBTransactions';
import { walletManager } from '../utils/WalletManager';

export interface GameData {
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
  gameInstance?: XiangqiGame;
  poolAmount: number;
  poolWalletAddress?: string;
  stakeCount: number; // Track number of stakes (allows same wallet multiple times)
}

export interface GameMove {
  from: { x: number; y: number };
  to: { x: number; y: number };
  piece: string;
  capturedPiece?: string;
  timestamp: number;
  player: string;
}

export const useGameManager = () => {
  const { walletInfo } = useWallet();
  const { stakeBNB: realStakeBNB, refundBNB: realRefundBNB, claimWinnings, checkBalance } = useBNBTransactions();
  const { 
    createGamePool, 
    stakeToPool, 
    getPoolBalance, 
    withdrawWinnings, 
    refundToPlayer,
    refundAllPlayers,
    getGamePool,
    hasPlayerStaked,
    getPlayerStake,
    isLoading: poolLoading,
    error: poolError
  } = useBNBPools();
  const [games, setGames] = useState<GameData[]>([]);
  const [currentGame, setCurrentGame] = useState<GameData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stakingStatus, setStakingStatus] = useState<{
    isStaked: boolean;
    isStaking: boolean;
    isUnstaking: boolean;
    error?: string;
    success?: string;
  }>({
    isStaked: false,
    isStaking: false,
    isUnstaking: false
  });

  // Check if current player has staked in the current game
  const checkPlayerStaked = useCallback(async (gameId: string) => {
    if (!walletInfo.isConnected || !gameId) return false;
    
    try {
      const hasStaked = await hasPlayerStaked(gameId, walletInfo.address);
      return hasStaked;
    } catch (error) {
      console.error('Error checking player stake:', error);
      return false;
    }
  }, [walletInfo, hasPlayerStaked]);

  // Connect to server and subscribe to game updates
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const initializeServer = async () => {
      try {
        // Connect to simple game service
        await simpleGameService.connect();
        console.log('Connected to simple game service');

        // Subscribe to game updates
        unsubscribe = simpleGameService.subscribe((updatedGames) => {
          setGames(updatedGames);
          console.log('Games updated:', updatedGames.length);
          
          // Update current game if it's in the updated games
          if (currentGame) {
            const updatedCurrentGame = updatedGames.find(g => g.id === currentGame.id);
            if (updatedCurrentGame) {
              setCurrentGame(updatedCurrentGame);
              console.log('Current game updated');
            }
          }
        });

      } catch (error) {
        console.error('Failed to connect to game server:', error);
        console.log('Running in offline mode - games will be local only');
        // Fallback to empty games array - app will still work
        setGames([]);
      }
    };

    initializeServer();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      simpleGameService.disconnect();
    };
  }, [walletInfo.isConnected, walletInfo.address]);

  // No need for periodic refresh with simple service - it's already real-time

  // Update staking status when current game changes - SIMPLIFIED APPROACH
  useEffect(() => {
    const updateStakingStatus = () => {
      if (!currentGame || !walletInfo.isConnected) {
        setStakingStatus(prev => ({ ...prev, isStaked: false }));
        return;
      }

      // Check if player has actually staked (not just joined)
      const hasStaked = currentGame.stakeCount > 0 && currentGame.players.includes(walletInfo.address);
      setStakingStatus(prev => ({ ...prev, isStaked: hasStaked }));
      console.log(`Staking status updated: ${hasStaked} for game ${currentGame.id} (stakeCount: ${currentGame.stakeCount})`);
    };

    updateStakingStatus();
  }, [currentGame, walletInfo.isConnected, walletInfo.address]);

  // Auto-refresh staking status every 2 seconds for live updates
  useEffect(() => {
    if (!currentGame || !walletInfo.isConnected) return;

    const interval = setInterval(() => {
      // Check if player has actually staked (not just joined)
      const hasStaked = currentGame.stakeCount > 0 && currentGame.players.includes(walletInfo.address);
      setStakingStatus(prev => ({ ...prev, isStaked: hasStaked }));
    }, 2000);

    return () => clearInterval(interval);
  }, [currentGame, walletInfo.isConnected, walletInfo.address]);

  // Create a new game
  const createGame = useCallback(async (gameData: {
    title: string;
    stakeAmount: number;
    isPrivate: boolean;
    password?: string;
    maxPlayers?: number;
    host: string;
  }) => {
    if (!walletInfo.isConnected) {
      throw new Error('Wallet not connected');
    }

    // Check if user has sufficient balance
    const hasBalance = await checkBalance(gameData.stakeAmount);
    if (!hasBalance) {
      throw new Error(`Insufficient BNB balance. You need ${gameData.stakeAmount} BNB`);
    }

    setIsLoading(true);
    try {
      const gameId = `game_${Date.now()}`;
      
      // Create BNB pool for this specific game
      console.log('Creating BNB pool for game:', gameId);
      try {
        await createGamePool(gameId);
      } catch (poolError) {
        console.warn('Failed to create BNB pool, continuing without pool:', poolError);
        // Continue without pool for now - can be created later when staking
      }
      
      // Create wallet for this game immediately
      const poolWalletAddress = `pool_${gameId}_${Date.now()}`;
      
      // Create game - HOST IS NOT AUTOMATICALLY A PLAYER
      const newGame: GameData = {
        id: gameId,
        title: gameData.title,
        stakeAmount: gameData.stakeAmount,
        players: [], // Empty players array - host must stake to join
        maxPlayers: gameData.maxPlayers || 2,
        status: 'waiting',
        isPrivate: gameData.isPrivate,
        password: gameData.password,
        createdAt: Date.now(),
        host: gameData.host,
        spectators: 0,
        poolAmount: 0, // Will be updated when staked
        poolWalletAddress: poolWalletAddress, // Wallet created immediately
        stakeCount: 0, // Track number of stakes
        gameInstance: new XiangqiGame() // Add the game instance
      };

      // Create game using simple service
      const createdGame = simpleGameService.createGame({
        title: newGame.title,
        stakeAmount: newGame.stakeAmount,
        isPrivate: newGame.isPrivate,
        password: newGame.password,
        maxPlayers: newGame.maxPlayers,
        host: newGame.host
      });
      
      setCurrentGame(createdGame);
      // Reset staking status for new game
      setStakingStatus(prev => ({ ...prev, isStaked: false, isStaking: false, isUnstaking: false, error: undefined, success: undefined }));
      console.log('Game created:', createdGame.id);
      return createdGame;
    } catch (error: any) {
      console.error('Failed to create game:', error);
      const errorMessage = error.message || 'Failed to create game';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [walletInfo, checkBalance]);

  // Join an existing game
  const joinGame = useCallback(async (gameId: string, stakeAmount: number) => {
    if (!walletInfo.isConnected) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    try {
      const game = games.find(g => g.id === gameId);
      if (!game) {
        throw new Error('Game not found');
      }

      if (game.stakeAmount !== stakeAmount) {
        throw new Error(`Stake amount mismatch. Game requires ${game.stakeAmount} BNB`);
      }

      // Check if player is already in the game (allow re-entry)
      if (game.players.includes(walletInfo.address)) {
        console.log('Player already in game, allowing re-entry');
        // Allow re-entry - don't check if game is full
        const updatedGame = { ...game };
        if (!updatedGame.gameInstance) {
          updatedGame.gameInstance = new XiangqiGame();
        }
        setCurrentGame(updatedGame);
        console.log('Successfully rejoined game:', updatedGame.id);
        return updatedGame;
      }

      // Only check if game is full for NEW players
      if (game.players.length >= game.maxPlayers) {
        throw new Error('Game is full');
      }

      // Check balance
      const hasBalance = await checkBalance(stakeAmount);
      if (!hasBalance) {
        throw new Error(`Insufficient BNB balance. You need ${stakeAmount} BNB`);
      }

      console.log('Joining game:', gameId, 'with stake:', stakeAmount);
      
      // Join game using simple service
      const updatedGame = simpleGameService.joinGame(gameId, walletInfo.address);
      setCurrentGame(updatedGame);
      console.log('Successfully joined game:', updatedGame.id);
      return updatedGame;
    } catch (error) {
      console.error('Failed to join game:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [walletInfo, games]);

  // Join private game with password
  const joinPrivateGame = useCallback(async (gameId: string, password: string, stakeAmount: number) => {
    if (!walletInfo.isConnected) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    try {
      return await serverGameService.joinPrivateGame(gameId, walletInfo.address, password);
    } catch (error) {
      console.error('Failed to join private game:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [walletInfo, joinGame]);

  // Watch a game (spectator mode)
  const watchGame = useCallback(async (gameId: string) => {
    const updatedGame = await serverGameService.watchGame(gameId);
    // Ensure the game has a game instance
    if (!updatedGame.gameInstance) {
      updatedGame.gameInstance = new XiangqiGame();
    }
    setCurrentGame(updatedGame);
    return updatedGame;
  }, []);

  // Make a move in the current game
  const makeMove = useCallback(async (from: { x: number; y: number }, to: { x: number; y: number }) => {
    if (!currentGame || !walletInfo.isConnected) {
      throw new Error('No active game or wallet not connected');
    }

    if (currentGame.status !== 'active') {
      throw new Error('Game is not active');
    }

    // TODO: Implement smart contract interaction for moves
    // For now, simulate move
    console.log('Making move:', { from, to, player: walletInfo.address });
    
    return true;
  }, [currentGame, walletInfo]);

  // Exit current game
  const exitGame = useCallback(() => {
    setCurrentGame(null);
  }, []);

  // Get available games (non-private, waiting for players)
  const getAvailableGames = useCallback(async () => {
    return await serverGameService.getAvailableGames();
  }, []);

  // Get active games (for spectators)
  const getActiveGames = useCallback(async () => {
    return await serverGameService.getActiveGames();
  }, []);

  // Get user's games
  const getUserGames = useCallback(() => {
    if (!walletInfo.isConnected) return [];
    
    return games.filter(game => 
      game.players.includes(walletInfo.address) || game.host === walletInfo.address
    );
  }, [walletInfo, games]);

  // Check if user can join a game
  const canJoinGame = useCallback((gameId: string) => {
    if (!walletInfo.isConnected) return false;
    
    const game = games.find(g => g.id === gameId);
    if (!game) return false;
    
    // Allow joining if game is waiting and not full, or if user is already in the game (re-entry)
    return game.status === 'waiting' && 
           (game.players.length < game.maxPlayers || game.players.includes(walletInfo.address));
  }, [walletInfo]);

  // Check if user is already in a game
  const isUserInGame = useCallback((gameId: string) => {
    if (!walletInfo.isConnected) return false;
    
    const game = games.find(g => g.id === gameId);
    if (!game) return false;
    
    return game.players.includes(walletInfo.address);
  }, [walletInfo, games]);

  // Check if user can watch a game
  const canWatchGame = useCallback((gameId: string) => {
    const game = games.find(g => g.id === gameId);
    if (!game) return false;
    
    return game.status === 'active' || game.status === 'waiting';
  }, []);

  // Stake BNB for a game - REAL BNB TRANSACTIONS
  const stakeForGame = useCallback(async (gameId: string, amount: number) => {
    if (!walletInfo.isConnected) {
      throw new Error('Wallet not connected');
    }

    setStakingStatus(prev => ({ ...prev, isStaking: true, error: undefined }));
    
    try {
      console.log(`Staking ${amount} BNB for game ${gameId}`);
      
      // Get current game state from simple service
      const game = simpleGameService.getGameById(gameId);
      if (!game) {
        throw new Error('Game not found');
      }

      // For multi-browser support, allow same wallet to stake multiple times
      // Only prevent staking if the game is already full (2 players)
      if (game.players.length >= game.maxPlayers && !game.players.includes(walletInfo.address)) {
        throw new Error('Game is full');
      }
      
      // If player already staked, allow them to stake again (multi-browser support)
      if (game.players.includes(walletInfo.address)) {
        console.log('Player already staked, allowing additional stake for multi-browser support');
      }

      // Create or get game wallet
      const gameWallet = walletManager.createGameWallet(gameId);
      const poolWalletAddress = gameWallet.address;
      console.log('Using game wallet address:', poolWalletAddress);

      // Perform REAL BNB transaction
      console.log(`Sending ${amount} BNB to pool wallet: ${poolWalletAddress}`);
      const stakingResult = await realStakeBNB(amount, poolWalletAddress);
      
      console.log('Staking result:', stakingResult);
      
      if (!stakingResult.success) {
        console.error('Staking failed:', stakingResult.error);
        throw new Error(stakingResult.error || 'Staking transaction failed');
      }
      
      if (!stakingResult.hash) {
        console.error('No transaction hash returned from staking');
        throw new Error('No transaction hash returned from staking');
      }

      console.log('BNB transaction successful:', stakingResult.hash);

      // Update game state after successful transaction
      const newPoolAmount = game.poolAmount + amount;
      const newStakeCount = (game.stakeCount || 0) + 1;
      // Only add player to array if they're not already there
      const newPlayers = game.players.includes(walletInfo.address) 
        ? game.players 
        : [...game.players, walletInfo.address];

      console.log(`Updated game state: Pool: ${newPoolAmount} BNB, Stakes: ${newStakeCount}, Players: ${newPlayers.length}`);
      
      // Update local game state
      setGames(prevGames => 
        prevGames.map(g => 
          g.id === gameId 
            ? { 
                ...g, 
                poolAmount: newPoolAmount,
                players: newPlayers,
                stakeCount: newStakeCount,
                poolWalletAddress: poolWalletAddress
              }
            : g
        )
      );
      
      // Update current game if it's the same game
      if (currentGame && currentGame.id === gameId) {
        setCurrentGame(prev => prev ? { 
          ...prev, 
          poolAmount: newPoolAmount,
          players: newPlayers,
          stakeCount: newStakeCount,
          poolWalletAddress: poolWalletAddress
        } : null);
      }

      // Update server with new pool amount and players
      console.log(`Updating server pool amount: ${newPoolAmount} BNB for game ${gameId}`);
      await serverGameService.updatePoolAmount(gameId, newPoolAmount);
      
      // Check if game is ready to start (2 stakes total, allows same wallet)
      if (newStakeCount >= 2) {
        console.log('Game ready to start - 2 stakes completed');
        await serverGameService.updateGameStatus(gameId, 'active');
        setGames(prevGames => 
          prevGames.map(g => 
            g.id === gameId ? { ...g, status: 'active' } : g
          )
        );
        if (currentGame && currentGame.id === gameId) {
          setCurrentGame(prev => prev ? { ...prev, status: 'active' } : null);
        }
      }
      
      const successMessage = `Successfully staked ${amount} BNB! TX: ${stakingResult.hash} | Pool: ${newPoolAmount} BNB`;
      console.log('Setting success message:', successMessage);
      
      setStakingStatus(prev => ({ 
        ...prev, 
        isStaked: true, 
        isStaking: false,
        success: successMessage
      }));
      
      console.log(`Staking successful: ${amount} BNB added to game ${gameId}`);
      return { success: true, txHash: stakingResult.hash, poolWalletAddress };
    } catch (error: any) {
      console.error('Staking error:', error);
      setStakingStatus(prev => ({ 
        ...prev, 
        isStaking: false, 
        error: error.message 
      }));
      throw error;
    }
  }, [walletInfo, games, currentGame, createGamePool, realStakeBNB]);

  // Send winnings to winner
  const sendWinningsToWinner = useCallback(async (gameId: string, winnerAddress: string) => {
    if (!walletInfo.provider) {
      throw new Error('Provider not available');
    }

    try {
      const game = simpleGameService.getGameById(gameId);
      if (!game) {
        throw new Error('Game not found');
      }

      const totalPool = game.poolAmount || 0;
      if (totalPool <= 0) {
        throw new Error('No winnings to send');
      }

      console.log(`Sending ${totalPool} BNB to winner ${winnerAddress} from game ${gameId}`);
      
      const result = await walletManager.sendToWinner(gameId, winnerAddress, totalPool, walletInfo.provider, false); // false = mainnet
      
      if (result.success) {
        console.log(`Successfully sent winnings to winner: ${result.hash}`);
        return result;
      } else {
        throw new Error(result.error || 'Failed to send winnings');
      }
    } catch (error: any) {
      console.error('Error sending winnings:', error);
      throw error;
    }
  }, [walletInfo.provider]);

  // Get game wallet balance
  const getGameWalletBalance = useCallback(async (gameId: string) => {
    if (!walletInfo.provider) {
      return 0;
    }

    try {
      return await walletManager.getWalletBalance(gameId, walletInfo.provider, false); // false = mainnet
    } catch (error) {
      console.error('Error getting game wallet balance:', error);
      return 0;
    }
  }, [walletInfo.provider]);


  // Claim winnings
  const claimGameWinnings = useCallback(async (gameId: string) => {
    if (!walletInfo.isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      // Withdraw winnings from the BNB pool to winner's wallet
      const txHash = await withdrawWinnings(gameId, walletInfo.address);
      
      setStakingStatus(prev => ({ 
        ...prev, 
        success: 'Winnings claimed successfully from BNB pool!'
      }));
      
      return { success: true, txHash };
    } catch (error: any) {
      setStakingStatus(prev => ({ 
        ...prev, 
        error: error.message 
      }));
      throw error;
    }
  }, [walletInfo, withdrawWinnings]);

  // End game and refund all players
  const endGameWithRefunds = useCallback(async (gameId: string) => {
    if (!walletInfo.isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const game = games.find(g => g.id === gameId);
      if (!game) {
        throw new Error('Game not found');
      }

      // Refund all players
      const txHashes = await refundAllPlayers(gameId, game.players);
      
      // Update game status on server
      serverGameService.updateGameStatus(gameId, 'finished');
      
      console.log(`Game ${gameId} ended with refunds:`, txHashes);
      return { success: true, txHashes };
    } catch (error: any) {
      console.error('Failed to end game with refunds:', error);
      throw error;
    }
  }, [walletInfo, refundAllPlayers]);

  return {
    games,
    currentGame,
    setCurrentGame,
    isLoading,
    stakingStatus,
    createGame,
    joinGame,
    joinPrivateGame,
    watchGame,
    makeMove,
    exitGame,
    stakeForGame,
    claimGameWinnings,
    endGameWithRefunds,
    getAvailableGames,
    getActiveGames,
    getUserGames,
    canJoinGame,
    canWatchGame,
    isUserInGame,
    sendWinningsToWinner,
    getGameWalletBalance
  };
};
