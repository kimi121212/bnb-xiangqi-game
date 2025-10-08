import { ethers } from 'ethers';
import { ContractConfig, StakingContract, TransactionInfo } from '../types/blockchain';

export class BNBStakingContract implements StakingContract {
  private contract: ethers.Contract;
  private provider: ethers.Provider;
  private signer: ethers.Signer;

  constructor(config: ContractConfig, provider: ethers.Provider, signer: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
    this.contract = new ethers.Contract(config.address, config.abi, signer);
  }

  async stake(amount: string): Promise<TransactionInfo> {
    try {
      const tx = await this.contract.stake({ value: ethers.parseEther(amount) });
      const receipt = await tx.wait();
      
      return {
        hash: tx.hash,
        status: receipt.status === 1 ? 'success' : 'failed',
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: tx.gasPrice?.toString()
      };
    } catch (error) {
      console.error('Staking error:', error);
      throw error;
    }
  }

  async unstake(amount: string): Promise<TransactionInfo> {
    try {
      const tx = await this.contract.unstake(ethers.parseEther(amount));
      const receipt = await tx.wait();
      
      return {
        hash: tx.hash,
        status: receipt.status === 1 ? 'success' : 'failed',
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: tx.gasPrice?.toString()
      };
    } catch (error) {
      console.error('Unstaking error:', error);
      throw error;
    }
  }

  async claimRewards(): Promise<TransactionInfo> {
    try {
      const tx = await this.contract.claimRewards();
      const receipt = await tx.wait();
      
      return {
        hash: tx.hash,
        status: receipt.status === 1 ? 'success' : 'failed',
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: tx.gasPrice?.toString()
      };
    } catch (error) {
      console.error('Claim rewards error:', error);
      throw error;
    }
  }

  async getStakingInfo(address: string): Promise<{
    stakedAmount: string;
    rewards: string;
    lockPeriod: number;
  }> {
    try {
      const [stakedAmount, rewards, lockPeriod] = await Promise.all([
        this.contract.getStakedAmount(address),
        this.contract.getRewards(address),
        this.contract.getLockPeriod(address)
      ]);
      
      return {
        stakedAmount: ethers.formatEther(stakedAmount),
        rewards: ethers.formatEther(rewards),
        lockPeriod: Number(lockPeriod)
      };
    } catch (error) {
      console.error('Get staking info error:', error);
      throw error;
    }
  }
}

// Smart Contract ABI for BNB Staking
export const BNB_STAKING_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "stake",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "unstake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getStakedAmount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getRewards",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getLockPeriod",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalStaked",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getRewardRate",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  'bsc': '0x...', // Mainnet BSC address
  'bsc-testnet': '0x...' // Testnet BSC address
};
