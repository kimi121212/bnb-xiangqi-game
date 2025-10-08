import { useState, useEffect, useCallback } from 'react';
import { useWallet } from './useWallet';
import { useBNBPools } from './useBNBPools';
import { serverGameService } from '../services/ServerGameService';
import { XiangqiGame } from '../utils/xiangqiLogic';
import { useBNBTransactions } from './useBNBTransactions';
import { clientWalletManager } from '../utils/ClientWalletManager';

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
        // Connect to server game service
        await serverGameService.connect();
        console.log('Connected to server game service');

        // Load initial games from server
        const initialGames = await serverGameService.getGames();
        setGames(initialGames);
        console.log('Loaded games from server:', initialGames.length);

        // Subscribe to game updates
        unsubscribe = serverGameService.subscribe((updatedGames) => {
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
      serverGameService.disconnect();
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

      // Create game using server service
      const createdGame = await serverGameService.createGame({
        title: newGame.title,
        stakeAmount: newGame.stakeAmount,
        isPrivate: newGame.isPrivate,
        password: newGame.password,
        maxPlayers: newGame.maxPlayers,
        host: newGame.host
      });
      
      if (!createdGame) {
        throw new Error('Failed to create game on server');
      }
      
      console.log('Game created on server:', createdGame.id);
      
      // Wait a moment for server to process the game
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify the game was created by fetching it from server
      try {
        const allGames = await serverGameService.getGames();
        const verifiedGame = allGames.find(g => g.id === createdGame.id);
        if (verifiedGame) {
          console.log('Game verified on server:', verifiedGame.id);
          setCurrentGame(verifiedGame);
        } else {
          console.warn('Game not found on server after creation, using created game');
          setCurrentGame(createdGame);
        }
      } catch (verifyError) {
        console.warn('Could not verify game on server:', verifyError);
        setCurrentGame(createdGame);
      }
      
      // Reset staking status for new game
      setStakingStatus(prev => ({ ...prev, isStaked: false, isStaking: false, isUnstaking: false, error: undefined, success: undefined }));
      console.log('Game created and verified:', createdGame.id);
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
      
      // Join game using server service
      const updatedGame = await serverGameService.joinGame(gameId, walletInfo.address);
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
      // Use simple game service for private game joining
      const game = simpleGameService.getGameById(gameId);
      if (!game) {
        throw new Error('Game not found');
      }
      
      if (game.password !== password) {
        throw new Error('Invalid password');
      }
      
      return simpleGameService.joinGame(gameId, walletInfo.address);
    } catch (error) {
      console.error('Failed to join private game:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [walletInfo, joinGame]);

  // Watch a game (spectator mode)
  const watchGame = useCallback(async (gameId: string) => {
    const updatedGame = simpleGameService.getGameById(gameId);
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
    return simpleGameService.getGames().filter(game => game.status === 'waiting' && !game.isPrivate);
  }, []);

  // Get active games (for spectators)
  const getActiveGames = useCallback(async () => {
    return simpleGameService.getGames().filter(game => game.status === 'active');
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
      
      // Refresh games list to ensure we have latest state
      try {
        const refreshedGames = await serverGameService.getGames();
        setGames(refreshedGames);
        console.log('Refreshed games list:', refreshedGames.length, 'games');
      } catch (refreshError) {
        console.warn('Failed to refresh games list:', refreshError);
      }
      
      // Get current game state from server service with fallback
      let game = null;
      try {
        const allGames = await serverGameService.getGames();
        game = allGames.find(g => g.id === gameId);
        console.log('Game lookup from server:', game ? 'Found' : 'Not found');
        
        // If not found on server, try local games as fallback
        if (!game) {
          console.log('Game not found on server, checking local games...');
          game = games.find(g => g.id === gameId);
          console.log('Game lookup from local:', game ? 'Found' : 'Not found');
          
          // If found locally but not on server, this might be a sync issue
          if (game) {
            console.warn('Game found locally but not on server - possible sync issue');
          }
        }
      } catch (serverError) {
        console.warn('Server game lookup failed, trying local games:', serverError);
        // Fallback to local games
        game = games.find(g => g.id === gameId);
        console.log('Game lookup from local:', game ? 'Found' : 'Not found');
      }
      
      if (!game) {
        console.error('Game not found in both server and local state:', gameId);
        console.log('Available games:', games.map(g => ({ id: g.id, title: g.title })));
        
        // Try one more time with a fresh server call
        try {
          console.log('Attempting final server lookup...');
          const finalGames = await serverGameService.getGames();
          game = finalGames.find(g => g.id === gameId);
          if (game) {
            console.log('Game found on final attempt');
          }
        } catch (finalError) {
          console.error('Final lookup failed:', finalError);
        }
        
        if (!game) {
          throw new Error(`Game not found: ${gameId}. Please refresh the page and try again.`);
        }
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
      const gameWallet = clientWalletManager.createGameWallet(gameId);
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

      // IMMEDIATELY update game state when user confirms transaction
      // Don't wait for blockchain confirmation - update immediately
      const newPoolAmount = game.poolAmount + amount;
      const newStakeCount = (game.stakeCount || 0) + 1;
      // Allow same player to stake twice for self-play
      const newPlayers = [...game.players, walletInfo.address];

      console.log(`IMMEDIATELY updating game state: Pool: ${newPoolAmount} BNB, Stakes: ${newStakeCount}, Players: ${newPlayers.length}`);
      
      // IMMEDIATELY update local game state for instant UI feedback
      setGames(prevGames => 
        prevGames.map(g => 
          g.id === gameId 
            ? { 
                ...g, 
                poolAmount: newPoolAmount,
                players: newPlayers,
                stakeCount: newStakeCount,
                poolWalletAddress: poolWalletAddress,
                status: newStakeCount >= 2 ? 'active' : 'waiting'
              }
            : g
        )
      );

      // Also update current game immediately if it's the same game
      if (currentGame && currentGame.id === gameId) {
        const updatedCurrentGame = {
          ...currentGame,
          poolAmount: newPoolAmount,
          stakeCount: newStakeCount,
          players: newPlayers,
          status: newStakeCount >= 2 ? 'active' : 'waiting'
        };
        setCurrentGame(updatedCurrentGame);
      } else if (!currentGame) {
        // If no current game is set, set it to the game we just staked in
        console.log('Setting current game to staked game:', gameId);
        setCurrentGame({
          ...game,
          poolAmount: newPoolAmount,
          stakeCount: newStakeCount,
          players: newPlayers,
          status: newStakeCount >= 2 ? 'active' : 'waiting'
        });
      }

      // Start background verification of the transaction
      setTimeout(async () => {
        try {
          if (!walletInfo.provider) {
            console.warn('No provider available for transaction verification');
            return;
          }
          
          console.log(`Verifying transaction ${stakingResult.hash} on BSC...`);
          const receipt = await walletInfo.provider.getTransactionReceipt(stakingResult.hash);
          if (receipt && receipt.status === 1) {
            console.log(`✅ Transaction confirmed on BSC: ${stakingResult.hash}`);
          } else {
            console.warn(`⚠️ Transaction may have failed: ${stakingResult.hash}`);
          }
        } catch (error) {
          console.error(`❌ Error verifying transaction: ${error}`);
        }
      }, 5000); // Check after 5 seconds

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
      
      const result = await clientWalletManager.sendToWinner(gameId, winnerAddress, totalPool, walletInfo.provider);
      
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
      return await clientWalletManager.getWalletBalance(gameId, walletInfo.provider);
    } catch (error) {
      console.error('Error getting game wallet balance:', error);
      return 0;
    }
  }, [walletInfo.provider]);

  // Monitor game wallet for incoming BNB and update stake automatically
  const monitorGameWallet = useCallback(async (gameId: string) => {
    if (!walletInfo.provider) {
      console.log('No provider available for wallet monitoring');
      return;
    }

    try {
      const allGames = await serverGameService.getGames();
      const game = allGames.find(g => g.id === gameId);
      if (!game) {
        console.log('Game not found for monitoring:', gameId);
        return;
      }

      // Get current wallet balance
      const currentBalance = await clientWalletManager.getWalletBalance(gameId, walletInfo.provider);
      console.log(`Game ${gameId} wallet balance: ${currentBalance} BNB`);

      // If wallet has BNB but game pool amount is 0, update the game state
      if (currentBalance > 0 && game.poolAmount === 0) {
        console.log(`Detected BNB in game wallet, updating game state...`);
        
        // Update game with the wallet balance
        await serverGameService.updatePoolAmount(gameId, currentBalance);
        
        console.log(`Game ${gameId} updated with ${currentBalance} BNB from wallet`);
        // Trigger a refresh of the games list
        setGames(prev => [...prev]);
      }
    } catch (error) {
      console.error('Error monitoring game wallet:', error);
    }
  }, [walletInfo.provider, setGames]);

  // Auto-monitor wallet when game is active
  useEffect(() => {
    if (currentGame && walletInfo.provider) {
      // Monitor immediately
      monitorGameWallet(currentGame.id);
      
      // Set up periodic monitoring every 3 seconds for faster detection
      const interval = setInterval(() => {
        monitorGameWallet(currentGame.id);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [currentGame, walletInfo.provider, monitorGameWallet]);


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
      await serverGameService.updateGameStatus(gameId, 'finished');
      
      console.log(`Game ${gameId} ended with refunds:`, txHashes);
      return { success: true, txHashes };
    } catch (error: any) {
      console.error('Failed to end game with refunds:', error);
      throw error;
    }
  }, [walletInfo, refundAllPlayers]);

  // Leave current game
  const leaveCurrentGame = useCallback(() => {
    setCurrentGame(null);
    setStakingStatus(prev => ({ ...prev, isStaked: false, isStaking: false, isUnstaking: false, error: undefined, success: undefined }));
    console.log('Left current game');
  }, []);

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
    getGameWalletBalance,
    leaveCurrentGame
  };
};
