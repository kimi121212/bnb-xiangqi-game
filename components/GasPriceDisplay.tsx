import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { colors, spacing, borderRadius, shadows } from '../styles/theme';
import { GasPriceService } from '../utils/GasPriceService';
import { useWallet } from '../hooks/useWallet';

const GasPriceContainer = styled.div`
  background: ${colors.background};
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.md};
  padding: ${spacing.md};
  margin: ${spacing.sm} 0;
  box-shadow: ${shadows.sm};
`;

const GasPriceHeader = styled.h4`
  color: ${colors.text};
  margin: 0 0 ${spacing.sm} 0;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const GasPriceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${spacing.sm};
`;

const GasPriceItem = styled.div<{ isRecommended?: boolean }>`
  background: ${props => props.isRecommended ? colors.primary + '20' : colors.background.secondary};
  border: 1px solid ${props => props.isRecommended ? colors.primary : colors.border.primary};
  border-radius: ${borderRadius.sm};
  padding: ${spacing.sm};
  text-align: center;
`;

const GasPriceLabel = styled.div`
  font-size: 0.8rem;
  color: ${colors.textSecondary};
  margin-bottom: 2px;
`;

const GasPriceValue = styled.div`
  font-size: 1rem;
  font-weight: bold;
  color: ${colors.text};
  font-family: monospace;
`;

const GasPriceSource = styled.div`
  font-size: 0.7rem;
  color: ${colors.textSecondary};
  margin-top: 2px;
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid ${colors.border};
  border-top: 2px solid ${colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

interface GasPriceDisplayProps {
  onGasPriceSelect?: (gasPrice: string, speed: string) => void;
}

export const GasPriceDisplay: React.FC<GasPriceDisplayProps> = ({ onGasPriceSelect }) => {
  const { walletInfo } = useWallet();
  const [gasPrices, setGasPrices] = useState<{
    standard: string;
    fast: string;
    instant: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGasPrices = async () => {
    if (!walletInfo.provider) {
      setError('No wallet provider available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [standardResult, fastResult, instantResult] = await Promise.all([
        GasPriceService.getOptimizedGasPrice(walletInfo.provider),
        GasPriceService.getFastGasPrice(walletInfo.provider),
        GasPriceService.getInstantGasPrice(walletInfo.provider)
      ]);

      setGasPrices({
        standard: standardResult.gasPrice,
        fast: fastResult.gasPrice,
        instant: instantResult.gasPrice
      });

      // Auto-select fast gas price (recommended)
      if (onGasPriceSelect) {
        onGasPriceSelect(fastResult.gasPrice, 'fast');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGasPrices();
  }, [walletInfo.provider]);

  if (loading) {
    return (
      <GasPriceContainer>
        <GasPriceHeader>
          <LoadingSpinner />
          Loading Gas Prices...
        </GasPriceHeader>
      </GasPriceContainer>
    );
  }

  if (error) {
    return (
      <GasPriceContainer>
        <GasPriceHeader>Gas Prices</GasPriceHeader>
        <div style={{ color: colors.error }}>Error: {error}</div>
        <button 
          onClick={fetchGasPrices}
          style={{
            marginTop: spacing.sm,
            padding: `${spacing.sm} ${spacing.md}`,
            backgroundColor: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: borderRadius.sm,
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </GasPriceContainer>
    );
  }

  if (!gasPrices) {
    return null;
  }

  const formatGasPrice = (gasPrice: string) => {
    const gwei = parseFloat(gasPrice) / 1e9;
    return `${gwei.toFixed(1)} gwei`;
  };

  return (
    <GasPriceContainer>
      <GasPriceHeader>⚡ Rabby-Style Gas Prices</GasPriceHeader>
      <GasPriceGrid>
        <GasPriceItem>
          <GasPriceLabel>Standard</GasPriceLabel>
          <GasPriceValue>{formatGasPrice(gasPrices.standard)}</GasPriceValue>
          <GasPriceSource>Balanced</GasPriceSource>
        </GasPriceItem>
        
        <GasPriceItem isRecommended>
          <GasPriceLabel>Fast ⭐</GasPriceLabel>
          <GasPriceValue>{formatGasPrice(gasPrices.fast)}</GasPriceValue>
          <GasPriceSource>Recommended</GasPriceSource>
        </GasPriceItem>
        
        <GasPriceItem>
          <GasPriceLabel>Instant</GasPriceLabel>
          <GasPriceValue>{formatGasPrice(gasPrices.instant)}</GasPriceValue>
          <GasPriceSource>Fastest</GasPriceSource>
        </GasPriceItem>
      </GasPriceGrid>
      
      <div style={{ 
        marginTop: spacing.sm, 
        fontSize: '0.8rem', 
        color: colors.textSecondary,
        textAlign: 'center'
      }}>
        Using Rabby-style optimization for fast, cost-effective transactions
      </div>
    </GasPriceContainer>
  );
};

export default GasPriceDisplay;
