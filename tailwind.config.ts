import type { Config } from 'tailwindcss';
import { colors, radius, fontSize } from './src/lib/tokens';

// design-system トークンを Tailwind theme に反映 (src/lib/tokens.ts が SoT)。
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors,
      borderRadius: radius,
      fontSize: Object.fromEntries(Object.entries(fontSize).map(([k, v]) => [k, v])),
      fontFamily: {
        sans: ['Inter', '"Noto Sans JP"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
