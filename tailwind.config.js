/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts,js}'],
  theme: {
    extend: {
      colors: {
        surface: '#0f172a',
        card: '#1e293b',
        'card-border': '#334155',
        muted: '#475569',
        subtle: '#64748b',
        brand: '#16a37f',
        'brand-light': '#34d399',
      },
      fontFamily: {
        sans: ["'DM Sans'", 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

