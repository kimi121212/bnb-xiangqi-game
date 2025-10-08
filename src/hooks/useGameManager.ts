import { useState, useEffect, useCallback } from 'react';
import { useWallet } from './useWallet';
import { useBNBPools } from './useBNBPools';
import { serverGameService } from '../services/ServerGameService';
import { XiangqiGame } from '../utils/xiangqiLogic';
import { useBNBTransactions } from './useBNBTransactions';

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

  // Check if current player has staked in the current game (SIMPLE CHECK)
  const checkPlayerStaked = useCallback(async (gameId: string) => {
    if (!walletInfo.isConnected || !gameId) return false;

    try {
      // Find the game
      const game = games.find(g => g.id === gameId);
      if (!game) return false;

      // Check if player is in the players array (they have staked)
      const hasStaked = game.players.includes(walletInfo.address);
      console.log(`Player ${walletInfo.address} staked in game ${gameId}: ${hasStaked}`);
      return hasStaked;
    } catch (error) {
      console.error('Error checking player stake:', error);
      return false;
    }
  }, [walletInfo, games]);

  // Connect to server and subscribe to game updates (separate from wallet connection)
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const initializeServer = async () => {
      try {
        // Connect to server (with fallback to HTTP-only mode)
        await serverGameService.connect();
        console.log('Connected to game server');

        // Subscribe to game updates with live data refresh
        unsubscribe = serverGameService.subscribe((updatedGames) => {
          console.log('Games updated from server:', updatedGames.length);
          console.log('Updated games data:', updatedGames.map(g => ({ id: g.id, title: g.title, players: g.players.length })));

          setGames(updatedGames);

          // Update current game if it's in the updated games
          if (currentGame) {
            const updatedCurrentGame = updatedGames.find(g => g.id === currentGame.id);
            if (updatedCurrentGame) {
              setCurrentGame(updatedCurrentGame);
              console.log('Current game updated with live data');
            }
          }
        });

        // Load initial games from server
        const initialGames = await serverGameService.getAllGames();
        console.log('Loaded initial games from server:', initialGames.length);
        console.log('Initial games:', initialGames.map(g => ({
          id: g.id,
          title: g.title,
          players: g.players.length,
          poolWalletAddress: g.poolWalletAddress
        })));
        setGames(initialGames);

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
      // No WebSocket disconnect needed for HTTP-only mode
    };
  }, []); // Remove wallet dependencies - server connection is independent

  // Handle wallet connection changes separately
  useEffect(() => {
    if (walletInfo.isConnected && serverGameService.isConnected) {
      serverGameService.joinAsPlayer(walletInfo.address);
    }
  }, [walletInfo.isConnected, walletInfo.address]);

  // Ensure games are loaded on component mount (fallback for page refresh)
  useEffect(() => {
    const loadGamesOnMount = async () => {
      try {
        if (serverGameService.isConnected) {
          const games = await serverGameService.getAllGames();
          setGames(games);
          console.log('Games loaded on mount:', games.length);
        }
      } catch (error) {
        console.error('Failed to load games on mount:', error);
      }
    };

    // Small delay to ensure server is connected
    const timer = setTimeout(loadGamesOnMount, 1000);
    return () => clearTimeout(timer);
  }, []); // Run only on mount

  // Update staking status when current game changes - CHECK ACTUAL BNB BALANCE
  useEffect(() => {
    const updateStakingStatus = async () => {
      if (!currentGame || !walletInfo.isConnected || !currentGame.poolWalletAddress) {
        setStakingStatus(prev => ({ ...prev, isStaked: false }));
        return;
      }

      try {
        // Check if player has actually staked by checking pool wallet balance
        const hasStaked = await checkPlayerStaked(currentGame.id);
        setStakingStatus(prev => ({ ...prev, isStaked: hasStaked }));
        console.log(`Staking status updated: ${hasStaked} for game ${currentGame.id} (real BNB check)`);
      } catch (error) {
        console.error('Error checking staking status:', error);
        setStakingStatus(prev => ({ ...prev, isStaked: false }));
      }
    };

    updateStakingStatus();
  }, [currentGame, walletInfo.isConnected, walletInfo.address, checkPlayerStaked]);

  // Auto-refresh staking status every 5 seconds for live updates
  useEffect(() => {
    if (!currentGame || !walletInfo.isConnected) return;

    const interval = setInterval(async () => {
      try {
        const hasStaked = await checkPlayerStaked(currentGame.id);
        setStakingStatus(prev => ({ ...prev, isStaked: hasStaked }));
        console.log(`Auto-refresh staking status: ${hasStaked} for game ${currentGame.id}`);
      } catch (error) {
        console.error('Error in auto-refresh staking status:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentGame, walletInfo.isConnected, walletInfo.address, checkPlayerStaked]);

  // Periodic game refresh to ensure games stay loaded
  useEffect(() => {
    const refreshGames = async () => {
      try {
        if (serverGameService.isConnected) {
          const games = await serverGameService.getAllGames();
          setGames(games);
          console.log('Periodic games refresh:', games.length);
        }
      } catch (error) {
        console.error('Failed to refresh games:', error);
      }
    };

    // Refresh games every 30 seconds
    const interval = setInterval(refreshGames, 30000);
    return () => clearInterval(interval);
  }, []);

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
      
      // Create game - HOST MUST STAKE TO JOIN (NO AUTO-ADD)
      const newGame: GameData = {
        id: gameId,
        title: gameData.title,
        stakeAmount: gameData.stakeAmount,
        players: [], // EMPTY - host must stake to join
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

      // Try to create game on server, fallback to local if server unavailable
      try {
        const serverGame = await serverGameService.createGame({
          title: newGame.title,
          stakeAmount: newGame.stakeAmount,
          isPrivate: newGame.isPrivate,
          password: newGame.password,
          maxPlayers: newGame.maxPlayers,
          host: newGame.host
        });
        
        // Ensure the server game has a game instance
        if (!serverGame.gameInstance) {
          serverGame.gameInstance = newGame.gameInstance;
        }
        
        setCurrentGame(serverGame);
        // Add to local games list
        setGames(prev => [...prev, serverGame]);
        // Reset staking status for new game
        setStakingStatus(prev => ({ ...prev, isStaked: false, isStaking: false, isUnstaking: false, error: undefined, success: undefined }));
        console.log('Game created on server:', serverGame.id);
        return serverGame;
      } catch (serverError) {
        console.warn('Server unavailable, creating local game:', serverError);
        // Fallback to local game creation
        setCurrentGame(newGame);
        // Add to local games list
        setGames(prev => [...prev, newGame]);
        // Reset staking status for new game
        setStakingStatus(prev => ({ ...prev, isStaked: false, isStaking: false, isUnstaking: false, error: undefined, success: undefined }));
        console.log('Game created locally:', newGame.id);
        return newGame;
      }
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
      
      // Join game through server
      let updatedGame;
      try {
        updatedGame = await serverGameService.joinGame(gameId, walletInfo.address);
        console.log('Successfully joined game via server:', updatedGame.id);
      } catch (serverError) {
        console.error('Server join failed, trying local join:', serverError);
        // If server join fails, try to join locally
        updatedGame = game;
        console.log('Using local game for re-entry');
      }
      // Ensure the game has a game instance
      if (!updatedGame.gameInstance) {
        updatedGame.gameInstance = new XiangqiGame();
      }
      
      // Update local games state
      setGames(prevGames => 
        prevGames.map(g => 
          g.id === gameId 
            ? { ...g, players: updatedGame.players }
            : g
        )
      );
      
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
      
      // Get current game state
      const game = games.find(g => g.id === gameId);
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

      // Get or create pool wallet address
      let poolWalletAddress = game.poolWalletAddress;
      if (!poolWalletAddress) {
        // Create pool wallet if it doesn't exist
        console.log('Creating pool wallet for game:', gameId);
        try {
          await createGamePool(gameId);
          poolWalletAddress = `pool_${gameId}_${Date.now()}`;
          console.log('Pool wallet created:', poolWalletAddress);
        } catch (poolError) {
          console.warn('Failed to create pool wallet, using fallback:', poolError);
          poolWalletAddress = `pool_${gameId}_fallback`;
        }
      }

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
      try {
        await serverGameService.updatePoolAmount(gameId, newPoolAmount);
        console.log('Server pool amount updated successfully');
      } catch (error) {
        console.error('Failed to update server pool amount:', error);
        // Continue anyway - local state is updated
      }
      
      // Check if game is ready to start (2 stakes total, allows same wallet)
      if (newStakeCount >= 2) {
        console.log('Game ready to start - 2 stakes completed');
        try {
          await serverGameService.updateGameStatus(gameId, 'active');
          console.log('Server game status updated to active');
        } catch (error) {
          console.error('Failed to update server game status:', error);
          // Continue anyway - local state is updated
        }

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
    isUserInGame
  };
};
