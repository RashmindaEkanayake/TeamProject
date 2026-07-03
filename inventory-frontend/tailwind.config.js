/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0b', // Deep OLED black
        surface: '#121214', // Slightly lighter for cards
        'surface-elevated': '#1c1c1f',
        primary: '#6366f1', // Indigo
        'primary-hover': '#4f46e5',
        secondary: '#06b6d4', // Cyan
        'secondary-hover': '#0891b2',
        accent: '#f43f5e', // Rose
        success: '#10b981', // Emerald
        warning: '#f59e0b', // Amber
        error: '#ef4444', // Red
        'on-background': '#f8fafc',
        'on-surface': '#e2e8f0',
        'on-surface-muted': '#94a3b8',
        outline: '#334155',
        'outline-variant': '#1e293b',
        glass: 'rgba(18, 18, 20, 0.7)',
        'glass-border': 'rgba(255, 255, 255, 0.08)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
        glass: '12px',
      }
    },
  },
  plugins: [],
}
