/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          primary: '#0B1F3A',
          secondary: '#153E75',
        },
        blue: {
          primary: '#2563EB',
          accent: '#3B82F6',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        surface: '#FFFFFF',
        bg: '#F8FAFC',
        text: {
          DEFAULT: '#1E293B',
          soft: '#64748B',
        },
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: '20px',
        md: '14px',
        sm: '10px',
      },
    },
  },
  plugins: [],
};
