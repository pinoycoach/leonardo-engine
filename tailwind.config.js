/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        leonardo: {
          50: '#fff8ed',
          100: '#ffefd4',
          200: '#ffdaa8',
          300: '#ffbe71',
          400: '#ff9838',
          500: '#ff7a12',
          600: '#f05f08',
          700: '#c74709',
          800: '#9e3910',
          900: '#7f3110',
        },
      },
    },
  },
  plugins: [],
}
