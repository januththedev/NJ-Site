/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: {
          950: '#05060a',
          900: '#0a0c12',
          850: '#0e1119',
          800: '#131722',
          700: '#1b2130',
          600: '#262e42',
        },
        glow: {
          cyan: '#38e8ff',
          blue: '#4d7cff',
          violet: '#8b5cf6',
          amber: '#ffb454',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', '"Noto Sans Sinhala"', 'sans-serif'],
        body: ['Inter', '"Noto Sans Sinhala"', 'sans-serif'],
      },
      boxShadow: {
        glass: 'inset 0 1px 0 0 rgba(255,255,255,0.06), 0 20px 50px -20px rgba(0,0,0,0.7)',
        'glow-cyan': '0 0 40px -8px rgba(56,232,255,0.45)',
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
      },
    },
  },
  plugins: [],
}
