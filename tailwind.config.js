/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'hind': ['"Hind Siliguri"', 'sans-serif'],
      },
      colors: {
        'fifa-green':  '#00D84C',
        'fifa-bright': '#39FF8A',
        'fifa-dim':    '#00A83A',
        'fifa-gold':   '#FFD700',
        'fifa-gold-d': '#C9A84C',
        'fifa-dark':   '#03080A',
        'fifa-s1':     '#071210',
        'fifa-s2':     '#0B1C17',
      },
    },
  },
  plugins: [],
}
