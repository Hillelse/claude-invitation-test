import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream:      '#FCFAF6',
        green:      '#4F6B52',
        'green-deep': '#2E4632',
        'green-light': '#8FA68F',
        ink:        '#1C2B1E',
        'ink-soft': '#4A5E4C',
      },
    },
  },
  plugins: [],
};
export default config;
