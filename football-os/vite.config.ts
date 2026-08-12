import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const backendTarget = env.VITE_BACKEND_URL || 'http://localhost:8080'
  const aiTarget = env.VITE_AI_URL || 'http://localhost:8000'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      proxy: {
        // Python AI 服务优先匹配（路径更长）
        '/api/v1/ai': {
          target: aiTarget,
          changeOrigin: true,
        },
        // Java 业务后端
        '/api/v1': {
          target: backendTarget,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 1500,
    },
  }
})
