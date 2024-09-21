import react from '@vitejs/plugin-react'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { resolve } from 'path'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react()],
    // optimizeDeps: {
    //   esbuildOptions: {
    //     // Enable esbuild polyfill plugins
    //     plugins: [
    //       NodeGlobalsPolyfillPlugin({
    //         process: true
    //       }),
    //       NodeModulesPolyfillPlugin()
    //     ]
    //   }
    // },
    server: {
      port: 1420,
      strictPort: true,
      watch: {
        // 3. tell vite to ignore watching `src-tauri`
        ignored: ['**/src-tauri/**']
      },
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
    }
  }
})
