export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'OK',
      timestamp: Date.now(),
      message: 'BNB Xiangqi API is working',
      version: '1.0.0'
    });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}