/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        interbox: {
          pink: '#ff1bdd',
          blue: '#0038d0',
          cyan: '#0092c0',
          dark: '#000332',
          white: '#ffffff',
        },
        pink: { neon: '#ff1bdd' },
        blue: { neon: '#0038d0' },
        cyan: { neon: '#0092c0' },
        dark: { tech: '#000332' },
      },
      boxShadow: {
        'neon-pink': '0 0 16px #ff1bdd, 0 0 32px #ff1bdd44',
        'neon-cyan': '0 0 16px #0092c0, 0 0 32px #0092c044',
        'neon-blue': '0 0 16px #0038d0, 0 0 32px #0038d044',
      },
      fontFamily: {
        tech: ['"Orbitron"', '"Rajdhani"', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
} 