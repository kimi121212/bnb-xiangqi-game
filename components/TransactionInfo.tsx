import React from 'react';
import styled from 'styled-components';
import { ExternalLink, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { colors, borderRadius, spacing, shadows } from '../styles/theme';

interface TransactionInfoProps {
  gameId: string;
  poolAddress: string;
  totalStaked: number;
  playerStakes: Record<string, number>;
  isActive: boolean;
  winner?: string;
  maxPlayers?: number;
  currentPlayers?: number;
  stakeCount?: number; // Track number of stakes (allows same wallet multiple times)
  transactions?: Array<{
    hash: string;
    type: 'stake' | 'refund' | 'win';
    amount: number;
    from: string;
    to: string;
    timestamp: number;
  }>;
}

const Container = styled.div`
  background: ${colors.background.secondary};
  border: 1px solid ${colors.border.primary};
  border-radius: ${borderRadius.large};
  padding: 1.5rem;
  box-shadow: ${shadows.medium};
`;

const Title = styled.h3`
  color: ${colors.primary.yellow};
  font-size: 1.2rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const InfoLabel = styled.span`
  color: ${colors.text.secondary};
  font-size: 0.875rem;
  font-weight: 500;
`;

const InfoValue = styled.span`
  color: ${colors.text.primary};
  font-size: 1rem;
  font-weight: 600;
`;

const AddressContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${colors.background.primary};
  border: 1px solid ${colors.border.primary};
  border-radius: ${borderRadius.medium};
  padding: 0.75rem;
  margin-bottom: 1rem;
`;

const AddressText = styled.span`
  color: ${colors.text.primary};
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  flex: 1;
  word-break: break-all;
`;

const CopyButton = styled.button`
  background: transparent;
  border: none;
  color: ${colors.text.secondary};
  cursor: pointer;
  padding: 0.25rem;
  border-radius: ${borderRadius.small};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${colors.background.tertiary};
    color: ${colors.text.primary};
  }
`;

const ExternalLinkButton = styled.a`
  background: transparent;
  border: none;
  color: ${colors.primary.yellow};
  cursor: pointer;
  padding: 0.25rem;
  border-radius: ${borderRadius.small};
  transition: all 0.2s ease;
  text-decoration: none;
  
  &:hover {
    background: ${colors.primary.yellow}20;
  }
`;

const TransactionList = styled.div`
  max-height: 200px;
  overflow-y: auto;
`;

const TransactionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: ${colors.background.primary};
  border: 1px solid ${colors.border.primary};
  border-radius: ${borderRadius.medium};
  margin-bottom: 0.5rem;
`;

const TransactionIcon = styled.div<{ type: 'stake' | 'refund' | 'win' }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => {
    switch (props.type) {
      case 'stake': return `${colors.accent.blue}20`;
      case 'refund': return `${colors.accent.orange}20`;
      case 'win': return `${colors.accent.green}20`;
      default: return `${colors.text.tertiary}20`;
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'stake': return colors.accent.blue;
      case 'refund': return colors.accent.orange;
      case 'win': return colors.accent.green;
      default: return colors.text.tertiary;
    }
  }};
`;

const TransactionDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const TransactionType = styled.span<{ type: 'stake' | 'refund' | 'win' }>`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => {
    switch (props.type) {
      case 'stake': return colors.accent.blue;
      case 'refund': return colors.accent.orange;
      case 'win': return colors.accent.green;
      default: return colors.text.primary;
    }
  }};
`;

const TransactionAmount = styled.span`
  font-size: 0.875rem;
  color: ${colors.text.secondary};
`;

const TransactionHash = styled.span`
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  color: ${colors.text.tertiary};
  word-break: break-all;
`;

const StatusIndicator = styled.div<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: ${borderRadius.medium};
  background: ${props => props.isActive ? `${colors.accent.green}20` : `${colors.text.tertiary}20`};
  color: ${props => props.isActive ? colors.accent.green : colors.text.tertiary};
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 1rem;
`;


const TransactionInfo: React.FC<TransactionInfoProps> = ({
  gameId,
  poolAddress,
  totalStaked,
  playerStakes,
  isActive,
  winner,
  maxPlayers = 2,
  currentPlayers = 0,
  stakeCount = 0,
  transactions = []
}) => {
  const [copiedAddress, setCopiedAddress] = React.useState(false);
  const [copiedHash, setCopiedHash] = React.useState<string | null>(null);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(poolAddress);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const handleCopyHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(hash);
      setTimeout(() => setCopiedHash(null), 2000);
    } catch (error) {
      console.error('Failed to copy hash:', error);
    }
  };

  const getTransactionIcon = (type: 'stake' | 'refund' | 'win') => {
    switch (type) {
      case 'stake': return '💰';
      case 'refund': return '↩️';
      case 'win': return '🏆';
      default: return '📄';
    }
  };

  const getBSCScanUrl = (hash: string) => {
    return `https://bscscan.com/tx/${hash}`;
  };


  return (
    <Container>
      <Title>Wallet Pool & Transactions</Title>
      
      
      <StatusIndicator isActive={isActive}>
        {isActive ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
        {isActive ? 'Pool Active' : 'Pool Inactive'}
        {winner && ` - Winner: ${winner.substring(0, 6)}...${winner.substring(winner.length - 4)}`}
      </StatusIndicator>

      <InfoGrid>
        <InfoItem>
          <InfoLabel>Game ID</InfoLabel>
          <InfoValue>{gameId.substring(0, 8)}...</InfoValue>
        </InfoItem>
        <InfoItem>
          <InfoLabel>Total Staked</InfoLabel>
          <InfoValue>{totalStaked.toFixed(4)} BNB</InfoValue>
        </InfoItem>
        <InfoItem>
          <InfoLabel>Players</InfoLabel>
          <InfoValue>{Object.keys(playerStakes || {}).length}</InfoValue>
        </InfoItem>
        <InfoItem>
          <InfoLabel>Transactions</InfoLabel>
          <InfoValue>{transactions.length}</InfoValue>
        </InfoItem>
      </InfoGrid>

      <div>
        <InfoLabel style={{ marginBottom: '0.5rem', display: 'block' }}>Pool Wallet Address</InfoLabel>
        <AddressContainer>
          <AddressText>{poolAddress}</AddressText>
          <CopyButton onClick={handleCopyAddress} title="Copy address">
            {copiedAddress ? <CheckCircle size={16} /> : <Copy size={16} />}
          </CopyButton>
          <ExternalLinkButton 
            href={`https://bscscan.com/address/${poolAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            title="View on BSCScan"
          >
            <ExternalLink size={16} />
          </ExternalLinkButton>
        </AddressContainer>
      </div>

      {transactions.length > 0 && (
        <div>
          <InfoLabel style={{ marginBottom: '0.75rem', display: 'block' }}>Recent Transactions</InfoLabel>
          <TransactionList>
            {transactions.map((tx, index) => (
              <TransactionItem key={index}>
                <TransactionIcon type={tx.type}>
                  {getTransactionIcon(tx.type)}
                </TransactionIcon>
                <TransactionDetails>
                  <TransactionType type={tx.type}>
                    {tx.type.toUpperCase()}
                  </TransactionType>
                  <TransactionAmount>
                    {tx.amount.toFixed(4)} BNB
                  </TransactionAmount>
                  <TransactionHash>
                    {tx.hash.substring(0, 10)}...{tx.hash.substring(tx.hash.length - 6)}
                  </TransactionHash>
                </TransactionDetails>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <CopyButton 
                    onClick={() => handleCopyHash(tx.hash)}
                    title="Copy transaction hash"
                  >
                    {copiedHash === tx.hash ? <CheckCircle size={14} /> : <Copy size={14} />}
                  </CopyButton>
                  <ExternalLinkButton 
                    href={getBSCScanUrl(tx.hash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View on BSCScan"
                  >
                    <ExternalLink size={14} />
                  </ExternalLinkButton>
                </div>
              </TransactionItem>
            ))}
          </TransactionList>
        </div>
      )}

      {Object.keys(playerStakes || {}).length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <InfoLabel style={{ marginBottom: '0.5rem', display: 'block' }}>Player Stakes</InfoLabel>
          {Object.entries(playerStakes || {}).map(([address, stake]) => (
            <div key={address} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '0.5rem',
              background: colors.background.primary,
              borderRadius: borderRadius.medium,
              marginBottom: '0.25rem'
            }}>
              <span style={{ 
                fontFamily: 'Courier New, monospace', 
                fontSize: '0.875rem',
                color: colors.text.primary
              }}>
                {address.substring(0, 6)}...{address.substring(address.length - 4)}
              </span>
              <span style={{ 
                fontWeight: '600',
                color: colors.primary.yellow
              }}>
                {stake.toFixed(4)} BNB
              </span>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
};

export default TransactionInfo;
