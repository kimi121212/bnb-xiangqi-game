import React, { useState } from 'react';
import styled from 'styled-components';
import { Copy, Check } from 'lucide-react';
import { colors, spacing, borderRadius, typography } from '../styles/theme';

const AddressContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  font-family: monospace;
  font-size: ${typography.fontSize.sm};
`;

const AddressText = styled.span`
  color: ${colors.text.primary};
  font-weight: ${typography.fontWeight.medium};
  word-break: break-all;
`;

const CopyButton = styled.button<{ copied: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: ${borderRadius.sm};
  background: ${props => props.copied ? colors.accent.green : colors.background.tertiary};
  color: ${props => props.copied ? colors.secondary.white : colors.text.secondary};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.copied ? colors.accent.green : colors.primary.yellow};
    color: ${props => props.copied ? colors.secondary.white : colors.secondary.black};
    transform: scale(1.1);
  }
`;

interface WalletAddressProps {
  address: string;
  showCopy?: boolean;
  maxLength?: number;
}

const WalletAddress: React.FC<WalletAddressProps> = ({ 
  address, 
  showCopy = true, 
  maxLength = 8 
}) => {
  const [copied, setCopied] = useState(false);

  const formatAddress = (addr: string) => {
    if (addr.length <= maxLength * 2 + 3) return addr;
    return `${addr.slice(0, maxLength)}...${addr.slice(-maxLength)}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  return (
    <AddressContainer>
      <AddressText>{formatAddress(address)}</AddressText>
      {showCopy && (
        <CopyButton copied={copied} onClick={handleCopy} title="Copy address">
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </CopyButton>
      )}
    </AddressContainer>
  );
};

export default WalletAddress;
