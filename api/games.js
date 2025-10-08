const { v4: uuidv4 } = require('uuid');
const { ethers } = require('ethers');
const db = require('./database');

// Helper to ensure game instance
const ensureGameInstance = (game) => {
  if (!game.gameInstance) {
    game.gameInstance = {
      board: Array(9).fill(null).map(() => Array(10).fill(null)),
      currentPlayer: 'red',
      gameState: 'waiting',
      moves: []
    };
  }
  return game;
};

// Game management functions
const createGame = (gameData) => {
  const gameId = uuidv4();
  const wallet = ethers.Wallet.createRandom();
  const poolWalletAddress = wallet.address;

  const game = {
    id: gameId,
    title: gameData.title,
    stakeAmount: gameData.stakeAmount,
    players: [], // EMPTY - host must stake to join
    maxPlayers: gameData.maxPlayers || 2,
    status: 'waiting',
    isPrivate: gameData.isPrivate || false,
    password: gameData.password || '',
    createdAt: Date.now(),
    host: gameData.host,
    spectators: 0,
    poolAmount: 0,
    poolWalletAddress: poolWalletAddress,
    stakeCount: 0,
    gameInstance: {
      board: Array(9).fill(null).map(() => Array(10).fill(null)),
      currentPlayer: 'red',
      gameState: 'waiting',
      moves: []
    }
  };
  
  db.addGame(game);
  console.log(`Game created: ${gameId} by ${gameData.host} with wallet: ${poolWalletAddress}`);
  return game;
};

const joinGame = (gameId, playerAddress, password) => {
  return db.joinGame(gameId, playerAddress, password);
};

const updateGameStatus = (gameId, status) => {
  return db.updateGameStatus(gameId, status);
};

const updatePoolAmount = (gameId, amount) => {
  return db.updatePoolAmount(gameId, amount);
};

const getAvailableGames = () => {
  return db.getAvailableGames().map(ensureGameInstance);
};

const getActiveGames = () => {
  return db.getActiveGames().map(ensureGameInstance);
};

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('Games API called:', req.method, req.url);

  const pathSegments = req.url.split('/').filter(Boolean); // ['', 'api', 'games', 'id', 'join'] -> ['api', 'games', 'id', 'join']
  const resource = pathSegments[2]; // 'games'
  const gameId = pathSegments[3]; // 'id' or actual game ID
  const action = pathSegments[4]; // 'join', 'status', 'pool'

  if (req.method === 'GET') {
    if (action === 'available') {
      return res.status(200).json(getAvailableGames());
    }
    if (action === 'active') {
      return res.status(200).json(getActiveGames());
    }
    if (gameId) {
      const game = db.getGame(gameId);
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }
      return res.status(200).json(ensureGameInstance(game));
    }
    return res.status(200).json(db.getAllGames().map(ensureGameInstance));
  }

  if (req.method === 'POST') {
    if (gameId && action === 'join') {
      const { playerAddress, password } = req.body;
      try {
        const game = joinGame(gameId, playerAddress, password);
        return res.status(200).json(game);
      } catch (error) {
        if (error.message === 'Game not found') return res.status(404).json({ error: 'Game not found' });
        if (error.message === 'Invalid password') return res.status(400).json({ error: 'Invalid password' });
        if (error.message === 'Game is full') return res.status(400).json({ error: 'Game is full' });
        return res.status(500).json({ error: 'Internal server error' });
      }
    }
    if (gameId && action === 'status') {
      const { status } = req.body;
      try {
        const game = updateGameStatus(gameId, status);
        return res.json(game);
      } catch (error) {
        if (error.message === 'Game not found') return res.status(404).json({ error: 'Game not found' });
        return res.status(500).json({ error: 'Internal server error' });
      }
    }
    if (gameId && action === 'pool') {
      const { amount } = req.body;
      try {
        const game = updatePoolAmount(gameId, amount);
        return res.json(game);
      } catch (error) {
        if (error.message === 'Game not found') return res.status(404).json({ error: 'Game not found' });
        return res.status(500).json({ error: 'Internal server error' });
      }
    }
    // Default POST for /api/games (create game)
    const gameData = req.body;
    try {
      const newGame = createGame(gameData);
      return res.status(201).json(ensureGameInstance(newGame));
    } catch (error) {
      console.error('Error creating game:', error);
      return res.status(500).json({ error: 'Failed to create game' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};