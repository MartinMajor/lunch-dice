import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "casino-black": "#0a0a0f",
        "felt": "#1a2e1a",
        "gold": "#c9a84c",
        "gold-light": "#e8c96a",
        "cream": "#f5f0e8",
        "danger": "#8b1a1a",
        "danger-bright": "#cc2222",
        "safe": "#1a4a1a",
      },
      fontFamily: {
        display: ["var(--font-cinzel)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        "gold": "0 0 20px rgba(201, 168, 76, 0.4)",
        "danger": "0 0 20px rgba(204, 34, 34, 0.6)",
        "safe": "0 0 20px rgba(26, 74, 26, 0.5)",
      },
    },
  },
  plugins: [],
};

export default config;
