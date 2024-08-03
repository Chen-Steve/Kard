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
        '128': '32rem', 
        '144': '36rem', 
        '160': '40rem', 
        '176': '44rem',
        '184': '46rem',
        '192': '48rem', 
        '208': '52rem', 
        '224': '56rem', 
        '240': '60rem', 
      },
      height: {
        '80': '20rem',
        '88': '22rem',
        '96': '24rem',
        '112': '28rem',
        '128': '32rem', 
        '144': '36rem', 
        '160': '40rem', 
        '176': '44rem', 
        '192': '48rem', 
        '208': '52rem', 
        '224': '56rem', 
        '240': '60rem', 
      },
      spacing: {
        '20': '5rem', 
        '30': '8rem', 
        '40': '10rem', 
      },
    },
  },
  plugins: [],
};
export default config;