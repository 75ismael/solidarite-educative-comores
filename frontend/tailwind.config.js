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
          blue: '#164E63',      // Bleu cadrage cahier des charges
          teal: '#0F766E',      // Turquoise secondaire
          light: '#F3F6F8',     // Fond clair
          dark: '#082F49',
          accent: '#0284C7',
        }
      }
    },
  },
  plugins: [],
}
