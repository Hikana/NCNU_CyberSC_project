// frontend/vite.config.js

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path' // 1. 引入 node 的 path 模組

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // 2. 新增 resolve 設定
  resolve: {
    alias: {
      // 設定 '@' 別名，讓它指向 'src' 資料夾的絕對路徑
      '@': path.resolve(__dirname, 'src'),
    }
  }
})