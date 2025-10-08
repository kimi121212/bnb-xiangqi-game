import { useState, useEffect, useCallback } from 'react';
import { BNBStakingContract, BNB_STAKING_ABI, CONTRACT_ADDRESSES } from '../contracts/BNBStakingContract';
import { StakingInfo } from '../types/game';
import { useWallet } from './useWallet';

export const useStaking = () => {
  const { walletInfo, provider, signer } = useWallet();
  const [stakingInfo, setStakingInfo] = useState<StakingInfo>({
    totalStaked: 0,
    playerStake: 0,
    rewardRate: 0,
    lockPeriod: 0,
    canUnstake: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [stakingContract, setStakingContract] = useState<BNBStakingContract | null>(null);

  // Initialize staking contract
  useEffect(() => {
    if (provider && signer) {
      const network = walletInfo.chainId === 56 ? 'bsc' : 'bsc-testnet';
      const contractAddress = CONTRACT_ADDRESSES[network];
      
      if (contractAddress) {
        const contract = new BNBStakingContract(
          { address: contractAddress, abi: BNB_STAKING_ABI, network },
          provider,
          signer
        );
        setStakingContract(contract);
      }
    }
  }, [provider, signer, walletInfo.chainId]);

  // Load staking information
  const loadStakingInfo = useCallback(async () => {
    if (!stakingContract || !walletInfo.address) return;

    setIsLoading(true);
    try {
      const [stakedAmount, rewards, lockPeriod] = await Promise.all([
        stakingContract.getStakingInfo(walletInfo.address),
        stakingContract.getStakingInfo(walletInfo.address),
        stakingContract.getStakingInfo(walletInfo.address)
      ]);

      setStakingInfo({
        totalStaked: parseFloat(stakedAmount.stakedAmount),
        playerStake: parseFloat(stakedAmount.stakedAmount),
        rewardRate: 0.1, // 10% APY
        lockPeriod: lockPeriod.lockPeriod,
        canUnstake: lockPeriod.lockPeriod === 0
      });
    } catch (error) {
      console.error('Failed to load staking info:', error);
    } finally {
      setIsLoading(false);
    }
  }, [stakingContract, walletInfo.address]);

  // Stake BNB
  const stake = useCallback(async (amount: string) => {
    if (!stakingContract) {
      throw new Error('Staking contract not initialized');
    }

    setIsLoading(true);
    try {
      const result = await stakingContract.stake(amount);
      await loadStakingInfo(); // Refresh staking info
      return result;
    } catch (error) {
      console.error('Staking failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [stakingContract, loadStakingInfo]);

  // Unstake BNB
  const unstake = useCallback(async (amount: string) => {
    if (!stakingContract) {
      throw new Error('Staking contract not initialized');
    }

    setIsLoading(true);
    try {
      const result = await stakingContract.unstake(amount);
      await loadStakingInfo(); // Refresh staking info
      return result;
    } catch (error) {
      console.error('Unstaking failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [stakingContract, loadStakingInfo]);

  // Claim rewards
  const claimRewards = useCallback(async () => {
    if (!stakingContract) {
      throw new Error('Staking contract not initialized');
    }

    setIsLoading(true);
    try {
      const result = await stakingContract.claimRewards();
      await loadStakingInfo(); // Refresh staking info
      return result;
    } catch (error) {
      console.error('Claim rewards failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [stakingContract, loadStakingInfo]);

  // Load staking info when wallet connects
  useEffect(() => {
    if (walletInfo.isConnected && stakingContract) {
      loadStakingInfo();
    }
  }, [walletInfo.isConnected, stakingContract, loadStakingInfo]);

  return {
    stakingInfo,
    isLoading,
    stake,
    unstake,
    claimRewards,
    loadStakingInfo
  };
};
