import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F9F3EA',
        sand: '#D1C4B2',
        mist: '#9EA4AD',
        slateBlue: '#798599',
        cocoa: '#332313',
        gold: '#B29258',
        terracotta: '#AC5427',
        steel: '#5F6269',
      },
      boxShadow: {
        soft: '0 20px 45px -20px rgba(51, 35, 19, 0.35)',
      },
      borderRadius: {
        card: '1.5rem',
      },
      fontFamily: {
        heading: ['"Moranga"', 'Georgia', 'serif'],
        body: ['"Moranga"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
