import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import { BSC_GAS_SETTINGS } from '../config/bsc';
import { GasPriceService } from '../utils/GasPriceService';

export interface TransactionResult {
  success: boolean;
  hash?: string;
  error?: string;
}

export const useBNBTransactions = () => {
  const { walletInfo, signer } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Send BNB to game contract
  const stakeBNB = useCallback(async (amount: number, gameContractAddress: string): Promise<TransactionResult> => {
    if (!signer || !walletInfo.isConnected) {
      return { success: false, error: 'Wallet not connected' };
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate address format
      if (!ethers.isAddress(gameContractAddress)) {
        throw new Error('Invalid contract address format');
      }
      
      // Convert BNB to wei
      const amountWei = ethers.parseEther(amount.toString());
      
      // Get optimized gas price using Rabby-style fast gas pricing
      let gasPrice;
      try {
        const gasPriceResult = await GasPriceService.getFastGasPrice(signer.provider);
        gasPrice = BigInt(gasPriceResult.gasPrice);
        console.log(`Using ${gasPriceResult.source} gas price: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`);
      } catch (error) {
        console.warn('Optimized gas price failed, using fallback:', error);
        // Fallback: use a reasonable gas price for BSC (6 gwei for fast)
        gasPrice = ethers.parseUnits('6', 'gwei');
      }
      
      // Create transaction to send BNB to game contract on BSC
      const tx = await signer.sendTransaction({
        to: gameContractAddress,
        value: amountWei,
        gasLimit: BSC_GAS_SETTINGS.TRANSFER_GAS_LIMIT,
        gasPrice: gasPrice
      });

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        setSuccess(`Successfully staked ${amount} BNB`);
        return { success: true, hash: tx.hash };
      } else {
        setError('Transaction failed');
        return { success: false, error: 'Transaction failed' };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Transaction failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [signer, walletInfo.isConnected]);

  // Refund BNB from pool wallet to player
  const refundBNB = useCallback(async (amount: number, fromAddress: string, toAddress: string): Promise<TransactionResult> => {
    if (!signer || !walletInfo.isConnected) {
      return { success: false, error: 'Wallet not connected' };
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Convert BNB to wei
      const amountWei = ethers.parseEther(amount.toString());
      
      // Get optimized gas price using Rabby-style fast gas pricing
      let gasPrice;
      try {
        const gasPriceResult = await GasPriceService.getFastGasPrice(signer.provider);
        gasPrice = BigInt(gasPriceResult.gasPrice);
        console.log(`Using ${gasPriceResult.source} gas price: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`);
      } catch (error) {
        console.warn('Optimized gas price failed, using fallback:', error);
        // Fallback: use a reasonable gas price for BSC (6 gwei for fast)
        gasPrice = ethers.parseUnits('6', 'gwei');
      }
      
      // Create transaction to send BNB from pool wallet to player on BSC
      const tx = await signer.sendTransaction({
        to: toAddress,
        value: amountWei,
        gasLimit: BSC_GAS_SETTINGS.TRANSFER_GAS_LIMIT,
        gasPrice: gasPrice
      });

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        setSuccess(`Successfully refunded ${amount} BNB`);
        return { success: true, hash: tx.hash };
      } else {
        setError('Refund transaction failed');
        return { success: false, error: 'Refund transaction failed' };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Refund failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [signer, walletInfo.isConnected]);

  // Withdraw BNB from game contract (for winners)
  const claimWinnings = useCallback(async (gameContractAddress: string): Promise<TransactionResult> => {
    if (!signer || !walletInfo.isConnected) {
      return { success: false, error: 'Wallet not connected' };
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Implement smart contract interaction for claiming winnings
      // For now, simulate the transaction
      const tx = await signer.sendTransaction({
        to: walletInfo.address,
        value: 0, // This would be the actual winnings amount
        gasLimit: 21000,
      });

      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        setSuccess('Winnings claimed successfully');
        return { success: true, hash: tx.hash };
      } else {
        setError('Claim failed');
        return { success: false, error: 'Claim failed' };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Claim failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [signer, walletInfo.isConnected, walletInfo.address]);

  // Check if user has sufficient BNB balance
  const checkBalance = useCallback(async (requiredAmount: number): Promise<boolean> => {
    if (!walletInfo.balance) return false;
    
    const balance = parseFloat(walletInfo.balance);
    return balance >= requiredAmount;
  }, [walletInfo.balance]);

  // Get gas price for BSC
  const getGasPrice = useCallback(async (): Promise<string> => {
    if (!signer) return '0';
    
    try {
      const feeData = await signer.getFeeData();
      return feeData.gasPrice?.toString() || '0';
    } catch (error) {
      console.error('Failed to get gas price:', error);
      return '0';
    }
  }, [signer]);

  // Estimate gas for transaction
  const estimateGas = useCallback(async (to: string, value: string): Promise<string> => {
    if (!signer) return '21000';
    
    try {
      const gasEstimate = await signer.estimateGas({
        to,
        value: ethers.parseEther(value),
      });
      return gasEstimate.toString();
    } catch (error) {
      console.error('Failed to estimate gas:', error);
      return '21000'; // Default gas limit
    }
  }, [signer]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return {
    stakeBNB,
    refundBNB,
    claimWinnings,
    checkBalance,
    getGasPrice,
    estimateGas,
    clearMessages,
    isLoading,
    error,
    success
  };
};
