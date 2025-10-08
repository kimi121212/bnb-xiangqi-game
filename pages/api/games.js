import { v4 as uuidv4 } from 'uuid';
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
      const games = JSON.parse(data);
      console.log(`Loaded ${games.length} games from persistent storage`);
      return games;
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
    console.log(`Saved ${games.length} games to persistent storage`);
  } catch (error) {
    console.error('Error saving games:', error);
  }
};

// Get all games
const getAllGames = () => {
  return loadGames();
};

// Get game by ID
const getGameById = (gameId) => {
  const games = loadGames();
  return games.find(game => game.id === gameId);
};

// Create new game
const createGame = (gameData) => {
  const games = loadGames();
  const newGame = {
    id: uuidv4(),
    ...gameData,
    createdAt: Date.now(),
    players: [],
    status: 'waiting',
    poolAmount: 0,
    stakeCount: 0,
    spectators: 0
  };
  
  games.push(newGame);
  saveGames(games);
  console.log(`Created new game: ${newGame.id}`);
  console.log(`Total games in storage: ${games.length}`);
  return newGame;
};

// Join game
const joinGame = (gameId, playerAddress) => {
  const games = loadGames();
  const gameIndex = games.findIndex(game => game.id === gameId);
  
  if (gameIndex === -1) {
    throw new Error('Game not found');
  }
  
  const game = games[gameIndex];
  
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

// Update game status
const updateGameStatus = (gameId, status) => {
  const games = loadGames();
  const gameIndex = games.findIndex(game => game.id === gameId);
  
  if (gameIndex === -1) {
    throw new Error('Game not found');
  }
  
  games[gameIndex].status = status;
  saveGames(games);
  console.log(`Updated game ${gameId} status to ${status}`);
  return games[gameIndex];
};

// Update pool amount
const updatePoolAmount = (gameId, amount) => {
  const games = loadGames();
  const gameIndex = games.findIndex(game => game.id === gameId);
  
  if (gameIndex === -1) {
    throw new Error('Game not found');
  }
  
  games[gameIndex].poolAmount = amount;
  games[gameIndex].stakeCount += 1;
  saveGames(games);
  console.log(`Updated game ${gameId} pool amount to ${amount}`);
  return games[gameIndex];
};

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const games = getAllGames();
      console.log(`API GET: Returning ${games.length} games`);
      return res.status(200).json(games);
    }

    if (req.method === 'POST') {
      const { title, stakeAmount, maxPlayers, isPrivate, password, host } = req.body;
      
      if (!title || !stakeAmount || !host) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const newGame = createGame({
        title,
        stakeAmount: parseFloat(stakeAmount),
        maxPlayers: parseInt(maxPlayers) || 2,
        isPrivate: Boolean(isPrivate),
        password: password || '',
        host
      });

      return res.status(201).json(newGame);
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}