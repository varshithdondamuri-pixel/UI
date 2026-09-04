import { DesignTokenSchema, ColorTokenSchema } from '../recognition/DesignTokenSchema';
import { UIGenerationSpec } from '../ai/UIGenerationSpec';

/**
 * The only concrete instantiation of DesignTokenSchema in the codebase.
 * Generation builders/layout/emitter read colors, spacing, radius, and
 * typography from here instead of hardcoding their own values.
 */
export const defaultDesignTokens: DesignTokenSchema = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },
  radius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 16,
    full: 999
  },
  typography: {
    fontFamilyBase: 'Inter, system-ui, sans-serif',
    fontFamilyHeading: 'Inter, system-ui, sans-serif',
    fontFamilyCode: 'Menlo, monospace',
    fontSizeXs: '11px',
    fontSizeSm: '13px',
    fontSizeMd: '15px',
    fontSizeLg: '20px',
    fontSizeXl: '28px',
    fontSize2xl: '40px',
    fontWeightNormal: 400,
    fontWeightMedium: 600,
    fontWeightBold: 800,
    lineHeightTight: 1.1,
    lineHeightNormal: 1.4,
    lineHeightRelaxed: 1.6
  },
  colors: {
    primary: '#38bdf8',
    secondary: '#6366f1',
    accent: '#f472b6',
    background: '#090d16',
    // Deliberately lighter than both the page background above and
    // CanvasRenderer's hardcoded canvas fill (#0f172a) — a card/container
    // surface identical to the canvas paints an invisible fill, leaving only
    // strokes or child text visible. #1e293b (one slate step up) is what
    // SemanticComponentRenderer's own generic-card fallback already assumes.
    surface: '#1e293b',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    // Bumped from 0.1 — against the now-lighter surface fill above, a 10%
    // border read as almost nothing; this keeps cards edged but still subtle
    // rather than the "heavy 1px box" look.
    border: 'rgba(255, 255, 255, 0.16)',
    error: '#ef4444',
    warning: '#f59e0b',
    success: '#10b981'
  },
  elevation: {
    flat: 'none',
    low: '0 4px 12px rgba(0,0,0,0.3)',
    medium: '0 8px 24px rgba(0,0,0,0.4)',
    high: '0 20px 40px rgba(0,0,0,0.5)'
  },
  animation: {
    durationFast: '120ms',
    durationNormal: '200ms',
    durationSlow: '360ms',
    easingStandard: 'ease',
    easingAccelerate: 'ease-in',
    easingDecelerate: 'ease-out'
  },
  border: {
    widthThin: 1,
    widthMedium: 2,
    widthThick: 3,
    styleSolid: 'solid',
    styleDashed: 'dashed'
  },
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.2)',
    md: '0 4px 12px rgba(0,0,0,0.3)',
    lg: '0 8px 24px rgba(0,0,0,0.4)',
    xl: '0 20px 40px rgba(0,0,0,0.5)'
  }
};

const LIGHT_COLORS: ColorTokenSchema = {
  primary: '#2563eb',
  secondary: '#4f46e5',
  accent: '#db2777',
  background: '#f8fafc',
  surface: '#ffffff',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  border: 'rgba(15, 23, 42, 0.1)',
  error: '#dc2626',
  warning: '#d97706',
  success: '#059669'
};

// Mood only ever adjusts the primary/accent hues — it doesn't swap the
// light/dark structure, which is theme's job.
const MOOD_ACCENTS: Record<string, { primary: string; accent: string }> = {
  playful: { primary: '#f472b6', accent: '#a855f7' },
  professional: { primary: '#2563eb', accent: '#0ea5e9' },
  corporate: { primary: '#1d4ed8', accent: '#334155' },
  minimal: { primary: '#64748b', accent: '#334155' },
  editorial: { primary: '#d97706', accent: '#b45309' },
  dashboard: { primary: '#0ea5e9', accent: '#6366f1' }
};

function moodAccentFor(mood: string): { primary: string; accent: string } | null {
  const m = mood.toLowerCase();
  for (const key of Object.keys(MOOD_ACCENTS)) {
    if (m.includes(key)) return MOOD_ACCENTS[key];
  }
  return null;
}

/**
 * Maps a UIGenerationSpec's visualStyle.theme/mood onto a concrete
 * DesignTokenSchema. theme picks the light/dark structure; mood (when it
 * matches a known keyword) overrides the primary/accent hues on top of that.
 * Falls back to the default dark palette for anything unrecognized — never
 * fakes a token set for a theme/mood string that isn't understood.
 */
export function resolveDesignTokens(visualStyle: Pick<UIGenerationSpec['visualStyle'], 'theme' | 'mood'>): DesignTokenSchema {
  const isLight = visualStyle.theme.toLowerCase().includes('light');
  const baseColors = isLight ? LIGHT_COLORS : defaultDesignTokens.colors;
  const accentOverride = moodAccentFor(visualStyle.mood || '');

  const colors: ColorTokenSchema = accentOverride
    ? { ...baseColors, primary: accentOverride.primary, accent: accentOverride.accent }
    : baseColors;

  return { ...defaultDesignTokens, colors };
}
