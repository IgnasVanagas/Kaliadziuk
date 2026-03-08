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
      animation: {
        'marquee': 'marquee 40s linear infinite',
        'fadeInUp': 'fadeInUp 0.35s ease-out',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
};
