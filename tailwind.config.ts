import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      width: {
        '128': '32rem', // Example custom width
      },
      spacing: {
        '20': '5rem', // existing value
        '30': '8rem', // new custom value
        '40': '10rem', // new custom value
        // Add more custom values as needed
      },
    },
  },
  plugins: [],
};
export default config;