import { v4 as uuidv4 } from 'uuid';

// Simple in-memory storage that persists across requests
// This will work for Vercel serverless functions
let games = [];

// Helper functions
const saveGames = () => {
  // In a real app, this would save to a database
  // For now, we'll just log the games
  console.log(`💾 Saving ${games.length} games`);
  return games;
};

const loadGames = () => {
  console.log(`📊 Loading ${games.length} games`);
  return games;
};

// Game management functions
const createGame = (gameData) => {
  const newGame = {
    id: uuidv4(),
    title: gameData.title,
    stakeAmount: parseFloat(gameData.stakeAmount),
    maxPlayers: parseInt(gameData.maxPlayers) || 2,
    isPrivate: Boolean(gameData.isPrivate),
    password: gameData.password || '',
    host: gameData.host,
    createdAt: Date.now(),
    players: [],
    status: 'waiting',
    poolAmount: 0,
    stakeCount: 0,
    spectators: 0,
    moves: []
  };
  
  games.push(newGame);
  console.log(`🎮 Created game: ${newGame.id} - ${newGame.title}`);
  return newGame;
};

const getGameById = (gameId) => {
  const game = games.find(g => g.id === gameId);
  console.log(`🔍 Looking for game: ${gameId}`, game ? 'Found' : 'Not found');
  return game;
};

const updateGame = (gameId, updates) => {
  const gameIndex = games.findIndex(g => g.id === gameId);
  if (gameIndex === -1) {
    throw new Error('Game not found');
  }
  
  games[gameIndex] = { ...games[gameIndex], ...updates };
  console.log(`🔄 Updated game: ${gameId}`);
  return games[gameIndex];
};

const joinGame = (gameId, playerAddress) => {
  const game = getGameById(gameId);
  if (!game) {
    throw new Error('Game not found');
  }
  
  if (!game.players.includes(playerAddress)) {
    game.players.push(playerAddress);
    console.log(`👤 Player ${playerAddress} joined game ${gameId}`);
  }
  
  return game;
};

const stakeForGame = (gameId, amount, playerAddress) => {
  const game = getGameById(gameId);
  if (!game) {
    throw new Error('Game not found');
  }
  
  // Update game with stake
  game.poolAmount += amount;
  game.stakeCount += 1;
  
  if (!game.players.includes(playerAddress)) {
    game.players.push(playerAddress);
  }
  
  // Check if game is ready to start
  if (game.stakeCount >= game.maxPlayers) {
    game.status = 'active';
  }
  
  console.log(`💰 Staked ${amount} BNB for game ${gameId}. Pool: ${game.poolAmount} BNB`);
  return game;
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
      const allGames = loadGames();
      console.log(`📊 Returning ${allGames.length} games`);
      return res.status(200).json(allGames);
    }

    if (req.method === 'POST') {
      const { action, gameId, playerAddress, amount, ...gameData } = req.body;
      
      if (action === 'create') {
        const newGame = createGame(gameData);
        return res.status(201).json(newGame);
      }
      
      if (action === 'join') {
        const game = joinGame(gameId, playerAddress);
        return res.status(200).json(game);
      }
      
      if (action === 'stake') {
        const game = stakeForGame(gameId, amount, playerAddress);
        return res.status(200).json(game);
      }
      
      if (action === 'update') {
        const game = updateGame(gameId, gameData);
        return res.status(200).json(game);
      }
      
      return res.status(400).json({ error: 'Invalid action' });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('❌ API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}