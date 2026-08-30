/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kid: {
          pink: '#FF6B9B',
          purple: '#8B5CF6',
          yellow: '#FFC837',
          blue: '#3B82F6',
          green: '#10B981',
          bg: '#F8FAFC'
        }
      },
      fontFamily: {
        rounded: ['ui-rounded', 'Fredoka', 'Quicksand', 'Nunito', 'sans-serif'],
      },
      animation: {
        'bounce-short': 'bounce 0.5s ease-in-out 2',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      }
    },
  },
  plugins: [],
}
