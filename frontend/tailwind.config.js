/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["acid"],
    darkTheme: "acid",
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: true,
  },
} 