/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: '#fff8f1',
          100: '#feeedc',
          200: '#fcdab7',
          300: '#fabf87',
          400: '#f59a51',
          500: '#e06d14', // Primary brand color
          600: '#cc570c',
          700: '#a9410d',
          800: '#873412',
          900: '#6f2d12',
        },
        forest: {
          50: '#f0f9f3',
          100: '#dcf0e3',
          200: '#bbe1ca',
          300: '#8ecaa8',
          400: '#5cae82',
          500: '#1a5c38', // Secondary brand color
          600: '#2c734b',
          700: '#235c3c',
          800: '#1e4932',
          900: '#193d2b',
        },
        cream: {
          50: '#ffffff',
          100: '#fdfbf7', // Background
          200: '#f9f5ed',
          300: '#f3ebd9',
          400: '#e8dcbe',
          500: '#dac79e',
        },
        charcoal: {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#a8a8a8',
          400: '#6b6b6b', // AA contrast
          500: '#545454', // AAA contrast 7.8:1+
          600: '#3f3f3f', // High contrast 10.5:1
          700: '#2e2e2e', // High contrast 13.5:1
          800: '#22201e', // Ultra dark 15.5:1
          900: '#161413', // Primary high-contrast text 17.5:1
        },
        gold: {
          DEFAULT: '#d97706',
          light: '#fbbf24',
          dark: '#b45309'
        },
        terracotta: {
          DEFAULT: '#c2410c',
          light: '#ea580c',
          dark: '#9a3412'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'sans-serif'],
        hindi: ['Noto Sans Devanagari', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(28, 25, 23, 0.06), 0 2px 6px -1px rgba(28, 25, 23, 0.04)',
        'card-hover': '0 12px 30px -4px rgba(224, 109, 20, 0.12), 0 4px 12px -2px rgba(26, 92, 56, 0.08)',
        'glass': '0 8px 32px 0 rgba(28, 25, 23, 0.08)',
      }
    },
  },
  plugins: [],
}
