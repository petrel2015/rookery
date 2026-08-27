import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // 相对路径，构建产物可直接开放、也可托管到 GitHub Pages 任意子路径
  base: './',
  server: {
    port: 5180,
  },
})
