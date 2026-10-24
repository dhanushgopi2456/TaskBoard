/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        }
      },
      boxShadow: {
        '3d-sm': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
        '3d-md': '0 12px 24px -4px rgba(0, 0, 0, 0.12), 0 4px 8px -4px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
        '3d-lg': '0 24px 36px -6px rgba(0, 0, 0, 0.16), 0 10px 16px -6px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.25)',
        '3d-glow': '0 0 30px rgba(99, 102, 241, 0.45)',
        'glow-emerald': '0 0 30px rgba(16, 185, 129, 0.4)',
        'glow-amber': '0 0 30px rgba(245, 158, 11, 0.4)',
        'glow-rose': '0 0 30px rgba(244, 63, 94, 0.4)',
        '3d-btn': '0 6px 0 #3730a3, 0 12px 18px rgba(79, 70, 229, 0.35)',
        '3d-btn-active': '0 2px 0 #3730a3, 0 4px 8px rgba(79, 70, 229, 0.2)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-8px) rotate(1deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.85' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
