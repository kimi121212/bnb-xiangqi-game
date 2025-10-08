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

// Update pool amount
const updatePoolAmount = (gameId, amount) => {
  const games = loadGames();
  const gameIndex = games.findIndex(game => game.id === gameId);
  
  if (gameIndex === -1) {
    throw new Error('Game not found');
  }
  
  games[gameIndex].poolAmount = (games[gameIndex].poolAmount || 0) + parseFloat(amount);
  games[gameIndex].stakeCount = (games[gameIndex].stakeCount || 0) + 1;
  saveGames(games);
  console.log(`Updated game ${gameId} pool amount by ${amount}`);
  return games[gameIndex];
};

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'PUT') {
    try {
      const { gameId } = req.query;
      const { amount } = req.body;

      if (!gameId) {
        return res.status(400).json({ error: 'Game ID is required' });
      }

      if (amount === undefined || amount === null) {
        return res.status(400).json({ error: 'Amount is required' });
      }

      const updatedGame = updatePoolAmount(gameId, amount);
      return res.status(200).json(updatedGame);

    } catch (error) {
      console.error('Update pool error:', error);
      return res.status(400).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
