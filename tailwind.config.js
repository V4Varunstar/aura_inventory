/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./App*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./components-dashboard/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#1111d4",
        "primary-hover": "#0a0ab8",
        "background-light": "#f6f6f8",
        "background-dark": "#0f0f12",
        "surface-dark": "#1a1a23",
        "surface-darker": "#14141c",
        "text-secondary": "#9ca3af",
        "accent-green": "#0bda68",
        "accent-red": "#fa6938",
        "accent-blue": "#3b82f6",
        "accent-purple": "#8b5cf6",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
      borderRadius: {"DEFAULT": "0.375rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "full": "9999px"},
    },
  },
  plugins: [],
}