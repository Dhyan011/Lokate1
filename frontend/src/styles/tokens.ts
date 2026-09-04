/**
 * Design Tokens — Single Source of Truth
 * PS-3 Warehouse Network Frontend
 *
 * Import this file everywhere — components, Tailwind config, Spline color matching.
 * Do NOT introduce any color, font, or spacing value outside this file.
 */

export const colors = {
  // Surfaces
  base: '#12131A',        // dark base
  baseDark: '#0A0A0E',    
  baseDeep: '#2A2C3A',    
  card: '#1C1E28',
  ink: '#F2EFE9',         // light text
  inkMuted: '#8B8778',    
  inkSubtle: '#5C584E',   

  // Accents
  accentPrimary: '#E08F5E',   
  accentPrimaryLight: '#F4BA9B', 
  accentPrimaryDark: '#A65A2E', 

  accentSuccess: '#5FA374',   
  accentSuccessLight: '#9BD4AF',
  accentSuccessDark: '#376E4A',

  accentAlert: '#D94F3D',     
  accentAlertLight: '#F29385',
  accentAlertDark: '#962F22',

  accentWarm: '#E8B86D',      
  accentWarmLight: '#F9DBA1',
  accentWarmDark: '#A87E3E',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
} as const;

export const fonts = {
  display: "'Fraunces', serif",  // headlines, section numerals
  body: "'Inter', system-ui, -apple-system, sans-serif", // data, UI chrome
} as const;

export const fontSizes = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem',// 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem',    // 48px
  '6xl': '3.75rem', // 60px
  '7xl': '4.5rem',  // 72px
} as const;

export const spacing = {
  '0': '0px',
  '1': '4px',
  '2': '8px',
  '3': '12px',
  '4': '16px',
  '5': '20px',
  '6': '24px',
  '8': '32px',
  '10': '40px',
  '12': '48px',
  '16': '64px',
  '20': '80px',
  '24': '96px',
  '32': '128px',
} as const;

export const radii = {
  sm: '4px',
  md: '8px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.2)',
  md: '0 4px 12px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)',
  lg: '0 12px 32px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4)',
  xl: '0 24px 48px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.5)',
  card: '0 2px 8px rgba(0,0,0,0.3), 0 0 1px rgba(242, 239, 233, 0.05)',
  hover: '0 8px 24px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)',
  accent: '0 4px 20px rgba(224, 143, 94, 0.2)',
} as const;

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '400ms cubic-bezier(0.4, 0, 0.2, 1)',
  spring: '500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export default {
  colors,
  fonts,
  fontSizes,
  spacing,
  radii,
  shadows,
  transitions,
  breakpoints,
};
