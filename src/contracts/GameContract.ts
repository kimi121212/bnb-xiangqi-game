import { ethers } from 'ethers';
import { ContractConfig, GameContract, TransactionInfo } from '../types/blockchain';

export class XiangqiGameContract implements GameContract {
  private contract: ethers.Contract;
  private provider: ethers.Provider;
  private signer: ethers.Signer;

  constructor(config: ContractConfig, provider: ethers.Provider, signer: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
    this.contract = new ethers.Contract(config.address, config.abi, signer);
  }

  async createGame(stakeAmount: string): Promise<TransactionInfo> {
    try {
      const tx = await this.contract.createGame({ value: ethers.parseEther(stakeAmount) });
      const receipt = await tx.wait();
      
      return {
        hash: tx.hash,
        status: receipt.status === 1 ? 'success' : 'failed',
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: tx.gasPrice?.toString()
      };
    } catch (error) {
      console.error('Create game error:', error);
      throw error;
    }
  }

  async joinGame(gameId: string, stakeAmount: string): Promise<TransactionInfo> {
    try {
      const tx = await this.contract.joinGame(gameId, { value: ethers.parseEther(stakeAmount) });
      const receipt = await tx.wait();
      
      return {
        hash: tx.hash,
        status: receipt.status === 1 ? 'success' : 'failed',
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: tx.gasPrice?.toString()
      };
    } catch (error) {
      console.error('Join game error:', error);
      throw error;
    }
  }

  async makeMove(gameId: string, from: [number, number], to: [number, number]): Promise<TransactionInfo> {
    try {
      const tx = await this.contract.makeMove(gameId, from, to);
      const receipt = await tx.wait();
      
      return {
        hash: tx.hash,
        status: receipt.status === 1 ? 'success' : 'failed',
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: tx.gasPrice?.toString()
      };
    } catch (error) {
      console.error('Make move error:', error);
      throw error;
    }
  }

  async claimWinnings(gameId: string): Promise<TransactionInfo> {
    try {
      const tx = await this.contract.claimWinnings(gameId);
      const receipt = await tx.wait();
      
      return {
        hash: tx.hash,
        status: receipt.status === 1 ? 'success' : 'failed',
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: tx.gasPrice?.toString()
      };
    } catch (error) {
      console.error('Claim winnings error:', error);
      throw error;
    }
  }

  async getGameInfo(gameId: string): Promise<{
    players: string[];
    stakeAmount: string;
    status: string;
    currentPlayer: string;
  }> {
    try {
      const gameInfo = await this.contract.getGameInfo(gameId);
      
      return {
        players: gameInfo.players,
        stakeAmount: ethers.formatEther(gameInfo.stakeAmount),
        status: gameInfo.status,
        currentPlayer: gameInfo.currentPlayer
      };
    } catch (error) {
      console.error('Get game info error:', error);
      throw error;
    }
  }
}

// Smart Contract ABI for Xiangqi Game
export const XIANGQI_GAME_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "stakeAmount",
        "type": "uint256"
      }
    ],
    "name": "createGame",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      }
    ],
    "name": "joinGame",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      },
      {
        "internalType": "uint8[2]",
        "name": "from",
        "type": "uint8[2]"
      },
      {
        "internalType": "uint8[2]",
        "name": "to",
        "type": "uint8[2]"
      }
    ],
    "name": "makeMove",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      }
    ],
    "name": "claimWinnings",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      }
    ],
    "name": "getGameInfo",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address[2]",
            "name": "players",
            "type": "address[2]"
          },
          {
            "internalType": "uint256",
            "name": "stakeAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "address",
            "name": "currentPlayer",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "createdAt",
            "type": "uint256"
          }
        ],
        "internalType": "struct XiangqiGame.Game",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getActiveGames",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      }
    ],
    "name": "getPlayerGames",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      }
    ],
    "name": "getGameBoard",
    "outputs": [
      {
        "internalType": "uint8[10][9]",
        "name": "",
        "type": "uint8[10][9]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Contract addresses for different networks
export const GAME_CONTRACT_ADDRESSES = {
  'bsc': '0x...', // Mainnet BSC address
  'bsc-testnet': '0x...' // Testnet BSC address
};
