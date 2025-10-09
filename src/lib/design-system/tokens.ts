export const designTokens = {
  colors: {
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
      raised: '#ffffff',
      hover: '#f8fafc',
      active: '#f1f5f9'
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      tertiary: '#64748b',
      muted: '#94a3b8'
    },
    border: {
      subtle: '#f1f5f9',
      default: '#e2e8f0',
      strong: '#cbd5e1'
    },
    accent: {
      primary: '#ff8533',
      hover: '#e6751a',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    }
  },
  spacing: {
    none: '0',
    compact: '1rem',
    default: '1.5rem',
    spacious: '2rem'
  },
  radius: {
    none: '0',
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '0.875rem',
    full: '9999px'
  },
  elevation: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
  }
} as const;
