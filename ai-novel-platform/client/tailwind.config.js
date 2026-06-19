/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEF2FF',
          500: '#6366F1',
          600: '#4F46E5',
        },
        accent: {
          50: '#FFFBEB',
          500: '#F59E0B',
        },
      },
    },
  },
  plugins: [],
};