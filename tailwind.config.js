// 重新產生 tailwind.css：npx tailwindcss@3.4.17 -c tailwind.config.js -i tailwind.input.css -o tailwind.css --minify
module.exports = {
  content: ['./index.html', './services.html', './island-data.js', './build-text-page.js'],
  darkMode: 'class',
  theme: {
    extend: {
      gridTemplateColumns: { 20: 'repeat(20, minmax(0, 1fr))' },
      colors: {
        brand:   { 50: '#f1f9e8', 100: '#ddf0c7', 200: '#bfe39b', 300: '#9fd56b', 400: '#84c845', 500: '#68b828', 600: '#549620', 700: '#42771a', 800: '#305813', 900: '#1f3a0d', 950: '#122308' },
        medblue: { 50: '#e6f4fc', 100: '#c7e6f8', 200: '#93cdf1', 300: '#5fb4ea', 400: '#2b9fe2', 500: '#0088d4', 600: '#0070b0', 700: '#005a8c', 800: '#00436a', 900: '#002d47', 950: '#001a2b' },
        accent: { gold: '#fbbf24', orange: '#f97316', violet: '#8b5cf6' }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Noto Sans TC"', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
      }
    }
  }
};
