/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          900: '#0B0F17',
          800: '#111827',
          700: '#1F2937',
          600: '#374151',
          500: '#4B5563',
          400: '#9CA3AF',
          300: '#D1D5DB',
          100: '#F3F4F6',
          50: '#F9FAFB',
        },
        shadow: {
          purple: '#8B5CF6',
          cyan: '#06B6D4',
          emerald: '#10B981',
          rose: '#F43F5E'
        }
      }
    },
  },
  plugins: [],
}
