export interface WalletInfo {
  address: string;
  balance: string;
  chainId: number;
  isConnected: boolean;
}

export interface ContractConfig {
  address: string;
  abi: any[];
  network: 'bsc' | 'bsc-testnet';
}

export interface TransactionInfo {
  hash: string;
  status: 'pending' | 'success' | 'failed';
  gasUsed?: string;
  gasPrice?: string;
}

export interface StakingContract {
  stake: (amount: string) => Promise<TransactionInfo>;
  unstake: (amount: string) => Promise<TransactionInfo>;
  claimRewards: () => Promise<TransactionInfo>;
  getStakingInfo: (address: string) => Promise<{
    stakedAmount: string;
    rewards: string;
    lockPeriod: number;
  }>;
}

export interface GameContract {
  createGame: (stakeAmount: string) => Promise<TransactionInfo>;
  joinGame: (gameId: string, stakeAmount: string) => Promise<TransactionInfo>;
  makeMove: (gameId: string, from: [number, number], to: [number, number]) => Promise<TransactionInfo>;
  claimWinnings: (gameId: string) => Promise<TransactionInfo>;
  getGameInfo: (gameId: string) => Promise<{
    players: string[];
    stakeAmount: string;
    status: string;
    currentPlayer: string;
  }>;
}
