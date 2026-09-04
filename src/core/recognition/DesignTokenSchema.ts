/**
 * DesignTokenSchema
 * Structural definitions for design tokens.
 * Only defines the schema structure without assigning specific values.
 */

export interface SpacingTokenSchema {
  xs: string | number;
  sm: string | number;
  md: string | number;
  lg: string | number;
  xl: string | number;
  xxl: string | number;
}

export interface RadiusTokenSchema {
  none: string | number;
  sm: string | number;
  md: string | number;
  lg: string | number;
  full: string | number;
}

export interface TypographyTokenSchema {
  fontFamilyBase: string;
  fontFamilyHeading: string;
  fontFamilyCode: string;
  fontSizeXs: string;
  fontSizeSm: string;
  fontSizeMd: string;
  fontSizeLg: string;
  fontSizeXl: string;
  fontSize2xl: string;
  fontWeightNormal: number;
  fontWeightMedium: number;
  fontWeightBold: number;
  lineHeightTight: number;
  lineHeightNormal: number;
  lineHeightRelaxed: number;
}

export interface ColorTokenSchema {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  error: string;
  warning: string;
  success: string;
}

export interface ElevationTokenSchema {
  flat: string;
  low: string;
  medium: string;
  high: string;
}

export interface AnimationTokenSchema {
  durationFast: string;
  durationNormal: string;
  durationSlow: string;
  easingStandard: string;
  easingAccelerate: string;
  easingDecelerate: string;
}

export interface BorderTokenSchema {
  widthThin: string | number;
  widthMedium: string | number;
  widthThick: string | number;
  styleSolid: string;
  styleDashed: string;
}

export interface ShadowTokenSchema {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface DesignTokenSchema {
  spacing: SpacingTokenSchema;
  radius: RadiusTokenSchema;
  typography: TypographyTokenSchema;
  colors: ColorTokenSchema;
  elevation: ElevationTokenSchema;
  animation: AnimationTokenSchema;
  border: BorderTokenSchema;
  shadow: ShadowTokenSchema;
}
