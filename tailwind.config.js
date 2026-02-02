/** @type {import('tailwindcss').Config} */
export default {
  content: ['index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['Hamburg Hand Display', 'Hamburg', 'Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: '#000000',
        accent: '#DCF41E',
      },
    },
  },
  plugins: [],
};
