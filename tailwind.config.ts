import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cozanet: {
          bg: '#0a0a0f',
          surface: '#111118',
          border: '#1e1e2e',
          accent: '#6366f1',
          'accent-hover': '#4f46e5',
          text: '#e2e8f0',
          muted: '#64748b',
          user: '#1e293b',
          assistant: '#0f172a',
        },
      },
      animation: {
        'pulse-dot': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
