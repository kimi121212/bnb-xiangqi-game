import { GameData } from '../hooks/useGameManager';
import { XiangqiGame } from '../utils/xiangqiLogic';

class SimpleGameService {
  private games: Map<string, GameData> = new Map();
  private listeners: Set<(games: GameData[]) => void> = new Set();
  private storageKey = 'bnb-xiangqi-games';

  constructor() {
    this.loadGamesFromStorage();
    // Auto-save every 5 seconds
    setInterval(() => this.saveGamesToStorage(), 5000);
  }

  // Load games from localStorage
  private loadGamesFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const gamesArray = JSON.parse(stored);
        this.games.clear();
        gamesArray.forEach((game: GameData) => {
          this.games.set(game.id, game);
        });
        console.log(`Loaded ${this.games.size} games from storage`);
      }
    } catch (error) {
      console.error('Error loading games from storage:', error);
    }
  }

  // Save games to localStorage
  private saveGamesToStorage() {
    try {
      const gamesArray = Array.from(this.games.values());
      localStorage.setItem(this.storageKey, JSON.stringify(gamesArray));
    } catch (error) {
      console.error('Error saving games to storage:', error);
    }
  }

  // Notify all listeners
  private notifyListeners() {
    const gamesArray = Array.from(this.games.values());
    this.listeners.forEach(listener => listener(gamesArray));
  }

  // Get all games
  getAllGames(): GameData[] {
    return Array.from(this.games.values());
  }

  // Get game by ID
  getGameById(gameId: string): GameData | null {
    return this.games.get(gameId) || null;
  }

  // Create new game
  createGame(gameData: Partial<GameData>): GameData {
    const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newGame: GameData = {
      id: gameId,
      title: gameData.title || 'Untitled Game',
      stakeAmount: gameData.stakeAmount || 0.001,
      maxPlayers: gameData.maxPlayers || 2,
      isPrivate: gameData.isPrivate || false,
      password: gameData.password || '',
      host: gameData.host || '',
      players: [], // Don't automatically add host to players - they need to stake first
      status: 'waiting',
      createdAt: Date.now(),
      spectators: 0,
      poolAmount: 0,
      stakeCount: 0,
      gameInstance: new XiangqiGame()
    };

    // Ensure gameInstance is properly initialized
    if (!newGame.gameInstance || typeof newGame.gameInstance.getGameState !== 'function') {
      console.log('Reinitializing gameInstance for game:', gameId);
      newGame.gameInstance = new XiangqiGame();
    }

    this.games.set(gameId, newGame);
    this.notifyListeners();
    console.log(`Created game: ${gameId}`);
    return newGame;
  }

  // Join game
  joinGame(gameId: string, playerAddress: string): GameData | null {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    if (game.players.length >= game.maxPlayers) {
      throw new Error('Game is full');
    }

    if (game.status !== 'waiting') {
      throw new Error('Game is no longer accepting players');
    }

    if (!game.players.includes(playerAddress)) {
      game.players.push(playerAddress);
      
      if (game.players.length >= game.maxPlayers) {
        game.status = 'active';
      }
      
      this.notifyListeners();
      console.log(`Player ${playerAddress} joined game ${gameId}`);
    }

    return game;
  }

  // Update game status
  updateGameStatus(gameId: string, status: string): GameData | null {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    game.status = status;
    this.notifyListeners();
    console.log(`Updated game ${gameId} status to ${status}`);
    return game;
  }

  // Update pool amount
  updatePoolAmount(gameId: string, amount: number): GameData | null {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    game.poolAmount = (game.poolAmount || 0) + amount;
    game.stakeCount = (game.stakeCount || 0) + 1;
    this.notifyListeners();
    console.log(`Updated game ${gameId} pool amount by ${amount}`);
    return game;
  }

  // Subscribe to game updates
  subscribe(callback: (games: GameData[]) => void): () => void {
    this.listeners.add(callback);
    
    // Immediately call with current games
    callback(this.getAllGames());
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Connect (always succeeds for simple service)
  connect(): Promise<void> {
    return Promise.resolve();
  }

  // Disconnect
  disconnect(): void {
    this.listeners.clear();
  }

  // Check if connected
  isServerConnected(): boolean {
    return true;
  }
}

export default SimpleGameService;
export const simpleGameService = new SimpleGameService();
