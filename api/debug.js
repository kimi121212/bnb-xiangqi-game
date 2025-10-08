module.exports = async (req, res) => {
  console.log('Debug API called:', req.method, req.url);
  console.log('Headers:', req.headers);
  console.log('Query:', req.query);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    message: 'Debug API is working!',
    method: req.method,
    url: req.url,
    timestamp: Date.now(),
    headers: req.headers,
    query: req.query
  });
};
