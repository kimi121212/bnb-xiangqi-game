import { GameData } from '../hooks/useGameManager';
import { XiangqiGame } from '../utils/xiangqiLogic';

class ServerGameService {
  private listeners: Set<(games: GameData[]) => void> = new Set();
  private isConnected = false;
  private serverUrl: string;

  constructor(serverUrl: string = '') {
    this.serverUrl = serverUrl;
  }

  // Connect to server (simplified for API-based approach)
  connect(): Promise<void> {
    return new Promise((resolve) => {
      console.log('Connected to game server (API mode)');
      this.isConnected = true;
      resolve();
    });
  }

  // Disconnect from server
  disconnect(): void {
    this.isConnected = false;
    console.log('Disconnected from game server');
  }

  // Add listener for game updates
  addGameListener(listener: (games: GameData[]) => void): void {
    this.listeners.add(listener);
  }

  // Remove listener
  removeGameListener(listener: (games: GameData[]) => void): void {
    this.listeners.delete(listener);
  }

  // Notify all listeners
  private notifyListeners(games: GameData[]): void {
    this.listeners.forEach(listener => listener(games));
  }

  // Get all games from API
  async getGames(): Promise<GameData[]> {
    try {
      console.log('🎮 Fetching games from API...');
      const response = await fetch('/api/games');
      console.log('🎮 API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const games = await response.json();
      console.log('🎮 API returned games:', games.length);
      console.log('🎮 Games data:', games);
      return games;
    } catch (error) {
      console.error('❌ Error fetching games:', error);
      return [];
    }
  }

  // Create a new game room
  async createGame(gameData: Partial<GameData>): Promise<GameData | null> {
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          ...gameData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const newGame = await response.json();
      console.log(`🎮 Created game room on server: ${newGame.id}`);
      this.notifyListeners([newGame]); // Notify listeners after creating a game
      return newGame;
    } catch (error) {
      console.error('Error creating game room:', error);
      return null;
    }
  }

  // Join a game room
  async joinGame(gameId: string, playerAddress: string): Promise<GameData | null> {
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'join',
          gameId,
          playerAddress
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const updatedGame = await response.json();
      console.log(`👤 Player ${playerAddress} joined game room ${gameId}`);
      this.notifyListeners([updatedGame]); // Notify listeners after joining
      return updatedGame;
    } catch (error) {
      console.error('Error joining game room:', error);
      throw error; // Re-throw to let the caller handle it
    }
  }

  // Update game room status
  async updateGameStatus(gameId: string, status: string): Promise<GameData | null> {
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateStatus',
          gameId,
          status
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const updatedGame = await response.json();
      console.log(`🔄 Game room ${gameId} status updated to ${status}`);
      this.notifyListeners([updatedGame]); // Notify listeners after status update
      return updatedGame;
    } catch (error) {
      console.error('Error updating game room status:', error);
      return null;
    }
  }

  // Update game room pool amount
  async updatePoolAmount(gameId: string, amount: number): Promise<GameData | null> {
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updatePool',
          gameId,
          amount
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const updatedGame = await response.json();
      console.log(`💰 Game room ${gameId} pool updated to ${amount} BNB`);
      this.notifyListeners([updatedGame]); // Notify listeners after pool update
      return updatedGame;
    } catch (error) {
      console.error('Error updating game room pool:', error);
      return null;
    }
  }

  // Check if connected
  isServerConnected(): boolean {
    return this.isConnected;
  }

  // Subscribe to game updates (simplified for API approach)
  subscribe(callback: (games: GameData[]) => void): () => void {
    this.addGameListener(callback);
    
    // Return unsubscribe function
    return () => {
      this.removeGameListener(callback);
    };
  }

  // Get a specific game room
  async getGameById(gameId: string): Promise<GameData | null> {
    try {
      const response = await fetch(`/api/games?gameId=${gameId}`);
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`❌ Game room not found: ${gameId}`);
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const game = await response.json();
      return game;
    } catch (error) {
      console.error('Error fetching game room:', error);
      return null;
    }
  }

  // Add move to game room
  async addMove(gameId: string, move: any): Promise<GameData | null> {
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'addMove',
          gameId,
          move
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const updatedGame = await response.json();
      console.log(`♟️ Move added to game room ${gameId}`);
      this.notifyListeners([updatedGame]); // Notify listeners after move
      return updatedGame;
    } catch (error) {
      console.error('Error adding move to game room:', error);
      return null;
    }
  }

  // Get all games (alias for getGames)
  async getAllGames(): Promise<GameData[]> {
    return this.getGames();
  }

  // Join as player (simplified)
  joinAsPlayer(playerAddress: string): void {
    console.log(`Player ${playerAddress} joined the game service`);
  }
}

export default ServerGameService;

// Export a singleton instance
export const serverGameService = new ServerGameService();