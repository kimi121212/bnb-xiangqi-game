const db = require('./database');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const stats = {
        totalGames: db.getAllGames().length,
        availableGames: db.getAvailableGames().length,
        activeGames: db.getActiveGames().length,
        timestamp: Date.now(),
        status: 'OK',
        database: 'Connected'
      };
      
      console.log('Status check:', stats);
      return res.status(200).json(stats);
    } catch (error) {
      console.error('Status error:', error);
      return res.status(500).json({ 
        error: 'Status check failed',
        status: 'ERROR',
        database: 'Disconnected'
      });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};
