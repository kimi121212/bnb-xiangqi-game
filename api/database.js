const fs = require('fs');
const path = require('path');

// File-based database for persistence
class GameDatabase {
  constructor() {
    this.dbPath = path.join(process.cwd(), 'games.json');
    this.games = new Map();
    this.loadFromFile();
  }

  loadFromFile() {
    try {
      if (fs.existsSync(this.dbPath)) {
        const data = fs.readFileSync(this.dbPath, 'utf8');
        const gamesData = JSON.parse(data);
        this.games = new Map(Object.entries(gamesData));
        console.log(`Loaded ${this.games.size} games from database`);
      }
    } catch (error) {
      console.error('Error loading games from file:', error);
      this.games = new Map();
    }
  }

  saveToFile() {
    try {
      const gamesObj = Object.fromEntries(this.games);
      fs.writeFileSync(this.dbPath, JSON.stringify(gamesObj, null, 2));
      console.log(`Saved ${this.games.size} games to database`);
    } catch (error) {
      console.error('Error saving games to file:', error);
    }
  }

  // Game operations
  addGame(game) {
    this.games.set(game.id, game);
    this.saveToFile();
    console.log(`Game added to database: ${game.id}`);
    return game;
  }

  getGame(gameId) {
    return this.games.get(gameId) || null;
  }

  getAllGames() {
    return Array.from(this.games.values());
  }

  updateGame(gameId, updates) {
    const game = this.games.get(gameId);
    if (game) {
      const updatedGame = { ...game, ...updates };
      this.games.set(gameId, updatedGame);
      this.saveToFile();
      console.log(`Game updated in database: ${gameId}`);
      return updatedGame;
    }
    return null;
  }

  deleteGame(gameId) {
    const deleted = this.games.delete(gameId);
    if (deleted) {
      this.saveToFile();
      console.log(`Game deleted from database: ${gameId}`);
    }
    return deleted;
  }

  // Get available games (non-private, waiting for players)
  getAvailableGames() {
    return this.getAllGames().filter(game => 
      !game.isPrivate && 
      game.status === 'waiting' && 
      game.players.length < game.maxPlayers
    );
  }

  // Get active games (for spectators)
  getActiveGames() {
    return this.getAllGames().filter(game => game.status === 'active');
  }

  // Join a game
  joinGame(gameId, playerAddress, password = null) {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    // Check if it's a private game and password is required
    if (game.isPrivate && game.password && game.password !== password) {
      throw new Error('Invalid password');
    }

    if (game.players.includes(playerAddress)) {
      return game; // Already in game, allow re-entry
    }

    if (game.players.length >= game.maxPlayers) {
      throw new Error('Game is full');
    }

    const updatedGame = {
      ...game,
      players: [...game.players, playerAddress]
    };
    
    this.games.set(gameId, updatedGame);
    this.saveToFile();
    console.log(`Player ${playerAddress} joined game ${gameId}`);
    return updatedGame;
  }

  // Update game status
  updateGameStatus(gameId, status) {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    
    const updatedGame = { ...game, status };
    this.games.set(gameId, updatedGame);
    this.saveToFile();
    console.log(`Game ${gameId} status updated to ${status}`);
    return updatedGame;
  }

  // Update pool amount
  updatePoolAmount(gameId, amount) {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    
    const updatedGame = { ...game, poolAmount: amount };
    this.games.set(gameId, updatedGame);
    this.saveToFile();
    console.log(`Game ${gameId} pool updated to ${amount} BNB`);
    return updatedGame;
  }

  // Clean up old games (older than 24 hours)
  cleanupOldGames() {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    for (const [gameId, game] of this.games.entries()) {
      if (game.createdAt < oneDayAgo && game.status === 'waiting') {
        this.games.delete(gameId);
        console.log(`Cleaned up old game: ${gameId}`);
      }
    }
    
    if (this.games.size > 0) {
      this.saveToFile();
    }
  }
}

// Export singleton instance
module.exports = new GameDatabase();