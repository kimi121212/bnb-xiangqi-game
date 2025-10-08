import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Wallet, Trophy, BookOpen, Home, Menu, X } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { colors, gradients, shadows, borderRadius, spacing, typography } from '../styles/theme';

const HeaderContainer = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background: ${colors.background.secondary};
  border-bottom: 1px solid ${colors.border.primary};
  box-shadow: ${shadows.medium};
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing.md} ${spacing.lg};
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
`;

const BinanceLogo = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.secondary.black};
  font-size: 20px;
  font-weight: bold;
  box-shadow: ${shadows.small};
`;

const LogoText = styled.div`
  display: flex;
  flex-direction: column;
`;

const LogoTitle = styled.h1`
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.bold};
  margin: 0;
  line-height: 1;
`;

const LogoSubtitle = styled.span`
  color: ${colors.text.secondary};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.medium};
`;

const Navigation = styled.nav`
  display: flex;
  align-items: center;
  gap: ${spacing.lg};
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavItem = styled(motion.button)<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.sm} ${spacing.md};
  background: ${props => props.active ? gradients.primary : 'transparent'};
  color: ${props => props.active ? colors.secondary.black : colors.text.primary};
  border: none;
  border-radius: ${borderRadius.medium};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? gradients.primary : colors.background.tertiary};
    transform: translateY(-1px);
  }
`;

const WalletSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
`;

const WalletInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.sm} ${spacing.md};
  background: ${colors.background.tertiary};
  border: 1px solid ${colors.border.primary};
  border-radius: ${borderRadius.medium};
`;

const WalletAddress = styled.span`
  color: ${colors.text.primary};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  font-family: ${typography.fontFamily.mono};
`;

const WalletBalance = styled.span`
  color: ${colors.primary.yellow};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.semibold};
`;

const ConnectButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.sm} ${spacing.md};
  background: ${gradients.primary};
  color: ${colors.secondary.black};
  border: none;
  border-radius: ${borderRadius.medium};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${shadows.medium};
  }
`;

const MobileMenu = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenuButton = styled(motion.button)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${colors.background.tertiary};
  border: 1px solid ${colors.border.primary};
  color: ${colors.text.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${colors.primary.yellow};
    color: ${colors.secondary.black};
  }
`;

const MobileMenuOverlay = styled(motion.div)<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const MobileMenuContent = styled(motion.div)`
  background: ${colors.background.secondary};
  border-radius: ${borderRadius.large};
  border: 1px solid ${colors.border.primary};
  padding: ${spacing.xl};
  max-width: 300px;
  width: 90%;
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
`;

const MobileNavItem = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.md};
  background: ${colors.background.tertiary};
  color: ${colors.text.primary};
  border: 1px solid ${colors.border.primary};
  border-radius: ${borderRadius.medium};
  font-size: ${typography.fontSize.md};
  font-weight: ${typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${colors.primary.yellow};
    color: ${colors.secondary.black};
  }
`;

interface BinanceHeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onExitGame?: () => void;
}

const BinanceHeader: React.FC<BinanceHeaderProps> = ({
  currentView,
  onNavigate,
  onExitGame
}) => {
  const { walletInfo, connectWallet, disconnectWallet } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    return parseFloat(balance).toFixed(4);
  };

  const navItems = [
    { id: 'landing', label: 'Home', icon: Home },
    { id: 'guide', label: 'Guide', icon: BookOpen },
  ];

  return (
    <HeaderContainer>
      <HeaderContent>
        <LogoSection>
          <BinanceLogo>
            <LogoIcon>♔</LogoIcon>
            <LogoText>
              <LogoTitle>BNB Xiangqi</LogoTitle>
              <LogoSubtitle>Powered by Binance Smart Chain</LogoSubtitle>
            </LogoText>
          </BinanceLogo>
        </LogoSection>

        <Navigation>
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              active={currentView === item.id}
              onClick={() => onNavigate(item.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <item.icon size={16} />
              {item.label}
            </NavItem>
          ))}
        </Navigation>

        <WalletSection>
          {walletInfo.isConnected ? (
            <WalletInfo>
              <WalletAddress>{formatAddress(walletInfo.address)}</WalletAddress>
              <WalletBalance>{formatBalance(walletInfo.balance)} BNB</WalletBalance>
            </WalletInfo>
          ) : (
            <ConnectButton
              onClick={connectWallet}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Wallet size={16} />
              Connect Wallet
            </ConnectButton>
          )}
        </WalletSection>

        <MobileMenu>
          <MobileMenuButton
            onClick={() => setMobileMenuOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Menu size={20} />
          </MobileMenuButton>
        </MobileMenu>
      </HeaderContent>

      <MobileMenuOverlay isOpen={mobileMenuOpen}>
        <MobileMenuContent
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: spacing.md
          }}>
            <h3 style={{ 
              color: colors.text.primary, 
              margin: 0,
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold
            }}>
              Menu
            </h3>
            <MobileMenuButton
              onClick={() => setMobileMenuOpen(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={20} />
            </MobileMenuButton>
          </div>

          {navItems.map((item) => (
            <MobileNavItem
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <item.icon size={20} />
              {item.label}
            </MobileNavItem>
          ))}

          {currentView === 'game' && onExitGame && (
            <MobileNavItem
              onClick={() => {
                onExitGame();
                setMobileMenuOpen(false);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Trophy size={20} />
              Exit Game
            </MobileNavItem>
          )}
        </MobileMenuContent>
      </MobileMenuOverlay>
    </HeaderContainer>
  );
};

export default BinanceHeader;
