/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'aid-red': '#DC2626',
        'aid-gray': '#64748B',
        'aid-slate': '#475569',
      }
    },
  },
  plugins: [],
}