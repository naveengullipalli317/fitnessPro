/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Surface
        ink: {
          950: '#0a0a0a',
          900: '#111111',
          800: '#171717',
          700: '#262626',
          600: '#404040',
          500: '#737373',
          400: '#a3a3a3',
          300: '#d4d4d4',
          100: '#fafafa',
        },
        // Accent (volt orange)
        volt: {
          50: '#fff7ed',
          100: '#ffedd5',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        // Positive (lime)
        lime: {
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
        },
        // Legacy primary/secondary aliases so existing classes don't break
        primary: {
          light: '#fb923c',
          DEFAULT: '#f97316',
          dark: '#c2410c',
          50: '#fff7ed',
          100: '#ffedd5',
          600: '#ea580c',
          700: '#c2410c',
          foreground: '#0a0a0a',
        },
        secondary: {
          light: '#a3e635',
          DEFAULT: '#84cc16',
          dark: '#65a30d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Bebas Neue"', 'Anton', 'Impact', 'sans-serif'],
      },
      backgroundImage: {
        'grad-volt': 'linear-gradient(135deg, #f97316 0%, #f43f5e 50%, #a855f7 100%)',
        'grad-volt-soft': 'linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(168,85,247,0.15) 100%)',
        'grad-overlay':
          'linear-gradient(180deg, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.55) 60%, rgba(10,10,10,0.95) 100%)',
        'grad-side':
          'linear-gradient(90deg, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.6) 50%, rgba(10,10,10,0.2) 100%)',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(249,115,22,0.35), 0 10px 30px -10px rgba(249,115,22,0.45)',
      },
      letterSpacing: {
        widest2: '0.2em',
      },
    },
  },
  plugins: [],
};
