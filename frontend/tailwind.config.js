/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        bggray: '#DAE1F7',
        wordcolor: '#352E2A',
        bgg: 'rgba(237, 223, 239, 0)',
        lightGray:'#FAC6D3',
        middleGray:'#F2D7E6',
        blueGray:"#D1BBED",
        pinkGray:'#F2D7E6',
        blueGrayPressed: "#AB78BE",
        pinkGrayPressed: "#F2D7E6",
      },
      backgroundImage:{
        'can': "url('/src/assets/image/can1.png')",
      },
    },
  },
  plugins: [],
}

