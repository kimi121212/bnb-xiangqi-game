module.exports = async (req, res) => {
  console.log('API Index called:', req.method, req.url);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    message: 'BNB Xiangqi API is working!',
    method: req.method,
    url: req.url,
    timestamp: Date.now(),
    availableEndpoints: [
      '/api/health',
      '/api/test',
      '/api/status',
      '/api/games',
      '/api/debug',
      '/api/cleanup'
    ]
  });
};