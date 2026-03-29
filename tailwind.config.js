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
          DEFAULT: '#0139f6',
          50: '#eff3ff',
          100: '#dbe4ff',
          500: '#0139f6',
          600: '#0130d4',
          700: '#0127b0',
        },
        surface: '#f5f5f5',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
