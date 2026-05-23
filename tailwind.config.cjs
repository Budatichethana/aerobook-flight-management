/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f7fbff',
          100: '#eef7ff',
          200: '#d6eeff',
          300: '#9fd6ff',
          400: '#66bfff',
          500: '#2f9eff',
          600: '#0077e6',
          700: '#005bb4',
          800: '#003f82',
          900: '#002651'
        }
      },
      boxShadow: {
        'soft-lg': '0 8px 30px rgba(17,24,39,0.06)'
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      }
    }
  },
  plugins: []
}
