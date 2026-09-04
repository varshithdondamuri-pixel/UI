import { ColorTokens, DesignSystem, ThemeMetadata } from './DesignTypes';

export class ColorPlanner {
  /**
   * Generates an accessible, mathematically calculated set of color tokens
   * based on the active DesignSystem and ThemeMetadata combination.
   */
  public generateColorTokens(designSystem: DesignSystem, theme: ThemeMetadata): ColorTokens {
    const isDark = theme.mode === 'dark' || theme.id === 'cool';
    const isHighContrast = theme.mode === 'high-contrast';

    if (isHighContrast) {
      return {
        primary: '#ffff00',
        primaryHover: '#e6e600',
        secondary: '#00ffff',
        accent: '#ff00ff',
        surface: '#000000',
        surfaceSubtle: '#121212',
        background: '#000000',
        border: '#ffffff',
        success: '#00ff00',
        warning: '#ffff00',
        danger: '#ff0000',
        information: '#00ffff',
        text: '#ffffff',
        textMuted: '#e0e0e0'
      };
    }

    // Dynamic color variations based on design system style & theme
    switch (designSystem.id) {
      case 'linear-inspired':
        return isDark
          ? {
              primary: '#5e6ad2',
              primaryHover: '#707ee6',
              secondary: '#4f566b',
              accent: '#f2994a',
              surface: '#15171e',
              surfaceSubtle: '#1b1e28',
              background: '#0b0c10',
              border: 'rgba(255, 255, 255, 0.08)',
              success: '#4ade80',
              warning: '#facc15',
              danger: '#f87171',
              information: '#60a5fa',
              text: '#f7f8f8',
              textMuted: '#8a8f98'
            }
          : {
              primary: '#4f566b',
              primaryHover: '#333846',
              secondary: '#6b7280',
              accent: '#d97706',
              surface: '#ffffff',
              surfaceSubtle: '#f4f5f8',
              background: '#f8fafc',
              border: '#e2e8f0',
              success: '#16a34a',
              warning: '#ca8a04',
              danger: '#dc2626',
              information: '#2563eb',
              text: '#0f172a',
              textMuted: '#64748b'
            };

      case 'stripe-inspired':
        return isDark
          ? {
              primary: '#635bff',
              primaryHover: '#7a73ff',
              secondary: '#00d4b6',
              accent: '#ff5c93',
              surface: '#1a1f36',
              surfaceSubtle: '#2a2f45',
              background: '#0a2540',
              border: 'rgba(255, 255, 255, 0.12)',
              success: '#00d4b6',
              warning: '#ffc015',
              danger: '#ff5c93',
              information: '#635bff',
              text: '#ffffff',
              textMuted: '#adbdcc'
            }
          : {
              primary: '#635bff',
              primaryHover: '#0a2540',
              secondary: '#00d4b6',
              accent: '#ff5c93',
              surface: '#ffffff',
              surfaceSubtle: '#f6f9fc',
              background: '#ffffff',
              border: '#e6ebf1',
              success: '#00ab92',
              warning: '#e5a500',
              danger: '#df1b41',
              information: '#635bff',
              text: '#0a2540',
              textMuted: '#425466'
            };

      case 'apple-inspired':
        return isDark
          ? {
              primary: '#2997ff',
              primaryHover: '#40a4ff',
              secondary: '#98989d',
              accent: '#ff375f',
              surface: 'rgba(30, 30, 32, 0.75)',
              surfaceSubtle: 'rgba(44, 44, 46, 0.65)',
              background: '#000000',
              border: 'rgba(255, 255, 255, 0.15)',
              success: '#30d158',
              warning: '#ffd60a',
              danger: '#ff453a',
              information: '#64d2ff',
              text: '#f5f5f7',
              textMuted: '#86868b'
            }
          : {
              primary: '#0066cc',
              primaryHover: '#004080',
              secondary: '#86868b',
              accent: '#ff2d55',
              surface: 'rgba(255, 255, 255, 0.8)',
              surfaceSubtle: 'rgba(242, 242, 247, 0.8)',
              background: '#f5f5f7',
              border: 'rgba(0, 0, 0, 0.1)',
              success: '#28cd41',
              warning: '#ffcc00',
              danger: '#ff3b30',
              information: '#54c8e8',
              text: '#1d1d1f',
              textMuted: '#86868b'
            };

      case 'neobrutalist':
        return {
          primary: '#ff5252',
          primaryHover: '#ff1a1a',
          secondary: '#ffd700',
          accent: '#00e676',
          surface: '#ffffff',
          surfaceSubtle: '#fff9e6',
          background: '#fffaed',
          border: '#000000',
          success: '#00e676',
          warning: '#ffd700',
          danger: '#ff5252',
          information: '#29b6f6',
          text: '#000000',
          textMuted: '#424242'
        };

      case 'glass':
        return isDark
          ? {
              primary: '#a855f7',
              primaryHover: '#c084fc',
              secondary: '#06b6d4',
              accent: '#f43f5e',
              surface: 'rgba(255, 255, 255, 0.05)',
              surfaceSubtle: 'rgba(255, 255, 255, 0.08)',
              background: '#0f172a',
              border: 'rgba(255, 255, 255, 0.15)',
              success: '#34d399',
              warning: '#fbbf24',
              danger: '#f87171',
              information: '#38bdf8',
              text: '#f8fafc',
              textMuted: '#94a3b8'
            }
          : {
              primary: '#9333ea',
              primaryHover: '#7e22ce',
              secondary: '#0891b2',
              accent: '#e11d48',
              surface: 'rgba(255, 255, 255, 0.65)',
              surfaceSubtle: 'rgba(255, 255, 255, 0.85)',
              background: '#f1f5f9',
              border: 'rgba(255, 255, 255, 0.4)',
              success: '#059669',
              warning: '#d97706',
              danger: '#e11d48',
              information: '#0284c7',
              text: '#0f172a',
              textMuted: '#64748b'
            };

      default:
        // Default Modern SaaS / Minimal palette
        return isDark
          ? {
              primary: '#38bdf8',
              primaryHover: '#0284c7',
              secondary: '#818cf8',
              accent: '#f43f5e',
              surface: '#1e293b',
              surfaceSubtle: '#334155',
              background: '#0f172a',
              border: 'rgba(255, 255, 255, 0.1)',
              success: '#4ade80',
              warning: '#facc15',
              danger: '#ef4444',
              information: '#38bdf8',
              text: '#f8fafc',
              textMuted: '#94a3b8'
            }
          : {
              primary: '#0284c7',
              primaryHover: '#0369a1',
              secondary: '#4f46e5',
              accent: '#e11d48',
              surface: '#ffffff',
              surfaceSubtle: '#f8fafc',
              background: '#f1f5f9',
              border: '#e2e8f0',
              success: '#16a34a',
              warning: '#ca8a04',
              danger: '#dc2626',
              information: '#0284c7',
              text: '#0f172a',
              textMuted: '#64748b'
            };
    }
  }
}
