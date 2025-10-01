/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'relief-blue': '#3B82F6',
        'relief-red': '#DC2626', 
        'relief-navy': '#1E3A8A',
        'relief-gray': '#64748B',
        'relief-slate': '#475569',
        // Legacy aliases for existing code
        'aid-red': '#DC2626',
        'aid-gray': '#64748B', 
        'aid-slate': '#475569',
      }
    },
  },
  plugins: [],
}