/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // <- wichtig
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: "#000000", // Komplett schwarz
      },
    },
  },
  plugins: [],
};
