/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#050D0E',
        panelBg: 'rgba(10, 24, 26, 0.75)',
        cardBg: 'rgba(15, 34, 37, 0.65)',
        glassBorder: 'rgba(45, 95, 90, 0.35)',
        emeraldAccent: '#10B981',
        tealGlow: '#14B8A6',
        goldAccent: '#F59E0B',
      },
      fontFamily: {
        sans: ['"Inter"', '"Outfit"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        glow: '0 0 25px -5px rgba(20, 184, 166, 0.3)',
        goldGlow: '0 0 20px -3px rgba(245, 158, 11, 0.3)',
      }
    },
  },
  plugins: [],
}
