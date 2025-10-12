/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  plugins: [],
  theme: {
    extend: {
      colors: {
        "accent-hover": "var(--accent-hover)",
        "accent-primary": "var(--accent-primary)",
        "bg-primary": "var(--bg-primary)",
        "bg-secondary": "var(--bg-secondary)",
        "bg-tertiary": "var(--bg-tertiary)",
        "border-default": "var(--border-default)",
        "border-strong": "var(--border-strong)",
        "border-subtle": "var(--border-subtle)",
        sablier: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#FF5001", // Primary brand orange
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          950: "#431407",
        },
        "surface-active": "var(--surface-active)",
        "surface-hover": "var(--surface-hover)",
        "surface-raised": "var(--surface-raised)",
        "text-muted": "var(--text-muted)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-tertiary": "var(--text-tertiary)",
      },
    },
  },
};
