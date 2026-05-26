import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-dm-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        cream: '#FAFAF8',
        ink: {
          DEFAULT: '#111110',
          2: '#3D3D3A',
          3: '#6B6B65',
          4: '#9E9E97',
        },
        border: {
          DEFAULT: '#E8E8E4',
          2: '#D4D4CE',
        },
        accent: {
          DEFAULT: '#2563EB',
          light: '#EFF6FF',
          dim: '#BFDBFE',
        },
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)',
        lg: '0 8px 40px rgba(0,0,0,.10), 0 2px 8px rgba(0,0,0,.06)',
      },
    },
  },
  plugins: [],
}

export default config
