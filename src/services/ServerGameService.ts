import { io, Socket } from 'socket.io-client';
import { GameData } from '../hooks/useGameManager';
import { XiangqiGame } from '../utils/xiangqiLogic';

class ServerGameService {
  private socket: Socket | null = null;
  private listeners: Set<(games: GameData[]) => void> = new Set();
  private isConnected = false;
  private serverUrl: string;

  constructor(serverUrl: string = 'http://localhost:5001') {
    this.serverUrl = serverUrl;
  }

  // Connect to server
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.serverUrl, {
          transports: ['websocket', 'polling'],
          timeout: 20000,
          forceNew: true
        });

        this.socket.on('connect', () => {
          console.log('Connected to game server');
          this.isConnected = true;
          this.setupEventListeners();
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('Failed to connect to game server:', error);
          this.isConnected = false;
          reject(error);
        });

        this.socket.on('disconnect', () => {
          console.log('Disconnected from game server');
          this.isConnected = false;
        });

        // Timeout after 10 seconds
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error('Connection timeout'));
          }
        }, 10000);

      } catch (error) {
        reject(error);
      }
    });
  }

  // Setup event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('games-update', (games: GameData[]) => {
      console.log('Games updated from server:', games.length);
      // Ensure all games have game instances
      const gamesWithInstances = games.map(game => this.ensureGameInstance(game));
      this.notifyListeners(gamesWithInstances);
    });

    this.socket.on('game-created', (game: GameData) => {
      console.log('Game created:', game.id);
    });

    this.socket.on('game-joined', (game: GameData) => {
      console.log('Game joined:', game.id);
    });

    this.socket.on('join-error', (error: string) => {
      console.error('Join error:', error);
    });

    this.socket.on('game-watched', (game: GameData) => {
      console.log('Game watched:', game.id);
    });

    this.socket.on('game-status-updated', (game: GameData) => {
      console.log('Game status updated:', game.id, game.status);
    });

    this.socket.on('pool-updated', (game: GameData) => {
      console.log('Pool updated:', game.id, game.poolAmount);
    });

    this.socket.on('move-made', (data: any) => {
      console.log('Move made:', data);
    });
  }

  // Player joins the service
  joinAsPlayer(playerAddress: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('player-join', { playerAddress });
    }
  }

  // Spectator joins the service
  joinAsSpectator(gameId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('spectator-join', { gameId });
    }
  }

  // Create a new game
  createGame(gameData: {
    title: string;
    stakeAmount: number;
    isPrivate: boolean;
    password?: string;
    host: string;
  }): Promise<GameData> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('create-game', gameData);
      
      this.socket.once('game-created', (game: GameData) => {
        resolve(this.ensureGameInstance(game));
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        reject(new Error('Create game timeout'));
      }, 5000);
    });
  }

  // Join an existing game
  joinGame(gameId: string, playerAddress: string): Promise<GameData> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('join-game', { gameId, playerAddress });
      
      this.socket.once('game-joined', (game: GameData) => {
        resolve(this.ensureGameInstance(game));
      });

      this.socket.once('join-error', (error: string) => {
        reject(new Error(error));
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        reject(new Error('Join game timeout'));
      }, 5000);
    });
  }

  // Join private game with password
  joinPrivateGame(gameId: string, playerAddress: string, password: string): Promise<GameData> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('join-private-game', { gameId, playerAddress, password });
      
      this.socket.once('game-joined', (game: GameData) => {
        resolve(game);
      });

      this.socket.once('join-error', (error: string) => {
        reject(new Error(error));
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        reject(new Error('Join private game timeout'));
      }, 5000);
    });
  }

  // Watch a game (spectator mode)
  watchGame(gameId: string): Promise<GameData> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('watch-game', { gameId });
      
      this.socket.once('game-watched', (game: GameData) => {
        resolve(this.ensureGameInstance(game));
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        reject(new Error('Watch game timeout'));
      }, 5000);
    });
  }

  // Update game status
  updateGameStatus(gameId: string, status: 'waiting' | 'active' | 'finished'): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('update-game-status', { gameId, status });
    }
  }

  // Update pool amount
  updatePoolAmount(gameId: string, amount: number): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('update-pool-amount', { gameId, amount });
    }
  }

  // Make a move
  makeMove(gameId: string, from: { x: number; y: number }, to: { x: number; y: number }, playerAddress: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('make-move', { gameId, from, to, playerAddress });
    }
  }

  // Subscribe to game updates
  subscribe(listener: (games: GameData[]) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
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

  // Disconnect from server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Check if connected
  isServerConnected(): boolean {
    return this.isConnected;
  }
}

// Export singleton instance
export const serverGameService = new ServerGameService();
export default serverGameService;
