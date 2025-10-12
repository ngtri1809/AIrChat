/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aqi: {
          good: '#00E400',
          moderate: '#FFFF00',
          unhealthySensitive: '#FF7E00',
          unhealthy: '#FF0000',
          veryUnhealthy: '#8F3F97',
          hazardous: '#7E0023',
        },
      },
    },
  },
  plugins: [],
}
