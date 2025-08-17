/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e0f7ff",
          100: "#b3ecff",
          200: "#80dfff",
          300: "#4dd2ff",
          400: "#1ab3ff",
          500: "#0099ff",
          600: "#007fd6",
          700: "#0066b3",
          800: "#004d8f",
          900: "#00336b",
          950: "#001a35",
        },
        secondary: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
      },
    },
  },
  plugins: [],
};
