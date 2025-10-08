// Simple in-memory store for games
let games = new Map();

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('Games API called:', req.method, req.url);

  if (req.method === 'GET') {
    const allGames = Array.from(games.values());
    console.log('Returning games:', allGames.length);
    return res.status(200).json(allGames);
  }

  if (req.method === 'POST') {
    const gameData = req.body;
    console.log('Creating game with data:', gameData);
    
    const gameId = `game_${Date.now()}`;
    const newGame = {
      id: gameId,
      title: gameData.title || 'New Game',
      stakeAmount: gameData.stakeAmount || '0.1',
      players: [],
      maxPlayers: gameData.maxPlayers || 2,
      status: 'waiting',
      isPrivate: gameData.isPrivate || false,
      password: gameData.password || '',
      createdAt: Date.now(),
      host: gameData.host || 'unknown',
      spectators: 0,
      poolAmount: 0,
      poolWalletAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      stakeCount: 0
    };
    
    games.set(gameId, newGame);
    console.log(`Game created: ${gameId}`);
    return res.status(201).json(newGame);
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
