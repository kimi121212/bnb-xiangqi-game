// import { io, Socket } from 'socket.io-client'; // Not needed for HTTP-only mode
import { GameData } from '../hooks/useGameManager';
import { XiangqiGame } from '../utils/xiangqiLogic';

class ServerGameService {
  private listeners: Set<(games: GameData[]) => void> = new Set();
  private isConnected = false;
  private serverUrl: string;

  constructor(serverUrl: string = 'http://localhost:5001') {
    // Use environment variable for production server URL
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      this.serverUrl = process.env.REACT_APP_SERVER_URL || window.location.origin;
    } else {
      this.serverUrl = serverUrl;
    }
  }

  // Connect to server - HTTP-only mode for Vercel
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // For Vercel deployment, use HTTP-only mode
        if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
          console.log('Running on Vercel - using HTTP-only mode');
          this.isConnected = true; // HTTP is "connected"
          resolve();
          return;
        }

        // For local development, try WebSocket first (fallback to HTTP)
        console.log('Attempting WebSocket connection for local development...');
        // Note: WebSocket code removed for Vercel compatibility
        this.isConnected = true; // HTTP fallback
        resolve();

      } catch (error) {
        console.warn('Connection setup failed, using HTTP-only mode:', error);
        this.isConnected = true; // HTTP fallback
        resolve();
      }
    });
  }

  // Setup event listeners - not needed for HTTP-only mode
  private setupEventListeners(): void {
    // No WebSocket event listeners needed for HTTP-only mode
    console.log('HTTP-only mode - no WebSocket event listeners');
  }

  // Player joins the service - not needed for HTTP-only mode
  joinAsPlayer(playerAddress: string): void {
    // No WebSocket connection needed for HTTP-only mode
    console.log('Player joined (HTTP-only mode):', playerAddress);
  }

  // Spectator joins the service - not needed for HTTP-only mode
  joinAsSpectator(gameId: string): void {
    // No WebSocket connection needed for HTTP-only mode
    console.log('Spectator joined game (HTTP-only mode):', gameId);
  }

  // Create a new game
  createGame(gameData: {
    title: string;
    stakeAmount: number;
    isPrivate: boolean;
    password?: string;
    host: string;
  }): Promise<GameData> {
    return fetch(`${this.serverUrl}/api/games`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gameData),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(game => this.ensureGameInstance(game))
    .catch(error => {
      console.error('Failed to create game:', error);
      throw error;
    });
  }

  // Join an existing game
  joinGame(gameId: string, playerAddress: string): Promise<GameData> {
    return fetch(`${this.serverUrl}/api/games/${gameId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerAddress }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(game => this.ensureGameInstance(game))
    .catch(error => {
      console.error('Failed to join game:', error);
      throw error;
    });
  }

  // Join private game with password - HTTP-only for Vercel
  joinPrivateGame(gameId: string, playerAddress: string, password: string): Promise<GameData> {
    return fetch(`${this.serverUrl}/api/games/${gameId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerAddress, password }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(game => this.ensureGameInstance(game))
    .catch(error => {
      console.error('Failed to join private game via HTTP:', error);
      throw error;
    });
  }

  // Watch a game (spectator mode) - HTTP-only for Vercel
  watchGame(gameId: string): Promise<GameData> {
    return fetch(`${this.serverUrl}/api/games/${gameId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(game => this.ensureGameInstance(game))
      .catch(error => {
        console.error('Failed to watch game via HTTP:', error);
        throw error;
      });
  }

  // Update game status - HTTP-only for Vercel
  updateGameStatus(gameId: string, status: 'waiting' | 'active' | 'finished'): void {
    fetch(`${this.serverUrl}/api/games/${gameId}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    }).catch(error => {
      console.error('Failed to update game status via HTTP:', error);
    });
  }

  // Update pool amount - HTTP-only for Vercel
  updatePoolAmount(gameId: string, amount: number): void {
    fetch(`${this.serverUrl}/api/games/${gameId}/pool`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    }).catch(error => {
      console.error('Failed to update pool amount via HTTP:', error);
    });
  }

  // Make a move - HTTP-only for Vercel
  makeMove(gameId: string, from: { x: number; y: number }, to: { x: number; y: number }, playerAddress: string): void {
    // For Vercel, moves are handled client-side in the game logic
    // No need to send to server since we're using HTTP-only mode
    console.log('Move made (client-side):', { gameId, from, to, playerAddress });
  }

  // Subscribe to game updates - HTTP polling for Vercel
  subscribe(listener: (games: GameData[]) => void): () => void {
    this.listeners.add(listener);

    // For Vercel HTTP-only mode, we'll periodically fetch games
    const pollInterval = setInterval(async () => {
      try {
        const games = await this.getAllGames();
        this.notifyListeners(games);
      } catch (error) {
        console.error('Error polling games:', error);
      }
    }, 5000); // Poll every 5 seconds

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
      clearInterval(pollInterval);
    };
  }

  // Notify all listeners
  private notifyListeners(games: GameData[]): void {
    this.listeners.forEach(listener => {
      try {
        listener(games);
      } catch (error) {
        console.error('Error in game listener:', error);
      }
    });
  }

  // Ensure game has XiangqiGame instance
  private ensureGameInstance(game: GameData): GameData {
    if (!game.gameInstance) {
      game.gameInstance = new XiangqiGame();
    }
    return game;
  }

  // Get all games from server
  async getAllGames(): Promise<GameData[]> {
    try {
      const response = await fetch(`${this.serverUrl}/api/games`);
      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get games from server:', error);
      return [];
    }
  }

  // Get available games
  async getAvailableGames(): Promise<GameData[]> {
    try {
      const response = await fetch(`${this.serverUrl}/api/games/available`);
      if (!response.ok) {
        throw new Error('Failed to fetch available games');
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get available games:', error);
      return [];
    }
  }

  // Get active games
  async getActiveGames(): Promise<GameData[]> {
    try {
      const response = await fetch(`${this.serverUrl}/api/games/active`);
      if (!response.ok) {
        throw new Error('Failed to fetch active games');
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get active games:', error);
      return [];
    }
  }

  // Get game by ID
  async getGame(gameId: string): Promise<GameData | null> {
    try {
      const response = await fetch(`${this.serverUrl}/api/games/${gameId}`);
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get game:', error);
      return null;
    }
  }

  // Get server stats
  async getServerStats(): Promise<any> {
    try {
      const response = await fetch(`${this.serverUrl}/api/stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch server stats');
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get server stats:', error);
      return null;
    }
  }

  // Disconnect from server - not needed for HTTP-only mode
  disconnect(): void {
    // No WebSocket disconnect needed for HTTP-only mode
    console.log('HTTP-only mode - no disconnect needed');
  }

  // Check if connected
  isServerConnected(): boolean {
    return this.isConnected;
  }

}

// Export singleton instance
export const serverGameService = new ServerGameService();
export default serverGameService;
