/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0ea5e9",      // sky-500
        surface: "#f8fafc",      // slate-50
        card: "#ffffff",
        text: "#0f172a"          // slate-900
      },
      boxShadow: {
        soft: "0 8px 24px rgba(15, 23, 42, .08)"
      },
      borderRadius: {
        xl2: "1rem"
      }
    },
  },
  plugins: [],
}
