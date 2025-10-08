import { GameData } from '../hooks/useGameManager';

class SimpleGameService {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  // Get all games
  async getGames(): Promise<GameData[]> {
    try {
      console.log('🎮 Fetching games from API...');
      const response = await fetch(`${this.baseUrl}/api/games`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const games = await response.json();
      console.log(`🎮 API returned ${games.length} games`);
      return games;
    } catch (error) {
      console.error('❌ Error fetching games:', error);
      return [];
    }
  }

  // Create a new game
  async createGame(gameData: Partial<GameData>): Promise<GameData | null> {
    try {
      console.log('🎮 Creating game:', gameData);
      const response = await fetch(`${this.baseUrl}/api/games`, {
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
      console.log(`🎮 Created game: ${newGame.id}`);
      return newGame;
    } catch (error) {
      console.error('❌ Error creating game:', error);
      return null;
    }
  }

  // Join a game
  async joinGame(gameId: string, playerAddress: string): Promise<GameData | null> {
    try {
      console.log(`👤 Joining game ${gameId} as ${playerAddress}`);
      const response = await fetch(`${this.baseUrl}/api/games`, {
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

      const game = await response.json();
      console.log(`👤 Joined game: ${gameId}`);
      return game;
    } catch (error) {
      console.error('❌ Error joining game:', error);
      return null;
    }
  }

  // Stake for a game
  async stakeForGame(gameId: string, amount: number, playerAddress: string): Promise<GameData | null> {
    try {
      console.log(`💰 Staking ${amount} BNB for game ${gameId}`);
      const response = await fetch(`${this.baseUrl}/api/games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'stake',
          gameId,
          amount,
          playerAddress
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const game = await response.json();
      console.log(`💰 Staked for game: ${gameId}`);
      return game;
    } catch (error) {
      console.error('❌ Error staking for game:', error);
      return null;
    }
  }

  // Update a game
  async updateGame(gameId: string, updates: Partial<GameData>): Promise<GameData | null> {
    try {
      console.log(`🔄 Updating game ${gameId}:`, updates);
      const response = await fetch(`${this.baseUrl}/api/games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          gameId,
          ...updates
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const game = await response.json();
      console.log(`🔄 Updated game: ${gameId}`);
      return game;
    } catch (error) {
      console.error('❌ Error updating game:', error);
      return null;
    }
  }
}

export default SimpleGameService;
export const simpleGameService = new SimpleGameService();