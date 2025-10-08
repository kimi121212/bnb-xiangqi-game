import { GameData } from '../hooks/useGameManager';

// Enhanced shared game service with localStorage persistence
class SharedGameService {
  private games: Map<string, GameData> = new Map();
  private listeners: Set<(games: GameData[]) => void> = new Set();
  private storageKey = 'bnb-xiangqi-games';

  constructor() {
    this.loadGamesFromStorage();
    this.setupStorageListener();
  }

  // Load games from localStorage on initialization
  private loadGamesFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const gamesArray = JSON.parse(stored);
        this.games = new Map(gamesArray.map((game: GameData) => [game.id, game]));
        console.log(`Loaded ${this.games.size} games from storage`);
      }
    } catch (error) {
      console.error('Failed to load games from storage:', error);
    }
  }

  // Save games to localStorage
  private saveGamesToStorage(): void {
    try {
      const gamesArray = Array.from(this.games.values());
      localStorage.setItem(this.storageKey, JSON.stringify(gamesArray));
      console.log(`Saved ${gamesArray.length} games to storage`);
    } catch (error) {
      console.error('Failed to save games to storage:', error);
    }
  }

  // Listen for storage changes from other tabs/windows
  private setupStorageListener(): void {
    window.addEventListener('storage', (event) => {
      if (event.key === this.storageKey && event.newValue) {
        try {
          const gamesArray = JSON.parse(event.newValue);
          this.games = new Map(gamesArray.map((game: GameData) => [game.id, game]));
          this.notifyListeners();
          console.log('Games updated from other tab/window');
        } catch (error) {
          console.error('Failed to parse games from storage event:', error);
        }
      }
    });
  }

  // Add a new game
  addGame(game: GameData): void {
    this.games.set(game.id, game);
    this.saveGamesToStorage();
    this.notifyListeners();
    console.log(`Game added: ${game.id}`, game);
  }

  // Update an existing game
  updateGame(gameId: string, updates: Partial<GameData>): void {
    const game = this.games.get(gameId);
    if (game) {
      const updatedGame = { ...game, ...updates };
      this.games.set(gameId, updatedGame);
      this.saveGamesToStorage();
      this.notifyListeners();
      console.log(`Game updated: ${gameId}`, updatedGame);
    }
  }

  // Get a specific game
  getGame(gameId: string): GameData | null {
    return this.games.get(gameId) || null;
  }

  // Get all games
  getAllGames(): GameData[] {
    return Array.from(this.games.values());
  }

  // Get available games (non-private, waiting for players)
  getAvailableGames(): GameData[] {
    return this.getAllGames().filter(game => 
      !game.isPrivate && 
      game.status === 'waiting' && 
      game.players.length < game.maxPlayers
    );
  }

  // Get active games (for spectators)
  getActiveGames(): GameData[] {
    return this.getAllGames().filter(game => game.status === 'active');
  }

  // Join a game
  joinGame(gameId: string, playerAddress: string): boolean {
    const game = this.games.get(gameId);
    if (!game) {
      console.error('Game not found:', gameId);
      return false;
    }

    if (game.players.length >= game.maxPlayers) {
      console.error('Game is full:', gameId);
      return false;
    }

    if (game.players.includes(playerAddress)) {
      console.error('Player already in game:', gameId);
      return false;
    }

    // Add player to game
    const updatedGame = {
      ...game,
      players: [...game.players, playerAddress]
    };

    // If game is now full, start it
    if (updatedGame.players.length === updatedGame.maxPlayers) {
      updatedGame.status = 'active';
    }

    this.games.set(gameId, updatedGame);
    this.saveGamesToStorage();
    this.notifyListeners();
    console.log(`Player ${playerAddress} joined game ${gameId}`);
    return true;
  }

  // Join private game with password
  joinPrivateGame(gameId: string, playerAddress: string, password: string): boolean {
    const game = this.games.get(gameId);
    if (!game) {
      console.error('Game not found:', gameId);
      return false;
    }

    if (!game.isPrivate) {
      console.error('Game is not private:', gameId);
      return false;
    }

    if (game.password !== password) {
      console.error('Invalid password for game:', gameId);
      return false;
    }

    return this.joinGame(gameId, playerAddress);
  }

  // Add spectator to game
  addSpectator(gameId: string): void {
    const game = this.games.get(gameId);
    if (game) {
      const updatedGame = {
        ...game,
        spectators: game.spectators + 1
      };
      this.games.set(gameId, updatedGame);
      this.saveGamesToStorage();
      this.notifyListeners();
      console.log(`Spectator added to game ${gameId}`);
    }
  }

  // Remove spectator from game
  removeSpectator(gameId: string): void {
    const game = this.games.get(gameId);
    if (game && game.spectators > 0) {
      const updatedGame = {
        ...game,
        spectators: game.spectators - 1
      };
      this.games.set(gameId, updatedGame);
      this.saveGamesToStorage();
      this.notifyListeners();
      console.log(`Spectator removed from game ${gameId}`);
    }
  }

  // Update game status
  updateGameStatus(gameId: string, status: 'waiting' | 'active' | 'finished'): void {
    const game = this.games.get(gameId);
    if (game) {
      const updatedGame = { ...game, status };
      this.games.set(gameId, updatedGame);
      this.saveGamesToStorage();
      this.notifyListeners();
      console.log(`Game ${gameId} status updated to ${status}`);
    }
  }

  // Update pool amount
  updatePoolAmount(gameId: string, amount: number): void {
    const game = this.games.get(gameId);
    if (game) {
      const updatedGame = { ...game, poolAmount: amount };
      this.games.set(gameId, updatedGame);
      this.saveGamesToStorage();
      this.notifyListeners();
      console.log(`Game ${gameId} pool updated to ${amount} BNB`);
    }
  }

  // Remove a game
  removeGame(gameId: string): void {
    this.games.delete(gameId);
    this.saveGamesToStorage();
    this.notifyListeners();
    console.log(`Game removed: ${gameId}`);
  }

  // Subscribe to game updates
  subscribe(listener: (games: GameData[]) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Notify all listeners of game updates
  private notifyListeners(): void {
    const games = this.getAllGames();
    this.listeners.forEach(listener => {
      try {
        listener(games);
      } catch (error) {
        console.error('Error in game listener:', error);
      }
    });
  }

  // Get games by player
  getGamesByPlayer(playerAddress: string): GameData[] {
    return this.getAllGames().filter(game => 
      game.players.includes(playerAddress) || game.host === playerAddress
    );
  }

  // Check if player can join game
  canJoinGame(gameId: string, playerAddress: string): boolean {
    const game = this.games.get(gameId);
    if (!game) return false;
    
    return game.status === 'waiting' && 
           game.players.length < game.maxPlayers &&
           !game.players.includes(playerAddress);
  }

  // Check if player can watch game
  canWatchGame(gameId: string): boolean {
    const game = this.games.get(gameId);
    if (!game) return false;
    
    return game.status === 'active' || game.status === 'waiting';
  }

  // Clear all games (for testing)
  clearAllGames(): void {
    this.games.clear();
    this.saveGamesToStorage();
    this.notifyListeners();
    console.log('All games cleared');
  }

  // Get game statistics
  getGameStats(): {
    totalGames: number;
    waitingGames: number;
    activeGames: number;
    finishedGames: number;
    totalPlayers: number;
    totalSpectators: number;
  } {
    const games = this.getAllGames();
    return {
      totalGames: games.length,
      waitingGames: games.filter(g => g.status === 'waiting').length,
      activeGames: games.filter(g => g.status === 'active').length,
      finishedGames: games.filter(g => g.status === 'finished').length,
      totalPlayers: games.reduce((sum, g) => sum + g.players.length, 0),
      totalSpectators: games.reduce((sum, g) => sum + g.spectators, 0)
    };
  }
}

// Export singleton instance
export const sharedGameService = new SharedGameService();
export default sharedGameService;
