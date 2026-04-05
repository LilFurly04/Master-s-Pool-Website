import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        masters: {
          green: "#006747",
          "green-dark": "#004d35",
          "green-light": "#1a8a60",
          gold: "#CBA135",
          "gold-light": "#e8c86a",
          "gold-dark": "#a07a1a",
          cream: "#f5f0e8",
          "cream-dark": "#ede5d0",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
      backgroundImage: {
        "masters-gradient":
          "linear-gradient(135deg, #006747 0%, #004d35 50%, #003d28 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
