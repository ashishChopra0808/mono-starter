// ─── Semantic Color Tokens ──────────────────────────────────────────────────
// These represent the *role* a color plays in the UI, not its raw value.
// Every theme must provide a mapping for each semantic token.

export interface SemanticColors {
  /** Page / root background */
  background: string;
  /** Card / secondary surface background */
  'background-secondary': string;

  /** Primary text color */
  foreground: string;
  /** Subdued / secondary text */
  'foreground-muted': string;

  /** Primary brand / CTA color */
  primary: string;
  /** Text on primary-colored backgrounds */
  'primary-foreground': string;

  /** Secondary actions, less prominent buttons */
  secondary: string;
  /** Text on secondary-colored backgrounds */
  'secondary-foreground': string;

  /** Disabled / placeholder surfaces */
  muted: string;
  /** Text on muted surfaces */
  'muted-foreground': string;

  /** General borders */
  border: string;
  /** Input field borders */
  'border-input': string;
  /** Focus ring color */
  ring: string;

  /** Error / destructive actions */
  destructive: string;
  /** Text on destructive backgrounds */
  'destructive-foreground': string;

  /** Success states */
  success: string;
  /** Text on success backgrounds */
  'success-foreground': string;

  /** Warning states */
  warning: string;
  /** Text on warning backgrounds */
  'warning-foreground': string;
}

// ─── Theme ──────────────────────────────────────────────────────────────────

export interface Theme {
  /** Unique theme identifier (e.g. 'light', 'dark', 'midnight') */
  name: string;
  /** Semantic color mappings for this theme */
  colors: SemanticColors;
}

// ─── Non-Color Tokens ───────────────────────────────────────────────────────

export interface TypographyTokens {
  fontFamily: {
    sans: string;
    mono: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: string;
    normal: string;
    relaxed: string;
  };
}

export interface SpacingTokens {
  /** 4px-based spacing scale keyed by step number */
  [key: string]: string;
}

export interface RadiusTokens {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}
