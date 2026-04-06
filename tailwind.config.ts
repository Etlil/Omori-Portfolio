import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // This is the important line!
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        omori: ["var(--font-omori)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;