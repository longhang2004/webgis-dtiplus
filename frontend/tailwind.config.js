/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#070e1c',
        panel: '#0c1628',
        border: '#1a2d4d',
        accent: '#00d4aa',
        accent2: '#0ea5e9',
        textMain: '#e2eaff',
        muted: '#6b80a8',
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
