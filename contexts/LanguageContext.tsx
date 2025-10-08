import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation keys
const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.games': 'Games',
    'nav.create': 'Create Game',
    'nav.join': 'Join Game',
    'nav.guide': 'Game Guide',
    'nav.quick_actions': 'Quick Actions',
    'nav.create_public': 'Create Public Game',
    'nav.create_private': 'Create Private Game',
    'nav.hide_private': 'Hide Private Game',
    'nav.join_private': 'Join Private Game',
    'nav.game_id': 'Game ID',
    'nav.password': 'Password',
    'nav.enter_game_id': 'Enter game ID',
    'nav.enter_password': 'Enter password',
    
    // Game
    'game.title': 'BNB Xiangqi Game',
    'game.subtitle': 'Play Chinese Chess with BNB Staking',
    'game.create': 'Create Game',
    'game.join': 'Join Game',
    'game.watch': 'Watch Game',
    'game.stake': 'Stake BNB',
    'game.unstake': 'Unstake',
    'game.exit': 'Exit Game',
    'game.spectate': 'Spectate',
    
    // Game Status
    'status.waiting': 'WAITING',
    'status.active': 'GAME COMMENCED',
    'status.finished': 'FINISHED',
    'status.ready': 'Game Ready!',
    
    // Staking
    'staking.title': 'Staking',
    'staking.amount': 'Stake Amount',
    'staking.total': 'Total Prize',
    'staking.your_stake': 'Your Stake',
    'staking.confirm': 'Confirm Stake',
    'staking.staked': 'Staked',
    'staking.stake_count': 'Staked',
    'staking.connect_wallet': 'Connect your wallet to stake and play',
    'staking.insufficient_balance': 'Insufficient BNB balance. You need',
    'staking.success': 'Successfully staked',
    'staking.error': 'Staking failed',
    
    // Players
    'players.title': 'Players',
    'players.host': 'Host',
    'players.spectators': 'Spectators',
    'players.stake_count': 'Stakes',
    'players.wallet': 'Wallet',
    
    // Pool
    'pool.title': 'Pool Status',
    'pool.balance': 'Pool Balance',
    'pool.wallet': 'Pool Wallet',
    'pool.address': 'Pool Wallet Address',
    'pool.created': 'Created',
    'pool.check_balance': 'Check Balance',
    'pool.view_bscscan': 'View on BSCScan',
    
    // Wallet
    'wallet.connect': 'Connect Wallet',
    'wallet.disconnect': 'Disconnect',
    'wallet.balance': 'Balance',
    'wallet.address': 'Address',
    
    // Game Board
    'board.red': 'Red',
    'board.black': 'Black',
    'board.your_turn': 'Your Turn',
    'board.opponent_turn': 'Opponent Turn',
    'board.game_over': 'Game Over',
    'board.you_won': 'You Won!',
    'board.you_lost': 'You Lost',
    'board.draw': 'Draw',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.retry': 'Retry',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
  },
  zh: {
    // Navigation
    'nav.home': '首页',
    'nav.games': '游戏',
    'nav.create': '创建游戏',
    'nav.join': '加入游戏',
    'nav.guide': '游戏指南',
    'nav.quick_actions': '快速操作',
    'nav.create_public': '创建公开游戏',
    'nav.create_private': '创建私人游戏',
    'nav.hide_private': '隐藏私人游戏',
    'nav.join_private': '加入私人游戏',
    'nav.game_id': '游戏ID',
    'nav.password': '密码',
    'nav.enter_game_id': '输入游戏ID',
    'nav.enter_password': '输入密码',
    
    // Game
    'game.title': 'BNB 象棋游戏',
    'game.subtitle': '用BNB质押玩中国象棋',
    'game.create': '创建游戏',
    'game.join': '加入游戏',
    'game.watch': '观看游戏',
    'game.stake': '质押BNB',
    'game.unstake': '取消质押',
    'game.exit': '退出游戏',
    'game.spectate': '观战',
    
    // Game Status
    'status.waiting': '等待中',
    'status.active': '🎮 游戏开始',
    'status.finished': '已结束',
    'status.ready': '游戏就绪！',
    
    // Staking
    'staking.title': '质押',
    'staking.amount': '质押金额',
    'staking.total': '总奖金',
    'staking.your_stake': '您的质押',
    'staking.confirm': '确认质押',
    'staking.staked': '已质押',
    'staking.stake_count': '质押',
    'staking.connect_wallet': '连接钱包以质押和游戏',
    'staking.insufficient_balance': 'BNB余额不足。您需要',
    'staking.success': '质押成功',
    'staking.error': '质押失败',
    
    // Players
    'players.title': '玩家',
    'players.host': '房主',
    'players.spectators': '观众',
    'players.stake_count': '质押数',
    'players.wallet': '钱包',
    
    // Pool
    'pool.title': '奖池状态',
    'pool.balance': '奖池余额',
    'pool.wallet': '奖池钱包',
    'pool.address': '奖池钱包地址',
    'pool.created': '创建时间',
    'pool.check_balance': '检查余额',
    'pool.view_bscscan': '在BSCScan查看',
    
    // Wallet
    'wallet.connect': '连接钱包',
    'wallet.disconnect': '断开连接',
    'wallet.balance': '余额',
    'wallet.address': '地址',
    
    // Game Board
    'board.red': '红方',
    'board.black': '黑方',
    'board.your_turn': '您的回合',
    'board.opponent_turn': '对手回合',
    'board.game_over': '游戏结束',
    'board.you_won': '您赢了！',
    'board.you_lost': '您输了',
    'board.draw': '平局',
    
    // Common
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
    'common.cancel': '取消',
    'common.confirm': '确认',
    'common.retry': '重试',
    'common.close': '关闭',
    'common.back': '返回',
    'common.next': '下一步',
    'common.previous': '上一步',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('zh'); // Default to Chinese

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('bnb-xiangqi-language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'zh')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('bnb-xiangqi-language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
