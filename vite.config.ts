import * as path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isProduction = mode === 'production';
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react({
          // Enable React Fast Refresh for development
          fastRefresh: !isProduction,
          // Simpler babel config for production optimizations
          babel: isProduction ? {
            plugins: [
              // Only use built-in optimizations
            ],
            compact: true,
            minified: true
          } : undefined
        })
      ],
      base: '/',
      build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        // Rollup options for better tree shaking
        rollupOptions: {
          output: {
            manualChunks: (id) => {
              // Vendor chunk for core dependencies
              if (id.includes('node_modules')) {
                if (id.includes('react') || id.includes('react-dom')) {
                  return 'vendor';
                }
                if (id.includes('react-router')) {
                  return 'router';
                }
                if (id.includes('recharts') || id.includes('chart') || id.includes('d3')) {
                  return 'charts';
                }
                if (id.includes('lucide-react') || id.includes('@heroicons')) {
                  return 'icons';
                }
                if (id.includes('@firebase') || id.includes('firebase')) {
                  return 'firebase';
                }
                // Other node_modules
                return 'vendor-misc';
              }
              
              // Application chunks
              if (id.includes('/pages/')) {
                return 'pages';
              }
              if (id.includes('/components/')) {
                return 'components';
              }
              if (id.includes('/services/')) {
                return 'services';
              }
            },
            chunkFileNames: (chunkInfo) => {
              const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
              return `assets/[name]-[hash].js`;
            },
            entryFileNames: 'assets/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash].[ext]'
          },
        }
      },
      define: {
        'process.env.NODE_ENV': JSON.stringify(mode),
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || '')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          '@components': path.resolve(__dirname, './components'),
          '@pages': path.resolve(__dirname, './pages'),
          '@services': path.resolve(__dirname, './services'),
          '@utils': path.resolve(__dirname, './utils'),
          '@types': path.resolve(__dirname, './types.ts')
        }
      },
      optimizeDeps: {
        include: [
          'react', 
          'react-dom', 
          'react-router-dom',
          'lucide-react',
          'recharts'
        ],
        exclude: [
          // Exclude heavy dependencies from pre-bundling for faster dev startup
          '@firebase/app',
          '@firebase/auth',
          '@firebase/firestore'
        ]
      },
      // Enable experimental features for better performance
      esbuild: {
        // Remove console logs and debugger statements in production
        drop: isProduction ? ['console', 'debugger'] : [],
        // Enable pure annotations for better tree shaking
        pure: ['console.log', 'console.warn'],
        // Optimize for size in production
        minifyIdentifiers: isProduction,
        minifySyntax: isProduction,
        minifyWhitespace: isProduction
      },
      // CSS optimizations
      css: {
        devSourcemap: !isProduction,
        preprocessorOptions: {
          // Add any CSS preprocessor options here
        }
      }
    };
});
