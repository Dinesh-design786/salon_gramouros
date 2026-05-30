/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class', // Forced dark mode layout styling
  theme: {
    extend: {
      colors: {
        background: '#09090b', // Clean, premium dark background
        card: '#0c0c0f',       // Flat solid sheet gray
        border: '#1f1f27',     // Solid sharp outline borders
        primary: {
          DEFAULT: '#7F77DD',  // GlamourOS primary lavender periwinkle
          hover: '#6960cc'
        },
        success: {
          DEFAULT: '#1D9E75',  // Solid Green
          light: 'rgba(29, 158, 117, 0.1)'
        },
        warning: {
          DEFAULT: '#BA7517',  // Solid Amber
          light: 'rgba(186, 117, 23, 0.1)'
        },
        alert: {
          DEFAULT: '#D85A30',  // Solid Rust
          light: 'rgba(216, 90, 48, 0.1)'
        },
        slate: {
          850: '#171720',
          900: '#121217',
          950: '#07070a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Inter', 'sans-serif']
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px'
      },
      borderWidth: {
        'default': '1px'
      }
    },
  },
  plugins: [],
}
