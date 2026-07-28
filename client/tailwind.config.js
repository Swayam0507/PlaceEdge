/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: '#F7F5F0',
        'paper-raised': '#FFFFFF',
        ink: '#1B2A4A',
        'ink-soft': '#4A5A7A',
        muted: '#8B93A7',
        amber: '#FFB648',
        'amber-deep': '#E8962C',
        emerald: '#2F8F6E',
        'emerald-soft': '#E5F3EC',
        coral: '#E8654F',
        line: '#E8E4DB',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '14px', md: '20px', lg: '28px',
      },
      boxShadow: {
        card: '0 4px 24px -8px rgba(27,42,74,0.12)',
        lift: '0 16px 40px -12px rgba(27,42,74,0.22)',
      },
    },
  },
  plugins: [],
}

