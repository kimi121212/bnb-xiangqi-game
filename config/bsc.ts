// BSC (BNB Smart Chain) Configuration

export const BSC_CONFIG = {
  // Network settings
  MAINNET: {
    chainId: 56,
    chainIdHex: '0x38',
    name: 'BNB Smart Chain',
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    explorerUrl: 'https://bscscan.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    }
  },
  
  TESTNET: {
    chainId: 97,
    chainIdHex: '0x61',
    name: 'BNB Smart Chain Testnet',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    explorerUrl: 'https://testnet.bscscan.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    }
  }
};

// Current network (set to mainnet for production)
export const CURRENT_NETWORK = BSC_CONFIG.MAINNET;

// Gas settings for BSC
export const BSC_GAS_SETTINGS = {
  // Standard BNB transfer gas limit
  TRANSFER_GAS_LIMIT: 21000,
  
  // Contract interaction gas limit
  CONTRACT_GAS_LIMIT: 100000,
  
  // Gas price multiplier (1.1 = 10% above current gas price)
  GAS_PRICE_MULTIPLIER: 1.1
};

// Wallet configuration
export const WALLET_CONFIG = {
  // Private key file location
  PRIVATE_KEYS_FILE: 'privatekeys.md',
  
  // Wallet derivation path (for HD wallets if needed)
  DERIVATION_PATH: "m/44'/60'/0'/0/0"
};
