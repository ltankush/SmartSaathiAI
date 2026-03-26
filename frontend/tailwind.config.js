/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0fdf9',
          100: '#ccfbee',
          200: '#99f5dc',
          300: '#5de8c3',
          400: '#2dd4aa',
          500: '#13b88e',
          600: '#0a9374',
          700: '#0b755e',
          800: '#0d5d4c',
          900: '#0e4d3f',
        },
        dark: {
          900: '#080c10',
          800: '#0d1117',
          700: '#161b22',
          600: '#21262d',
          500: '#30363d',
          400: '#3d444d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Inter', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow': 'spin 20s linear infinite',
        'gradient': 'gradient 8s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'count-up': 'countUp 1.5s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        'glow-green': '0 0 30px rgba(19,184,142,0.3)',
        'glow-blue': '0 0 30px rgba(59,130,246,0.3)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
}
