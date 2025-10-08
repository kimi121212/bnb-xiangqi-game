import React from 'react';
import { colors, spacing, typography, borderRadius } from '../styles/theme';

interface RefundTransaction {
  txHash: string;
  amount: string;
  recipient: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

interface RefundTransactionsProps {
  transactions: RefundTransaction[];
  isLoading?: boolean;
}

const RefundTransactions: React.FC<RefundTransactionsProps> = ({
  transactions,
  isLoading = false
}) => {
  if (isLoading) {
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
          💸 Refund Transactions
        </h3>
        <div style={{
          color: colors.text.secondary,
          fontSize: typography.fontSize.sm,
          textAlign: 'center',
          padding: spacing.lg
        }}>
          Loading refund transactions...
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
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
          💸 Refund Transactions
        </h3>
        <div style={{
          color: colors.text.secondary,
          fontSize: typography.fontSize.sm,
          textAlign: 'center',
          padding: spacing.lg
        }}>
          No refund transactions yet
        </div>
      </div>
    );
  }

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
        💸 Refund Transactions
      </h3>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.sm
      }}>
        {transactions.map((tx, index) => (
          <div key={index} style={{
            background: colors.background.primary,
            border: `1px solid ${colors.border.primary}`,
            borderRadius: borderRadius.medium,
            padding: spacing.md,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{
                color: colors.text.primary,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.semibold,
                marginBottom: spacing.xs
              }}>
                Refund to {tx.recipient.slice(0, 6)}...{tx.recipient.slice(-4)}
              </div>
              <div style={{
                color: colors.text.secondary,
                fontSize: typography.fontSize.xs,
                fontFamily: 'monospace'
              }}>
                {tx.txHash}
              </div>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div style={{
                color: colors.accent.yellow,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.semibold,
                marginBottom: spacing.xs
              }}>
                {tx.amount} BNB
              </div>
              <div style={{
                color: tx.status === 'confirmed' ? colors.accent.green : 
                       tx.status === 'failed' ? colors.accent.red : 
                       colors.text.secondary,
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.medium
              }}>
                {tx.status === 'confirmed' ? '✅ Confirmed' :
                 tx.status === 'failed' ? '❌ Failed' :
                 '⏳ Pending'}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{
        marginTop: spacing.md,
        padding: spacing.sm,
        background: colors.background.primary,
        borderRadius: borderRadius.medium,
        border: `1px solid ${colors.border.primary}`
      }}>
        <div style={{
          color: colors.text.secondary,
          fontSize: typography.fontSize.xs,
          textAlign: 'center'
        }}>
          💡 All refunds are sent as BNB transactions to your wallet address
        </div>
      </div>
    </div>
  );
};

export default RefundTransactions;
