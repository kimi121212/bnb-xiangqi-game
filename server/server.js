const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// CORS configuration for production
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.FRONTEND_URL || 'https://bnb-xiangqi-game-production.up.railway.app']
  : ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"];

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5001;

// For Vercel, we need to export the app for serverless functions
if (process.env.VERCEL) {
  module.exports = app;
} else {
  // Only start the server if not in Vercel environment
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP for Socket.IO
}));

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Serve static files from the dist directory (built frontend)
app.use(express.static(path.join(__dirname, '../dist')));

// API routes
app.get('/api/games', (req, res) => {
  res.json(Array.from(games.values()));
});

app.get('/api/games/available', (req, res) => {
  const availableGames = Array.from(games.values()).filter(game => 
    game.status === 'waiting' && !game.isPrivate
  );
  res.json(availableGames);
});

app.get('/api/games/:id', (req, res) => {
  const game = games.get(req.params.id);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  res.json(game);
});

app.get('/api/stats', (req, res) => {
  res.json({
    totalGames: games.size,
    activeGames: Array.from(games.values()).filter(g => g.status === 'active').length,
    waitingGames: Array.from(games.values()).filter(g => g.status === 'waiting').length,
    totalPlayers: players.size
  });
});

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// File-based persistence for games
const fs = require('fs');
const path = require('path');
const GAMES_FILE = path.join(__dirname, 'games.json');

// Load games from file or create empty Map
let games = new Map();
const players = new Map();
const spectators = new Map();

// Load games from file on startup
try {
  if (fs.existsSync(GAMES_FILE)) {
    const gamesData = JSON.parse(fs.readFileSync(GAMES_FILE, 'utf8'));
    games = new Map(Object.entries(gamesData));
    console.log(`Loaded ${games.size} games from file`);
  }
} catch (error) {
  console.error('Error loading games from file:', error);
  games = new Map();
}

// Save games to file
const saveGames = () => {
  try {
    const gamesObj = Object.fromEntries(games);
    fs.writeFileSync(GAMES_FILE, JSON.stringify(gamesObj, null, 2));
  } catch (error) {
    console.error('Error saving games to file:', error);
  }
};

// Clean up old games (older than 24 hours)
const cleanupOldGames = () => {
  const now = Date.now();
  const oneDayAgo = now - (24 * 60 * 60 * 1000);
  
  for (const [gameId, game] of games.entries()) {
    if (game.createdAt < oneDayAgo && game.status === 'waiting') {
      games.delete(gameId);
      console.log(`Cleaned up old game: ${gameId}`);
    }
  }
  
  if (games.size > 0) {
    saveGames();
  }
};

// Save games every 5 minutes and cleanup old games
setInterval(() => {
  saveGames();
  cleanupOldGames();
}, 5 * 60 * 1000);

// Game management functions
const createGame = (gameData) => {
  const gameId = uuidv4();
  // Create a real Ethereum wallet address for this game pool
  const { ethers } = require('ethers');
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
    poolWalletAddress: poolWalletAddress, // Wallet created immediately
    stakeCount: 0 // Track number of stakes (allows same wallet multiple times)
  };
  
  games.set(gameId, game);
  saveGames(); // Save to file
  console.log(`Game created: ${gameId} by ${gameData.host} with wallet: ${poolWalletAddress}`);
  return game;
};

const joinGame = (gameId, playerAddress) => {
  const game = games.get(gameId);
  if (!game) {
    return { success: false, error: 'Game not found' };
  }
  
  // For multi-browser support, allow same wallet to join multiple times
  // Only prevent joining if the game is already full (2 players)
  if (game.players.length >= game.maxPlayers && !game.players.includes(playerAddress)) {
    return { success: false, error: 'Game is full' };
  }
  
  // If player already in game, allow re-entry
  if (game.players.includes(playerAddress)) {
    console.log(`Player ${playerAddress} already in game, allowing re-entry for multi-browser support`);
    return { success: true, game };
  }
  
  // Add player to game
  game.players.push(playerAddress);
  
  // Update game status if it reaches max players
  if (game.players.length === game.maxPlayers) {
    game.status = 'active';
  }
  
  saveGames(); // Save to file
  console.log(`Player ${playerAddress} joined game ${gameId}`);
  return { success: true, game };
};

const joinPrivateGame = (gameId, playerAddress, password) => {
  const game = games.get(gameId);
  if (!game) {
    return { success: false, error: 'Game not found' };
  }
  
  if (!game.isPrivate) {
    return { success: false, error: 'Game is not private' };
  }
  
  if (game.password !== password) {
    return { success: false, error: 'Invalid password' };
  }
  
  return joinGame(gameId, playerAddress);
};

const addSpectator = (gameId) => {
  const game = games.get(gameId);
  if (game) {
    game.spectators++;
    console.log(`Spectator added to game ${gameId}`);
    return game;
  }
  return null;
};

const removeSpectator = (gameId) => {
  const game = games.get(gameId);
  if (game && game.spectators > 0) {
    game.spectators--;
    console.log(`Spectator removed from game ${gameId}`);
    return game;
  }
  return null;
};

const updateGameStatus = (gameId, status) => {
  const game = games.get(gameId);
  if (game) {
    game.status = status;
    console.log(`Game ${gameId} status updated to ${status}`);
    return game;
  }
  return null;
};

const updatePoolAmount = (gameId, amount) => {
  const game = games.get(gameId);
  if (game) {
    game.poolAmount = amount;
    console.log(`Game ${gameId} pool updated to ${amount} BNB`);
    return game;
  }
  return null;
};

const removeGame = (gameId) => {
  const game = games.get(gameId);
  if (game) {
    games.delete(gameId);
    console.log(`Game removed: ${gameId}`);
    return true;
  }
  return false;
};

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: Date.now() });
});

app.get('/api/games', (req, res) => {
  const allGames = Array.from(games.values());
  res.json(allGames);
});

app.get('/api/games/available', (req, res) => {
  const availableGames = Array.from(games.values()).filter(game => 
    !game.isPrivate && 
    game.status === 'waiting' && 
    game.players.length < game.maxPlayers
  );
  res.json(availableGames);
});

app.get('/api/games/active', (req, res) => {
  const activeGames = Array.from(games.values()).filter(game => 
    game.status === 'active'
  );
  res.json(activeGames);
});

app.get('/api/games/:gameId', (req, res) => {
  const game = games.get(req.params.gameId);
  if (game) {
    res.json(game);
  } else {
    res.status(404).json({ error: 'Game not found' });
  }
});

app.get('/api/stats', (req, res) => {
  const allGames = Array.from(games.values());
  const stats = {
    totalGames: allGames.length,
    waitingGames: allGames.filter(g => g.status === 'waiting').length,
    activeGames: allGames.filter(g => g.status === 'active').length,
    finishedGames: allGames.filter(g => g.status === 'finished').length,
    totalPlayers: allGames.reduce((sum, g) => sum + g.players.length, 0),
    totalSpectators: allGames.reduce((sum, g) => sum + g.spectators, 0),
    connectedPlayers: players.size,
    connectedSpectators: spectators.size
  };
  res.json(stats);
});

// POST endpoints for HTTP API
app.post('/api/games', (req, res) => {
  try {
    const game = createGame(req.body);
    res.status(201).json(game);
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ error: 'Failed to create game' });
  }
});

app.post('/api/games/:gameId/join', (req, res) => {
  try {
    const { gameId } = req.params;
    const { playerAddress, password } = req.body;
    
    let result;
    if (password) {
      result = joinPrivateGame(gameId, playerAddress, password);
    } else {
      result = joinGame(gameId, playerAddress);
    }
    
    if (result.success) {
      res.json(result.game);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error joining game:', error);
    res.status(500).json({ error: 'Failed to join game' });
  }
});

app.post('/api/games/:gameId/status', (req, res) => {
  try {
    const { gameId } = req.params;
    const { status } = req.body;
    
    const game = updateGameStatus(gameId, status);
    if (game) {
      res.json(game);
    } else {
      res.status(404).json({ error: 'Game not found' });
    }
  } catch (error) {
    console.error('Error updating game status:', error);
    res.status(500).json({ error: 'Failed to update game status' });
  }
});

app.post('/api/games/:gameId/pool', (req, res) => {
  try {
    const { gameId } = req.params;
    const { amount } = req.body;
    
    const game = updatePoolAmount(gameId, amount);
    if (game) {
      res.json(game);
    } else {
      res.status(404).json({ error: 'Game not found' });
    }
  } catch (error) {
    console.error('Error updating pool amount:', error);
    res.status(500).json({ error: 'Failed to update pool amount' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Player joins
  socket.on('player-join', (data) => {
    const { playerAddress } = data;
    players.set(socket.id, playerAddress);
    console.log(`Player ${playerAddress} connected`);
    
    // Send current games to the player
    socket.emit('games-update', Array.from(games.values()));
  });
  
  // Spectator joins
  socket.on('spectator-join', (data) => {
    const { gameId } = data;
    spectators.set(socket.id, gameId);
    console.log(`Spectator connected to game ${gameId}`);
    
    // Join spectator to game room
    socket.join(`game-${gameId}`);
    
    // Add spectator to game
    const game = addSpectator(gameId);
    if (game) {
      io.emit('games-update', Array.from(games.values()));
    }
  });
  
  // Create game
  socket.on('create-game', (data) => {
    const game = createGame(data);
    socket.emit('game-created', game);
    io.emit('games-update', Array.from(games.values()));
  });
  
  // Join game
  socket.on('join-game', (data) => {
    const { gameId, playerAddress } = data;
    const result = joinGame(gameId, playerAddress);
    
    if (result.success) {
      socket.emit('game-joined', result.game);
      io.emit('games-update', Array.from(games.values()));
    } else {
      socket.emit('join-error', result.error);
    }
  });
  
  // Join private game
  socket.on('join-private-game', (data) => {
    const { gameId, playerAddress, password } = data;
    const result = joinPrivateGame(gameId, playerAddress, password);
    
    if (result.success) {
      socket.emit('game-joined', result.game);
      io.emit('games-update', Array.from(games.values()));
    } else {
      socket.emit('join-error', result.error);
    }
  });
  
  // Watch game
  socket.on('watch-game', (data) => {
    const { gameId } = data;
    socket.join(`game-${gameId}`);
    
    const game = addSpectator(gameId);
    if (game) {
      socket.emit('game-watched', game);
      io.emit('games-update', Array.from(games.values()));
    }
  });
  
  // Update game status
  socket.on('update-game-status', (data) => {
    const { gameId, status } = data;
    const game = updateGameStatus(gameId, status);
    
    if (game) {
      io.emit('games-update', Array.from(games.values()));
      io.to(`game-${gameId}`).emit('game-status-updated', game);
    }
  });
  
  // Update pool amount
  socket.on('update-pool-amount', (data) => {
    const { gameId, amount } = data;
    const game = updatePoolAmount(gameId, amount);
    
    if (game) {
      io.emit('games-update', Array.from(games.values()));
      io.to(`game-${gameId}`).emit('pool-updated', game);
    }
  });
  
  // Make move
  socket.on('make-move', (data) => {
    const { gameId, from, to, playerAddress } = data;
    const game = games.get(gameId);
    
    if (game && game.players.includes(playerAddress)) {
      // Broadcast move to all players and spectators
      io.to(`game-${gameId}`).emit('move-made', {
        from,
        to,
        player: playerAddress,
        timestamp: Date.now()
      });
    }
  });
  
  // Disconnect handling
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Remove from players
    if (players.has(socket.id)) {
      const playerAddress = players.get(socket.id);
      players.delete(socket.id);
      console.log(`Player ${playerAddress} disconnected`);
    }
    
    // Remove from spectators
    if (spectators.has(socket.id)) {
      const gameId = spectators.get(socket.id);
      spectators.delete(socket.id);
      
      const game = removeSpectator(gameId);
      if (game) {
        io.emit('games-update', Array.from(games.values()));
      }
    }
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 BNB Xiangqi Server running on port ${PORT}`);
  console.log(`🌐 Server accessible at: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎮 Games API: http://localhost:${PORT}/api/games`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
