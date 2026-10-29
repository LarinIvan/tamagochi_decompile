/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sprinters: '#3B82F6', // Синий
        guardians: '#EF4444', // Красный
        free: '#EAB308',      // Золотой / Желтый
      },
    },
  },
  plugins: [],
}
