import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f172a',
        surface: '#1e293b',
        primary: '#6366f1',
        'primary-hover': '#4f46e5',
        info: '#0ea5e9',
        verified: '#10b981',
        error: '#ef4444',
        'text-primary': '#f1f5f9',
        'text-secondary': '#94a3b8',
      },
      borderRadius: {
        'lg': '12px',
        'xl': '20px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['monospace'],
      },
    },
  },
  plugins: [],
}
export default config