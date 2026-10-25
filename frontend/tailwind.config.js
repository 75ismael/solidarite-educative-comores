/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        scaleway: {
          bg: '#0B0817',         // Fond principal très sombre violet/noir
          surface: '#140F28',    // Surfaces et conteneurs
          card: '#181230',       // Cartes et encarts
          border: '#281F4B',     // Bordures subtiles
          borderLight: '#3D316E',
          purple: '#7C3AED',     // Violet principal d'action
          purpleLight: '#8B5CF6',
          purpleGlow: '#A855F7',
          muted: '#9D97B8',      // Texte secondaire adouci
        },
        brand: {
          dark: '#0B0817',       // Fond principal
          surface: '#140F28',    // Surface
          card: '#181230',       // Cartes
          border: '#281F4B',     // Bordures
          blue: '#7C3AED',       // Violet emblématique Scaleway
          teal: '#8B5CF6',       // Violet lumineux
          light: '#0B0817',      // Fond sombre par défaut
          accent: '#A855F7',
        }
      }
    },
  },
  plugins: [],
}
