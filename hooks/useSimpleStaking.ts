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
      
      // Create a proper game wallet address (deterministic based on gameId)
      let gameWalletAddress;
      try {
        // Use a more robust method to generate a valid Ethereum address
        const gameIdHash = ethers.keccak256(ethers.toUtf8Bytes(gameId));
        gameWalletAddress = `0x${gameIdHash.slice(2, 42)}`;
        
        // Validate the address format
        if (!ethers.isAddress(gameWalletAddress)) {
          throw new Error('Invalid address format');
        }
      } catch (error) {
        console.warn('Keccak256 method failed, using fallback:', error);
        // Fallback: create a simple deterministic address
        const cleanGameId = gameId.replace(/[^a-zA-Z0-9]/g, '');
        const paddedId = cleanGameId.padEnd(40, '0').substring(0, 40);
        gameWalletAddress = `0x${paddedId}`;
        
        if (!ethers.isAddress(gameWalletAddress)) {
          throw new Error('Failed to generate valid game wallet address');
        }
      }
      
      console.log(`🎯 Sending to game wallet: ${gameWalletAddress}`);

      // Convert BNB to wei
      const amountWei = ethers.parseEther(amount.toString());
      
      // Get gas price with better error handling
      let gasPrice;
      try {
        if (!signer.provider) {
          throw new Error('No provider available');
        }
        const feeData = await signer.provider.getFeeData();
        gasPrice = feeData?.gasPrice || ethers.parseUnits('5', 'gwei');
        console.log(`⛽ Gas price: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`);
      } catch (error) {
        console.warn('Using fallback gas price:', error);
        gasPrice = ethers.parseUnits('5', 'gwei');
      }

      // Validate amount
      if (amount <= 0) {
        throw new Error('Stake amount must be greater than 0');
      }

      // Check user balance
      const userBalance = await signer.provider?.getBalance(walletInfo.address);
      if (userBalance && userBalance < amountWei) {
        throw new Error('Insufficient BNB balance');
      }

      console.log(`📝 Sending ${amount} BNB to ${gameWalletAddress}`);
      
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
      // Generate the same game wallet address as in stakeBNB
      let gameWalletAddress;
      try {
        const gameIdHash = ethers.keccak256(ethers.toUtf8Bytes(gameId));
        gameWalletAddress = `0x${gameIdHash.slice(2, 42)}`;
      } catch (error) {
        const cleanGameId = gameId.replace(/[^a-zA-Z0-9]/g, '');
        const paddedId = cleanGameId.padEnd(40, '0').substring(0, 40);
        gameWalletAddress = `0x${paddedId}`;
      }
      
      // For now, just return false - we'll implement proper checking later
      // This would require checking transaction history
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