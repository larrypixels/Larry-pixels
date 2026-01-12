/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      borderRadius: {
        lg: '0px',
        md: '0px',
        sm: '0px',
        DEFAULT: '0px',
        none: '0px'
      },
      colors: {
        background: '#050505',
        foreground: '#E0E0E0',
        card: {
          DEFAULT: '#050505',
          foreground: '#E0E0E0'
        },
        popover: {
          DEFAULT: '#050505',
          foreground: '#E0E0E0'
        },
        primary: {
          DEFAULT: '#FFFFFF',
          foreground: '#050505'
        },
        secondary: {
          DEFAULT: '#1A1A1A',
          foreground: '#FFFFFF'
        },
        muted: {
          DEFAULT: '#888888',
          foreground: '#E0E0E0'
        },
        accent: {
          DEFAULT: '#FFFFFF',
          foreground: '#050505'
        },
        destructive: {
          DEFAULT: '#FF0000',
          foreground: '#FFFFFF'
        },
        border: '#333333',
        input: '#333333',
        ring: '#FFFFFF'
      },
      fontFamily: {
        pixel: ['VT323', 'Press Start 2P', 'monospace'],
        mono: ['Space Mono', 'JetBrains Mono', 'monospace']
      },
      animation: {
        flicker: 'flicker 4s infinite'
      },
      keyframes: {
        flicker: {
          '0%': { opacity: '0.97' },
          '5%': { opacity: '0.95' },
          '10%': { opacity: '0.9' },
          '15%': { opacity: '0.95' },
          '20%': { opacity: '0.99' },
          '100%': { opacity: '0.9' }
        }
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
}