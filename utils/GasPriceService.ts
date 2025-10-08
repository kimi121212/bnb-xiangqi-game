import { ethers } from 'ethers';

export interface GasPriceData {
  slow: string;
  standard: string;
  fast: string;
  instant: string;
}

export interface GasPriceResult {
  gasPrice: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  source: string;
}

export class GasPriceService {
  private static readonly BSC_RPC_URLS = [
    'https://bsc-dataseed.binance.org/',
    'https://bsc-dataseed1.defibit.io/',
    'https://bsc-dataseed1.ninicoin.io/',
    'https://bsc-dataseed2.defibit.io/',
    'https://bsc-dataseed3.defibit.io/',
    'https://bsc-dataseed4.defibit.io/',
    'https://bsc-dataseed1.ninicoin.io/',
    'https://bsc-dataseed2.ninicoin.io/',
    'https://bsc-dataseed3.ninicoin.io/',
    'https://bsc-dataseed4.ninicoin.io/',
    'https://bsc-dataseed1.binance.org/',
    'https://bsc-dataseed2.binance.org/',
    'https://bsc-dataseed3.binance.org/',
    'https://bsc-dataseed4.binance.org/',
    'https://bsc-dataseed5.binance.org/',
  ];

  // Get optimized gas price using multiple sources
  static async getOptimizedGasPrice(provider: ethers.Provider): Promise<GasPriceResult> {
    try {
      // Try to get gas price from multiple sources
      const gasPricePromises = [
        this.getGasPriceFromProvider(provider).catch(() => null),
        this.getGasPriceFromBSCScan().catch(() => null),
        this.getGasPriceFromBSCGasStation().catch(() => null),
        this.getGasPriceFromRabbyStyle().catch(() => null)
      ];

      const results = await Promise.allSettled(gasPricePromises);
      const successfulResults = results
        .filter((result): result is PromiseFulfilledResult<GasPriceResult | null> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value!);

      if (successfulResults.length === 0) {
        // Fallback to a reasonable gas price for BSC
        return {
          gasPrice: ethers.parseUnits('5', 'gwei').toString(),
          source: 'fallback'
        };
      }

      // Use the fastest gas price from successful results
      const fastestResult = successfulResults.reduce((fastest, current) => {
        const fastestPrice = BigInt(fastest.gasPrice);
        const currentPrice = BigInt(current.gasPrice);
        return currentPrice > fastestPrice ? current : fastest;
      });

      console.log(`Using gas price from ${fastestResult.source}: ${ethers.formatUnits(fastestResult.gasPrice, 'gwei')} gwei`);
      return fastestResult;

    } catch (error) {
      console.error('Error getting optimized gas price:', error);
      // Fallback to reasonable BSC gas price
      return {
        gasPrice: ethers.parseUnits('5', 'gwei').toString(),
        source: 'fallback'
      };
    }
  }

  // Get gas price from provider
  private static async getGasPriceFromProvider(provider: ethers.Provider): Promise<GasPriceResult> {
    try {
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice || ethers.parseUnits('5', 'gwei');
      return {
        gasPrice: gasPrice.toString(),
        source: 'provider'
      };
    } catch (error) {
      throw new Error(`Provider gas price failed: ${error}`);
    }
  }

  // Get gas price from BSCScan API (if available)
  private static async getGasPriceFromBSCScan(): Promise<GasPriceResult> {
    try {
      const response = await fetch('https://api.bscscan.com/api?module=gastracker&action=gasoracle&apikey=YourApiKeyToken');
      const data = await response.json();
      
      if (data.status === '1' && data.result) {
        const fastGas = data.result.FastGasPrice;
        const gasPrice = ethers.parseUnits(fastGas, 'gwei');
        return {
          gasPrice: gasPrice.toString(),
          source: 'bscscan'
        };
      }
      throw new Error('BSCScan API failed');
    } catch (error) {
      throw new Error(`BSCScan gas price failed: ${error}`);
    }
  }

  // Get gas price from BSC Gas Station
  private static async getGasPriceFromBSCGasStation(): Promise<GasPriceResult> {
    try {
      const response = await fetch('https://api.bscgas.info/gas');
      const data = await response.json();
      
      if (data.fast) {
        const gasPrice = ethers.parseUnits(data.fast.toString(), 'gwei');
        return {
          gasPrice: gasPrice.toString(),
          source: 'bscgas'
        };
      }
      throw new Error('BSC Gas Station API failed');
    } catch (error) {
      throw new Error(`BSC Gas Station failed: ${error}`);
    }
  }

  // Get gas price using Rabby-style optimization
  private static async getGasPriceFromRabbyStyle(): Promise<GasPriceResult> {
    try {
      // Rabby-style: Use multiple RPC endpoints and get the median
      const gasPricePromises = this.BSC_RPC_URLS.slice(0, 5).map(async (url) => {
        try {
          const provider = new ethers.JsonRpcProvider(url);
          const feeData = await provider.getFeeData();
          return feeData.gasPrice;
        } catch (error) {
          return null;
        }
      });

      const results = await Promise.allSettled(gasPricePromises);
      const gasPrices = results
        .filter((result): result is PromiseFulfilledResult<bigint> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value);

      if (gasPrices.length === 0) {
        throw new Error('No RPC endpoints responded');
      }

      // Sort and get median
      gasPrices.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
      const medianIndex = Math.floor(gasPrices.length / 2);
      const medianGasPrice = gasPrices[medianIndex];

      // Add 10% buffer for faster confirmation (Rabby-style optimization)
      const optimizedGasPrice = medianGasPrice * BigInt(110) / BigInt(100);

      return {
        gasPrice: optimizedGasPrice.toString(),
        source: 'rabby-style'
      };
    } catch (error) {
      throw new Error(`Rabby-style gas price failed: ${error}`);
    }
  }

  // Get gas price with Rabby-style fast confirmation
  static async getFastGasPrice(provider: ethers.Provider): Promise<GasPriceResult> {
    try {
      const baseResult = await this.getOptimizedGasPrice(provider);
      
      // Rabby-style: Add 20% buffer for fast confirmation
      const fastGasPrice = BigInt(baseResult.gasPrice) * BigInt(120) / BigInt(100);
      
      return {
        gasPrice: fastGasPrice.toString(),
        source: `${baseResult.source}-fast`
      };
    } catch (error) {
      console.error('Error getting fast gas price:', error);
      // Fallback to reasonable fast gas price
      return {
        gasPrice: ethers.parseUnits('6', 'gwei').toString(),
        source: 'fallback-fast'
      };
    }
  }

  // Get gas price with Rabby-style instant confirmation
  static async getInstantGasPrice(provider: ethers.Provider): Promise<GasPriceResult> {
    try {
      const baseResult = await this.getOptimizedGasPrice(provider);
      
      // Rabby-style: Add 50% buffer for instant confirmation
      const instantGasPrice = BigInt(baseResult.gasPrice) * BigInt(150) / BigInt(100);
      
      return {
        gasPrice: instantGasPrice.toString(),
        source: `${baseResult.source}-instant`
      };
    } catch (error) {
      console.error('Error getting instant gas price:', error);
      // Fallback to reasonable instant gas price
      return {
        gasPrice: ethers.parseUnits('8', 'gwei').toString(),
        source: 'fallback-instant'
      };
    }
  }
}

export const gasPriceService = new GasPriceService();
