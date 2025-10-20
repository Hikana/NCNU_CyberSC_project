/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        bggray: '#F2F0F0',
        wordcolor: '#464655',
        bgg:'#EDDFEF',
        lightGray:'#D5CFE1',
        middleGray:'#B7B6C1',
        blueGray:"#7F9EB2",
        pinkGray:"#A997B8",
        blueGrayPressed: "#5F7A91",
        pinkGrayPressed: "#8B7CA3",
      },
      backgroundImage:{
        'can': "url('/src/assets/image/can1.png')",
      },
    },
  },
  plugins: [],
}

