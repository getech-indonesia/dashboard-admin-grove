/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        shrink: { '0%': { width: '100%' }, '100%': { width: '0%' } },
        shimmer: { '100%': { transform: 'translateX(200%)' } },
      },
      animation: {
        shrink: 'shrink 4s linear forwards',
        shimmer: 'shimmer 1.2s infinite',
      }
    }
  },
  plugins: [],
  darkMode: 'class',
}
