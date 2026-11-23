/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        turbo: { black: "#111111", lime: "#d7ff3f", paper: "#f4f3ef", muted: "#77766f" }
      },
      fontFamily: {
        display: ["Arial Narrow", "Impact", "sans-serif"],
        sans: ["Inter", "Arial", "sans-serif"]
      },
      boxShadow: { soft: "0 16px 50px rgba(0,0,0,.08)" }
    }
  },
  plugins: []
};
