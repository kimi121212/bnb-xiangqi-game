import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

// Persistent file-based database for Vercel
const GAMES_FILE = path.join(process.cwd(), 'data', 'games.json');

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.dirname(GAMES_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Load games from persistent file
const loadGames = () => {
  try {
    ensureDataDir();
    if (fs.existsSync(GAMES_FILE)) {
      const data = fs.readFileSync(GAMES_FILE, 'utf8');
      const games = JSON.parse(data);
      console.log(`📊 Loaded ${games.length} games from persistent storage`);
      return games;
    }
  } catch (error) {
    console.error('Error loading games:', error);
  }
  console.log('📊 No existing games file, starting fresh');
  return [];
};

// Save games to persistent file
const saveGames = (games) => {
  try {
    ensureDataDir();
    fs.writeFileSync(GAMES_FILE, JSON.stringify(games, null, 2));
    console.log(`💾 Saved ${games.length} games to persistent storage`);
  } catch (error) {
    console.error('Error saving games:', error);
  }
};

// Game room management functions
const createGameRoom = (gameData) => {
  const games = loadGames();
  const newGame = {
    id: uuidv4(),
    ...gameData,
    createdAt: Date.now(),
    players: [],
    status: 'waiting',
    poolAmount: 0,
    stakeCount: 0,
    spectators: 0,
    moves: [], // Store game moves
    currentPlayer: 'red', // Xiangqi starts with red
    gameState: 'waiting_for_players'
  };
  
  games.push(newGame);
  saveGames(games);
  console.log(`🎮 Created game room: ${newGame.id} - ${newGame.title}`);
  console.log(`📊 Total active game rooms: ${games.length}`);
  return newGame;
};

const getGameRoom = (gameId) => {
  const games = loadGames();
  const game = games.find(g => g.id === gameId);
  if (!game) {
    console.log(`❌ Game room not found: ${gameId}`);
    console.log(`📋 Available game rooms: ${games.map(g => g.id).join(', ')}`);
  } else {
    console.log(`✅ Game room found: ${gameId} - ${game.title}`);
  }
  return game;
};

const getAllGameRooms = () => {
  const games = loadGames();
  console.log(`📊 Returning ${games.length} game rooms`);
  return games;
};

const joinGameRoom = (gameId, playerAddress) => {
  const games = loadGames();
  const gameIndex = games.findIndex(g => g.id === gameId);
  
  if (gameIndex === -1) {
    throw new Error('Game room not found');
  }
  
  const game = games[gameIndex];
  
  if (game.status !== 'waiting') {
    throw new Error('Game room is not accepting new players');
  }
  
  if (game.players.includes(playerAddress)) {
    console.log(`👤 Player ${playerAddress} already in game ${gameId}`);
    return game;
  }
  
  game.players.push(playerAddress);
  
  // Update game status based on player count
  if (game.players.length >= game.maxPlayers) {
    game.status = 'active';
    game.gameState = 'in_progress';
    console.log(`🚀 Game room ${gameId} is now active with ${game.players.length} players`);
  }
  
  saveGames(games);
  console.log(`👤 Player ${playerAddress} joined game room ${gameId}`);
  return game;
};

const updateGameRoomStatus = (gameId, status) => {
  const games = loadGames();
  const gameIndex = games.findIndex(g => g.id === gameId);
  
  if (gameIndex === -1) {
    throw new Error('Game room not found');
  }
  
  const game = games[gameIndex];
  game.status = status;
  if (status === 'active') {
    game.gameState = 'in_progress';
  }
  
  saveGames(games);
  console.log(`🔄 Game room ${gameId} status updated to ${status}`);
  return game;
};

const updateGameRoomPool = (gameId, amount) => {
  const games = loadGames();
  const gameIndex = games.findIndex(g => g.id === gameId);
  
  if (gameIndex === -1) {
    throw new Error('Game room not found');
  }
  
  const game = games[gameIndex];
  game.poolAmount = amount;
  game.stakeCount += 1;
  
  saveGames(games);
  console.log(`💰 Game room ${gameId} pool updated to ${amount} BNB`);
  return game;
};

const addMoveToGame = (gameId, move) => {
  const games = loadGames();
  const gameIndex = games.findIndex(g => g.id === gameId);
  
  if (gameIndex === -1) {
    throw new Error('Game room not found');
  }
  
  const game = games[gameIndex];
  game.moves.push({
    ...move,
    timestamp: Date.now(),
    moveNumber: game.moves.length + 1
  });
  
  // Switch current player
  game.currentPlayer = game.currentPlayer === 'red' ? 'black' : 'red';
  
  saveGames(games);
  console.log(`♟️ Move added to game room ${gameId}: ${move.from} -> ${move.to}`);
  return game;
};

const getGameRoomMoves = (gameId) => {
  const game = getGameRoom(gameId);
  if (!game) {
    throw new Error('Game room not found');
  }
  
  return game.moves;
};

// Clean up old games (older than 24 hours)
const cleanupOldGames = () => {
  const games = loadGames();
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  
  const initialCount = games.length;
  const filteredGames = games.filter(game => {
    const isOld = (now - game.createdAt) > oneDay;
    if (isOld) {
      console.log(`🧹 Cleaning up old game room: ${game.id}`);
    }
    return !isOld;
  });
  
  const cleanedCount = initialCount - filteredGames.length;
  if (cleanedCount > 0) {
    saveGames(filteredGames);
    console.log(`🧹 Cleaned up ${cleanedCount} old game rooms`);
  }
  
  return filteredGames;
};

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Clean up old games periodically
    if (Math.random() < 0.1) { // 10% chance to cleanup
      cleanupOldGames();
    }

    if (req.method === 'GET') {
      const { gameId, action } = req.query;
      
      if (gameId && action === 'moves') {
        // Get moves for a specific game
        const moves = getGameRoomMoves(gameId);
        return res.status(200).json(moves);
      }
      
      if (gameId) {
        // Get specific game room
        const game = getGameRoom(gameId);
        if (!game) {
          return res.status(404).json({ error: 'Game room not found' });
        }
        return res.status(200).json(game);
      }
      
      // Get all game rooms
      const allGames = getAllGameRooms();
      return res.status(200).json(allGames);
    }

    if (req.method === 'POST') {
      const { action, gameId, playerAddress, status, amount, move } = req.body;
      
      if (action === 'create') {
        // Create new game room
        const { title, stakeAmount, maxPlayers, isPrivate, password, host } = req.body;
        
        if (!title || !stakeAmount || !host) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const newGame = createGameRoom({
          title,
          stakeAmount: parseFloat(stakeAmount),
          maxPlayers: parseInt(maxPlayers) || 2,
          isPrivate: Boolean(isPrivate),
          password: password || '',
          host
        });

        return res.status(201).json(newGame);
      }
      
      if (action === 'join') {
        // Join game room
        if (!gameId || !playerAddress) {
          return res.status(400).json({ error: 'Game ID and player address required' });
        }
        
        const game = joinGameRoom(gameId, playerAddress);
        return res.status(200).json(game);
      }
      
      if (action === 'updateStatus') {
        // Update game room status
        if (!gameId || !status) {
          return res.status(400).json({ error: 'Game ID and status required' });
        }
        
        const game = updateGameRoomStatus(gameId, status);
        return res.status(200).json(game);
      }
      
      if (action === 'updatePool') {
        // Update game room pool
        if (!gameId || amount === undefined) {
          return res.status(400).json({ error: 'Game ID and amount required' });
        }
        
        const game = updateGameRoomPool(gameId, amount);
        return res.status(200).json(game);
      }
      
      if (action === 'addMove') {
        // Add move to game room
        if (!gameId || !move) {
          return res.status(400).json({ error: 'Game ID and move required' });
        }
        
        const game = addMoveToGame(gameId, move);
        return res.status(200).json(game);
      }
      
      return res.status(400).json({ error: 'Invalid action' });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('🎮 Game Room API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}