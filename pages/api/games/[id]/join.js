import fs from 'fs';
import path from 'path';

// Persistent file-based database
const GAMES_FILE = path.join(process.cwd(), 'data', 'games.json');

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.dirname(GAMES_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Load games from file
const loadGames = () => {
  try {
    ensureDataDir();
    if (fs.existsSync(GAMES_FILE)) {
      const data = fs.readFileSync(GAMES_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading games:', error);
  }
  return [];
};

// Save games to file
const saveGames = (games) => {
  try {
    ensureDataDir();
    fs.writeFileSync(GAMES_FILE, JSON.stringify(games, null, 2));
  } catch (error) {
    console.error('Error saving games:', error);
  }
};

// Join game
const joinGame = (gameId, playerAddress) => {
  const games = loadGames();
  const gameIndex = games.findIndex(game => game.id === gameId);
  
  if (gameIndex === -1) {
    throw new Error('Game not found');
  }
  
  const game = games[gameIndex];
  
  // Check if game is full
  if (game.players.length >= game.maxPlayers) {
    throw new Error('Game is full');
  }
  
  // Check if game is still waiting
  if (game.status !== 'waiting') {
    throw new Error('Game is no longer accepting players');
  }
  
  // Check if player already in game
  if (!game.players.includes(playerAddress)) {
    game.players.push(playerAddress);
    
    // Update status if enough players
    if (game.players.length >= game.maxPlayers) {
      game.status = 'active';
    }
    
    saveGames(games);
    console.log(`Player ${playerAddress} joined game ${gameId}`);
  }
  
  return game;
};

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { gameId } = req.query;
      const { playerAddress } = req.body;

      if (!gameId) {
        return res.status(400).json({ error: 'Game ID is required' });
      }

      if (!playerAddress) {
        return res.status(400).json({ error: 'Player address is required' });
      }

      const updatedGame = joinGame(gameId, playerAddress);
      return res.status(200).json(updatedGame);

    } catch (error) {
      console.error('Join game error:', error);
      return res.status(400).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
