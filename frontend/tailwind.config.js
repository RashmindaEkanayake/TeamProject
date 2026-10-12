/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1',
          hover: '#4F46E5',
        },
        secondary: {
          DEFAULT: '#06B6D4',
          hover: '#0891B2',
        },
        surface: {
          DEFAULT: '#0B0F19',
          elevated: '#151D2F',
          container: '#1E293B',
          'container-high': '#283548',
        },
        'on-surface': {
          DEFAULT: '#F8FAFC',
          muted: '#94A3B8',
        },
        'glass-border': 'rgba(255, 255, 255, 0.08)',
        'outline-variant': 'rgba(255, 255, 255, 0.12)',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      spacing: {
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
      },
      fontSize: {
        'label-md': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.05em' }],
        'body-md': ['0.875rem', { lineHeight: '1.25rem' }],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.3s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
