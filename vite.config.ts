import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './',
  build: {
    // 增加chunk大小警告限制
    chunkSizeWarningLimit: 600,
    // 简化的构建配置
    rollupOptions: {
      output: {
        // 基础的代码分割
        manualChunks: {
          vendor: ['vue', 'vue-router']
        }
      }
    }
  }
})
