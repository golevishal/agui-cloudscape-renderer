import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Library build configuration for npm package
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      // Externalize deps that consumers provide
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react-router-dom',
        '@cloudscape-design/components',
        '@cloudscape-design/collection-hooks',
        '@cloudscape-design/global-styles',
        /^@cloudscape-design\//,
      ],
    },
    outDir: 'dist-lib',
    emptyOutDir: true,
  },
})
