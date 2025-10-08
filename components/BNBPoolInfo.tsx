import React from 'react';
import { colors, spacing, typography, borderRadius } from '../styles/theme';

interface BNBPoolInfoProps {
  gameId: string;
  poolAddress: string;
  totalStaked: number;
  playerStakes: { [playerAddress: string]: number };
  isActive: boolean;
  winner?: string;
}

const BNBPoolInfo: React.FC<BNBPoolInfoProps> = ({
  gameId,
  poolAddress,
  totalStaked,
  playerStakes,
  isActive,
  winner
}) => {
  return (
    <div style={{
      background: colors.background.secondary,
      border: `1px solid ${colors.border.primary}`,
      borderRadius: borderRadius.large,
      padding: spacing.lg,
      marginBottom: spacing.lg
    }}>
      <h3 style={{
        color: colors.text.primary,
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        marginBottom: spacing.md
      }}>
        🏦 BNB Game Pool
      </h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: spacing.md,
        marginBottom: spacing.md
      }}>
        <div>
          <div style={{
            color: colors.text.secondary,
            fontSize: typography.fontSize.sm,
            marginBottom: spacing.xs
          }}>
            Pool Wallet Address
          </div>
          <div style={{
            color: colors.text.primary,
            fontSize: typography.fontSize.sm,
            fontFamily: 'monospace',
            background: colors.background.primary,
            padding: spacing.sm,
            borderRadius: borderRadius.medium,
            wordBreak: 'break-all'
          }}>
            {poolAddress || 'Pool wallet will be created on first stake'}
          </div>
        </div>
        
        <div>
          <div style={{
            color: colors.text.secondary,
            fontSize: typography.fontSize.sm,
            marginBottom: spacing.xs
          }}>
            Total Staked
          </div>
          <div style={{
            color: colors.accent.yellow,
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.bold
          }}>
            {totalStaked.toFixed(4)} BNB
          </div>
        </div>
      </div>
      
      <div style={{
        marginBottom: spacing.md
      }}>
        <div style={{
          color: colors.text.secondary,
          fontSize: typography.fontSize.sm,
          marginBottom: spacing.sm
        }}>
          Player Stakes
        </div>
        {Object.entries(playerStakes).map(([address, stake]) => (
          <div key={address} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: spacing.sm,
            background: colors.background.primary,
            borderRadius: borderRadius.medium,
            marginBottom: spacing.xs
          }}>
            <div style={{
              color: colors.text.primary,
              fontSize: typography.fontSize.sm,
              fontFamily: 'monospace',
              maxWidth: '200px',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {address}
            </div>
            <div style={{
              color: colors.accent.yellow,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.semibold
            }}>
              {stake.toFixed(4)} BNB
            </div>
          </div>
        ))}
      </div>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing.sm
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: isActive ? colors.accent.green : colors.accent.red
        }} />
        <span style={{
          color: isActive ? colors.accent.green : colors.accent.red,
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.semibold
        }}>
          {isActive ? 'Pool Active' : 'Pool Closed'}
        </span>
        {winner && (
          <span style={{
            color: colors.text.secondary,
            fontSize: typography.fontSize.sm,
            marginLeft: spacing.sm
          }}>
            • Winner: {winner.slice(0, 6)}...{winner.slice(-4)}
          </span>
        )}
      </div>
    </div>
  );
};

export default BNBPoolInfo;
