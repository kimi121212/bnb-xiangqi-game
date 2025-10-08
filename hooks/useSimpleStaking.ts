import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';

export interface SimpleStakingResult {
  success: boolean;
  hash?: string;
  error?: string;
}

export const useSimpleStaking = () => {
  const { walletInfo, signer } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Simple BNB staking - just send BNB to a game wallet
  const stakeBNB = useCallback(async (amount: number, gameId: string): Promise<SimpleStakingResult> => {
    if (!signer || !walletInfo.isConnected) {
      return { success: false, error: 'Wallet not connected' };
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log(`💰 Staking ${amount} BNB for game ${gameId}`);
      
      // Create a simple game wallet address (deterministic based on gameId)
      const gameWalletAddress = `0x${gameId.replace(/-/g, '').substring(0, 40)}`;
      console.log(`🎯 Sending to game wallet: ${gameWalletAddress}`);

      // Convert BNB to wei
      const amountWei = ethers.parseEther(amount.toString());
      
      // Get gas price
      let gasPrice;
      try {
        const feeData = await signer.provider?.getFeeData();
        gasPrice = feeData?.gasPrice || ethers.parseUnits('5', 'gwei');
      } catch (error) {
        console.warn('Using fallback gas price');
        gasPrice = ethers.parseUnits('5', 'gwei');
      }

      // Send BNB transaction
      const tx = await signer.sendTransaction({
        to: gameWalletAddress,
        value: amountWei,
        gasLimit: 21000,
        gasPrice: gasPrice
      });

      console.log(`📝 Transaction sent: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        setSuccess(`Successfully staked ${amount} BNB`);
        console.log(`✅ Transaction confirmed: ${tx.hash}`);
        return { success: true, hash: tx.hash };
      } else {
        setError('Transaction failed');
        return { success: false, error: 'Transaction failed' };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Staking failed';
      setError(errorMessage);
      console.error('❌ Staking error:', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [signer, walletInfo.isConnected]);

  // Check if user has staked in a game
  const hasStaked = useCallback(async (gameId: string): Promise<boolean> => {
    if (!walletInfo.isConnected || !gameId) return false;
    
    try {
      // Simple check - if user has any BNB transactions to the game wallet
      const gameWalletAddress = `0x${gameId.replace(/-/g, '').substring(0, 40)}`;
      
      // For now, just return false - we'll implement proper checking later
      return false;
    } catch (error) {
      console.error('Error checking stake:', error);
      return false;
    }
  }, [walletInfo.isConnected]);

  return {
    stakeBNB,
    hasStaked,
    isLoading,
    error,
    success,
  };
};