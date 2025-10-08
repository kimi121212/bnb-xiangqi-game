export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { gameId } = req.query;

  if (!gameId) {
    return res.status(400).json({ error: 'Game ID is required' });
  }

  try {
    if (req.method === 'GET') {
      // For now, return a mock wallet address
      // In a real implementation, this would read from the privatekeys.md file
      const mockWallet = {
        gameId: gameId,
        address: `0x${Math.random().toString(16).substr(2, 40)}`, // Generate a mock address
        createdAt: Date.now()
      };

      return res.status(200).json(mockWallet);
    }

    if (req.method === 'POST') {
      const { action, winnerAddress, amount } = req.body;

      if (action === 'create') {
        // Create new game wallet (mock)
        const mockWallet = {
          gameId: gameId,
          address: `0x${Math.random().toString(16).substr(2, 40)}`,
          createdAt: Date.now()
        };

        return res.status(201).json(mockWallet);
      }

      if (action === 'sendToWinner') {
        if (!winnerAddress || !amount) {
          return res.status(400).json({ error: 'Winner address and amount are required' });
        }

        // Mock success response
        return res.status(200).json({
          success: true,
          message: 'Winnings sent to winner',
          winnerAddress,
          amount,
          hash: `0x${Math.random().toString(16).substr(2, 64)}` // Mock transaction hash
        });
      }

      return res.status(400).json({ error: 'Invalid action' });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Wallet API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
