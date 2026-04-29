/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary:  '#4F8EF7',
        'primary-dark': '#3B7AE8',
        teal:     { DEFAULT: '#2CB1A1', 500: '#2CB1A1', 600: '#239E8F', 400: '#3EC4B4', 100: '#D4F3EF', 50: '#EDFAF8' },
        bg:       '#F0F4FA',
        success:  '#10B981',
        warning:  '#F59E0B',
        error:    '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.08), 0 2px 4px -1px rgb(0 0 0 / 0.04)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #EEF4FF 0%, #F0FAFA 50%, #F0F4FA 100%)',
        'brand-gradient': 'linear-gradient(135deg, #4F8EF7 0%, #2CB1A1 100%)',
      },
    },
  },
  plugins: [],
}

