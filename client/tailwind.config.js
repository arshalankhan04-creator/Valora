/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        primaryDark: '#3B32C4',
        tealPrimary: '#0B655F',
        tealDark: '#09524D',
        bgLight: '#FAFAFC',
        textCharcoal: '#000000',
        socialIndigo: '#6C3FF5',
        animCharcoal: '#2D2D2D',
        animOrange: '#FF9B6B',
        animYellow: '#E8D754',
      },
    },
  },
  plugins: [],
}
