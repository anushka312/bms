/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        visby: ['Visby', 'sans-serif'],
      }
    }
  },
  plugins: [],
}

