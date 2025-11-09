import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue()
    // 已移除vite-bundle-analyzer
  ],
  base: './',
  build: {
    // 增加chunk大小警告限制
    chunkSizeWarningLimit: 600,
    // 简化的构建配置
    rollupOptions: {
      output: {
        // 基础的代码分割
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          i18n: ['vue-i18n']
        }
      }
    }
  },
  // 开发服务器配置
  server: {
    port: 5173,
    open: true,
    cors: true
  },
  // 预览服务器配置
  preview: {
    port: 4173,
    open: true
  }
})
