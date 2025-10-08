// Binance-themed color palette
export const colors = {
  // Primary Binance colors
  primary: {
    yellow: '#F0B90B',
    yellowLight: '#FCD535',
    yellowDark: '#B8860B',
  },
  secondary: {
    black: '#1E2329',
    darkGray: '#2B3139',
    gray: '#474D57',
    lightGray: '#848E9C',
    white: '#FFFFFF',
  },
  accent: {
    green: '#02C076',
    red: '#F84960',
    blue: '#1890FF',
    purple: '#8B5CF6',
  },
  background: {
    primary: '#0B0E11',
    secondary: '#1E2329',
    tertiary: '#2B3139',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#848E9C',
    tertiary: '#474D57',
  },
  border: {
    primary: '#2B3139',
    secondary: '#474D57',
  }
};

export const gradients = {
  primary: 'linear-gradient(135deg, #F0B90B 0%, #FCD535 100%)',
  secondary: 'linear-gradient(135deg, #1E2329 0%, #2B3139 100%)',
  accent: 'linear-gradient(135deg, #02C076 0%, #1890FF 100%)',
  dark: 'linear-gradient(135deg, #0B0E11 0%, #1E2329 100%)',
};

export const shadows = {
  small: '0 2px 4px rgba(0, 0, 0, 0.1)',
  medium: '0 4px 8px rgba(0, 0, 0, 0.15)',
  large: '0 8px 16px rgba(0, 0, 0, 0.2)',
  glow: '0 0 20px rgba(240, 185, 11, 0.3)',
};

export const borderRadius = {
  small: '4px',
  medium: '8px',
  large: '12px',
  xl: '16px',
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

export const typography = {
  fontFamily: {
    primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    xxl: '24px',
    xxxl: '32px',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  xxl: '1536px',
};

export const animations = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  },
};
