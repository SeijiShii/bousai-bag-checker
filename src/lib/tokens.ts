// design-system.md (ティールグリーン) のトークン単一ソース (SoT)。
// tailwind.config / globals.css / コンポーネントはこれを参照 (生 hex 直書き禁止)。

export const colors = {
  primary: '#2E8B74',
  'primary-dark': '#1F6B58',
  'primary-fg': '#FFFFFF',
  bg: '#F7F8F6',
  surface: '#FFFFFF',
  'surface-muted': '#EFF2EE',
  text: '#2A2F2C',
  'text-muted': '#6B746F',
  border: '#E2E6E2',
  fresh: '#4CA085',
  warn: '#C98A3B',
  'warn-bg': '#FBF3E6',
  expired: '#C25B4E',
  'expired-bg': '#FBEDEA',
  focus: '#2E8B74',
} as const;

// 鮮度3段階 (concept §1.1 / 論点-001)。純赤・点滅は使わない (不安を煽らない、原則1)。
export const FRESHNESS_STATUS = ['fresh', 'warn', 'expired'] as const;
export type FreshnessStatus = (typeof FRESHNESS_STATUS)[number];

export const radius = { sm: '6px', md: '10px', lg: '16px' } as const;
export const space = { 1: '4px', 2: '8px', 3: '12px', 4: '16px', 5: '24px', 6: '32px', 7: '48px', 8: '64px' } as const;
export const fontSize = { xs: '12px', sm: '14px', base: '16px', lg: '20px', xl: '24px', '2xl': '32px' } as const;
