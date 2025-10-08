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
      const response = await fetch('/api/games');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const games = await response.json();
      return games;
    } catch (error) {
      console.error('Error fetching games:', error);
      return [];
    }
  }

  // Create a new game
  async createGame(gameData: Partial<GameData>): Promise<GameData | null> {
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newGame = await response.json();
      return newGame;
    } catch (error) {
      console.error('Error creating game:', error);
      return null;
    }
  }

  // Join a game
  async joinGame(gameId: string, playerAddress: string): Promise<GameData | null> {
    try {
      const response = await fetch(`/api/games/${gameId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerAddress }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedGame = await response.json();
      return updatedGame;
    } catch (error) {
      console.error('Error joining game:', error);
      return null;
    }
  }

  // Update game status
  async updateGameStatus(gameId: string, status: string): Promise<GameData | null> {
    try {
      const response = await fetch(`/api/games/${gameId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedGame = await response.json();
      return updatedGame;
    } catch (error) {
      console.error('Error updating game status:', error);
      return null;
    }
  }

  // Update pool amount
  async updatePoolAmount(gameId: string, amount: number): Promise<GameData | null> {
    try {
      const response = await fetch(`/api/games/${gameId}/pool`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedGame = await response.json();
      return updatedGame;
    } catch (error) {
      console.error('Error updating pool amount:', error);
      return null;
    }
  }

  // Check if connected
  isServerConnected(): boolean {
    return this.isConnected;
  }
}

export default ServerGameService;

// Export a singleton instance
export const serverGameService = new ServerGameService();