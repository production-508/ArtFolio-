/**
 * Design System - ArtFolio
 * Tokens de design pour une UI cohérente et ultra-moderne
 */

export const theme = {
  colors: {
    // Backgrounds
    bg: {
      primary: '#0a0a0f',
      secondary: '#12121a',
      tertiary: '#1a1a25',
      card: 'rgba(255, 255, 255, 0.03)',
      hover: 'rgba(255, 255, 255, 0.05)',
    },
    // Text
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.8)',
      muted: 'rgba(255, 255, 255, 0.6)',
      disabled: 'rgba(255, 255, 255, 0.4)',
    },
    // Accents dynamiques
    accent: {
      cyan: '#2EC4B6',
      magenta: '#E71D36',
      purple: '#9B5DE5',
      pink: '#F15BB5',
      blue: '#00BBF9',
      yellow: '#FEE440',
      green: '#4ade80',
      orange: '#FF9F1C',
    },
    // Gradients
    gradients: {
      primary: 'linear-gradient(135deg, #2EC4B6 0%, #9B5DE5 100%)',
      secondary: 'linear-gradient(135deg, #F15BB5 0%, #00BBF9 100%)',
      dark: 'linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)',
      glow: 'radial-gradient(circle, rgba(46,196,182,0.15) 0%, transparent 70%)',
    },
    // Borders
    border: {
      subtle: 'rgba(255, 255, 255, 0.06)',
      light: 'rgba(255, 255, 255, 0.1)',
      medium: 'rgba(255, 255, 255, 0.15)',
    },
  },

  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
  },

  borderRadius: {
    sm: '0.5rem',    // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
    '2xl': '2rem',   // 32px
    full: '9999px',
  },

  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.2)',
    md: '0 4px 20px rgba(0, 0, 0, 0.3)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.4)',
    glow: {
      cyan: '0 0 40px rgba(46, 196, 182, 0.3)',
      purple: '0 0 40px rgba(155, 93, 229, 0.3)',
      pink: '0 0 40px rgba(241, 91, 181, 0.3)',
    },
  },

  transitions: {
    fast: '150ms ease',
    normal: '300ms ease',
    slow: '500ms ease',
    spring: '400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    smooth: '600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },

  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      display: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    sizes: {
      xs: '0.75rem',   // 12px
      sm: '0.875rem',  // 14px
      base: '1rem',    // 16px
      lg: '1.125rem',  // 18px
      xl: '1.25rem',   // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '2rem',   // 32px
      '4xl': '2.5rem', // 40px
      '5xl': '3.5rem', // 56px
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  zIndex: {
    base: 0,
    dropdown: 100,
    sticky: 200,
    fixed: 300,
    modal: 400,
    popover: 500,
    toast: 600,
    tooltip: 700,
  },

  animations: {
    durations: {
      fast: 0.15,
      normal: 0.3,
      slow: 0.5,
      slower: 0.8,
    },
    easings: {
      smooth: [0.25, 0.46, 0.45, 0.94],
      spring: [0.34, 1.56, 0.64, 1],
      bounce: [0.68, -0.55, 0.265, 1.55],
    },
  },
};

// Helper pour créer des gradients dynamiques basés sur une palette
export function createGradientFromPalette(palette, angle = 135) {
  if (!palette || palette.length < 2) {
    return theme.colors.gradients.primary;
  }
  return `linear-gradient(${angle}deg, ${palette[0]} 0%, ${palette[1]} 100%)`;
}

// Helper pour créer des ombres colorées
export function createColoredShadow(color, intensity = 0.3) {
  return `0 0 40px ${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`;
}

// Helper pour les animations stagger
export function createStaggerDelay(index, baseDelay = 0.1) {
  return index * baseDelay;
}

export default theme;
