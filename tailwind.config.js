/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'constructivist-red': '#FF3B30',
        'carbon-green': '#3DD68C',
        'base-bg': '#05060A',
        'off-white': '#E5E7EB',
        'neutral-text': '#E5E7EB',
        'secondary-text': '#9CA3AF',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      letterSpacing: {
        'kpi': '0.02em',
        'label': '0.05em',
      },
      transitionTimingFunction: {
        'console': 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(180deg, #05060A 0%, #0A0B10 100%)',
      },
      backdropBlur: {
        'glass': '12px',
      },
      animation: {
        'fade-in': 'fadeIn 150ms ease-out',
        'slide-up': 'slideUp 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(4px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

