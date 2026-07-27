/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        sidebar: {
          DEFAULT: '#064e3b',
          light: '#065f46',
          active: '#047857',
          hover: '#065f46',
        }
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(6, 78, 59, 0.08), 0 1px 2px -1px rgba(6, 78, 59, 0.06)',
        'card-hover': '0 4px 12px 0 rgba(6, 78, 59, 0.12), 0 2px 4px -2px rgba(6, 78, 59, 0.08)',
      }
    },
  },
  plugins: [],
}
