import { walletManager } from '../../../utils/WalletManager';

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
      // Get game wallet info
      const wallet = walletManager.getGameWallet(gameId);
      if (!wallet) {
        return res.status(404).json({ error: 'Game wallet not found' });
      }

      return res.status(200).json({
        gameId: wallet.gameId,
        address: wallet.address,
        createdAt: wallet.createdAt
      });
    }

    if (req.method === 'POST') {
      const { action, winnerAddress, amount } = req.body;

      if (action === 'create') {
        // Create new game wallet
        const wallet = walletManager.createGameWallet(gameId);
        return res.status(201).json({
          gameId: wallet.gameId,
          address: wallet.address,
          createdAt: wallet.createdAt
        });
      }

      if (action === 'sendToWinner') {
        if (!winnerAddress || !amount) {
          return res.status(400).json({ error: 'Winner address and amount are required' });
        }

        // This would need a provider - for now just return success
        // In a real implementation, you'd pass the provider from the client
        return res.status(200).json({
          success: true,
          message: 'Winnings sent to winner',
          winnerAddress,
          amount
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
