/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#ffffff',
        surface: '#f8fafc',
        'surface-hover': '#f1f5f9',
        
        // Custom Theme Colors used across components
        ink: {
          DEFAULT: '#0f172a', // Very dark slate (text-ink)
          soft: '#475569',    // Slate 600 (text-ink-soft)
        },
        muted: '#94a3b8',     // Slate 400 (text-muted)
        line: '#e2e8f0',      // Slate 200 (border-line)
        paper: {
          DEFAULT: '#ffffff', // bg-paper
          raised: '#ffffff',  // bg-paper-raised
        },

        border: '#e2e8f0',
        text: {
          primary: '#0f172a',
          secondary: '#475569',
          muted: '#94a3b8',
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        accent: {
          500: '#8b5cf6', // Violet
          600: '#7c3aed',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        
        // Status & feedback colors
        emerald: {
          DEFAULT: '#10b981',
          soft: '#d1fae5',    // emerald-100
        },
        coral: {
          DEFAULT: '#ef4444', // red-500
          soft: '#fee2e2',    // red-100
        },
        amber: {
          DEFAULT: '#f59e0b',
          deep: '#b45309',    // amber-700
          soft: '#fef3c7',    // amber-100
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Inter', 'sans-serif'], // For headings
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        floating: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        glow: '0 0 15px -3px rgba(59, 130, 246, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
