const db = require('./database');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      // Clean up old games
      db.cleanupOldGames();
      
      const stats = {
        totalGames: db.getAllGames().length,
        availableGames: db.getAvailableGames().length,
        activeGames: db.getActiveGames().length,
        cleanedUp: true,
        timestamp: Date.now()
      };
      
      console.log('Cleanup completed:', stats);
      return res.status(200).json(stats);
    } catch (error) {
      console.error('Cleanup error:', error);
      return res.status(500).json({ error: 'Cleanup failed' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};