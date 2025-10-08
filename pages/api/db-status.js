import fs from 'fs';
import path from 'path';

const GAMES_FILE = path.join(process.cwd(), 'data', 'games.json');

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const dataDir = path.dirname(GAMES_FILE);
      const fileExists = fs.existsSync(GAMES_FILE);
      const dirExists = fs.existsSync(dataDir);
      
      let games = [];
      let fileSize = 0;
      
      if (fileExists) {
        const data = fs.readFileSync(GAMES_FILE, 'utf8');
        games = JSON.parse(data);
        fileSize = fs.statSync(GAMES_FILE).size;
      }
      
      return res.status(200).json({
        status: 'OK',
        database: {
          directoryExists: dirExists,
          fileExists: fileExists,
          fileSize: fileSize,
          gamesCount: games.length,
          games: games.map(g => ({
            id: g.id,
            title: g.title,
            status: g.status,
            players: g.players.length,
            createdAt: g.createdAt
          }))
        },
        timestamp: Date.now()
      });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Database Status Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal Server Error',
      status: 'ERROR'
    });
  }
}
