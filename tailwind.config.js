/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out forwards',
        scaleIn: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        slideUp: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        pulseSubtle: 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      colors: {
        poly: {
          dark: '#0A0B0D',
          surface: '#0F1115',
          card: '#13151A',
          cardHover: '#1A1D24',
          elevated: '#1C1E26',
          border: '#252832',
          borderSubtle: '#1E2028',
          primary: '#F59E0B',
          primaryHover: '#D97706',
          amber: '#F59E0B',
          amberHover: '#D97706',
          blue: '#0EA5E9',
          blueHover: '#0284C7',
          yes: '#0EA5E9',
          yesHover: '#0284C7',
          yesBg: 'rgba(14, 165, 233, 0.12)',
          yesBorder: 'rgba(14, 165, 233, 0.3)',
          no: '#F43F5E',
          noHover: '#E11D48',
          noBg: 'rgba(244, 63, 94, 0.12)',
          noBorder: 'rgba(244, 63, 94, 0.3)',
          zk: '#F59E0B',
          zkBg: 'rgba(245, 158, 11, 0.12)',
          zkBorder: 'rgba(245, 158, 11, 0.28)',
          zkText: '#FBBF24',
          text: '#F8FAFC',
          muted: '#94A3B8',
          subtle: '#64748B',
        },
        midnight: {
          900: '#0A0B0D',
          800: '#13151A',
          700: '#1C1E26',
          600: '#252832',
          500: '#94A3B8',
          400: '#CBD5E1',
          300: '#E2E8F0',
          100: '#FFFFFF',
          50: '#F8FAFC',
        },
      }
    },
  },
  plugins: [],
}
