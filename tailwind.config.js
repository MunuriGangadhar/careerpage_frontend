/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        sans:    ['DM Sans', 'sans-serif'],
      },
      colors: {
        ink:     { DEFAULT: '#0A0A0F', 2: '#16161F', 3: '#1E1E2A' },
        surface: { DEFAULT: '#F5F4F0', 2: '#ECEAE4' },
        gold:    { DEFAULT: '#C9A84C', light: '#E8C97A' },
        jade:    '#2ECC94',
        crimson: '#E8445A',
      },
      boxShadow: {
        'card':    '0 4px 24px rgba(0,0,0,0.08)',
        'card-lg': '0 8px 48px rgba(0,0,0,0.12)',
        'dark':    '0 4px 24px rgba(0,0,0,0.4)',
        'dark-lg': '0 16px 64px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
};