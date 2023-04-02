/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './src/app/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
    './src/pages/**/*.{js,jsx,ts,tsx}',
  ],
  plugins: [],
  theme: {
    extend: {
      backgroundColor: {
        'accent': 'var(--background-accent)',
        'accent-secondary': 'var(--background-accent-secondary)',
        'invert': 'var(--background-invert)',
        'primary': 'var(--background-primary)',
        'secondary': 'var(--background-secondary)',
        'tertiary': 'var(--background-tertiary)',
      },
      borderColor: {
        'accent': 'var(--border-accent)',
        'accent-secondary': 'var(--border-accent-secondary)',
        'invert': 'var(--border-invert)',
        'primary': 'var(--border-primary)',
        'secondary': 'var(--border-secondary)',
        'tertiary': 'var(--border-tertiary)',
      },
      borderRadius: {'10': '10px'},
      colors: {},
      fontFamily: {
        'jakarta': ['Plus Jakarta Sans', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
        'sans': ['Inter', 'sans-serif'],
      },
      fontSize: {
        '2xs': '.625rem', 
        '3xs': '.5rem'
      },
      height: {'120': '30rem'},
      outlineColor: {
        'accent': 'var(--border-accent)',
        'accent-secondary': 'var(--border-accent-secondary)',
        'invert': 'var(--border-invert)',
        'primary': 'var(--border-primary)',
        'secondary': 'var(--border-secondary)',
        'tertiary': 'var(--border-tertiary)',
      },
      screens: {
        'xs': '375px',
      },
      textColor: {
        'accent': 'var(--text-accent)',
        'accent-hover': 'var(--text-accent-hover)',
        'accent-secondary': 'var(--text-accent-secondary)',
        'accent-secondary-hover': 'var(--text-accent-secondary-hover)',
        'primary': 'var(--text-primary)',
        'secondary': 'var(--text-secondary)',
      },
      width: {
        '120': '30rem',
        '300': '75rem',
        '330': '82.5rem',
        '345': '86.25rem',
        '360': '90rem'
      },
    },
  },
};
