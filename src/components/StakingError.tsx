import React from 'react';
import styled from 'styled-components';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { colors, borderRadius, spacing } from '../styles/theme';

interface StakingErrorProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const ErrorContainer = styled.div`
  background: ${colors.background.secondary};
  border: 1px solid ${colors.accent.red};
  border-radius: ${borderRadius.medium};
  padding: 1rem;
  margin: 1rem 0;
`;

const ErrorHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const ErrorIcon = styled.div`
  color: ${colors.accent.red};
`;

const ErrorTitle = styled.h3`
  color: ${colors.accent.red};
  font-size: 1rem;
  margin: 0;
`;

const ErrorMessage = styled.p`
  color: ${colors.text.primary};
  margin: 0 0 1rem 0;
  line-height: 1.5;
`;

const ErrorActions = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const RetryButton = styled.button`
  background: ${colors.primary.yellow};
  color: ${colors.background.primary};
  border: none;
  border-radius: ${borderRadius.small};
  padding: 0.5rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${colors.primary.yellow}dd;
  }
`;

const DismissButton = styled.button`
  background: transparent;
  color: ${colors.text.secondary};
  border: 1px solid ${colors.border.primary};
  border-radius: ${borderRadius.small};
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${colors.background.tertiary};
    color: ${colors.text.primary};
  }
`;

const HelpLink = styled.a`
  color: ${colors.primary.yellow};
  text-decoration: none;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const StakingError: React.FC<StakingErrorProps> = ({ error, onRetry, onDismiss }) => {
  const getErrorHelp = (error: string) => {
    if (error.includes('Wallet not connected')) {
      return {
        title: 'Wallet Not Connected',
        message: 'Please connect your MetaMask wallet to stake BNB.',
        helpUrl: 'https://metamask.io/'
      };
    }
    
    if (error.includes('network') || error.includes('Network')) {
      return {
        title: 'Network Error',
        message: 'Please switch to BSC Testnet in your wallet.',
        helpUrl: 'https://testnet.binance.org/'
      };
    }
    
    if (error.includes('insufficient') || error.includes('balance')) {
      return {
        title: 'Insufficient BNB',
        message: 'You need test BNB from the BSC Testnet faucet.',
        helpUrl: 'https://testnet.binance.org/faucet'
      };
    }
    
    return {
      title: 'Staking Failed',
      message: error,
      helpUrl: null
    };
  };

  const errorInfo = getErrorHelp(error);

  return (
    <ErrorContainer>
      <ErrorHeader>
        <ErrorIcon>
          <AlertCircle size={20} />
        </ErrorIcon>
        <ErrorTitle>{errorInfo.title}</ErrorTitle>
      </ErrorHeader>
      
      <ErrorMessage>{errorInfo.message}</ErrorMessage>
      
      <ErrorActions>
        {onRetry && (
          <RetryButton onClick={onRetry}>
            Try Again
          </RetryButton>
        )}
        
        {onDismiss && (
          <DismissButton onClick={onDismiss}>
            Dismiss
          </DismissButton>
        )}
        
        {errorInfo.helpUrl && (
          <HelpLink href={errorInfo.helpUrl} target="_blank" rel="noopener noreferrer">
            Get Help <ExternalLink size={14} />
          </HelpLink>
        )}
      </ErrorActions>
    </ErrorContainer>
  );
};

export default StakingError;
