import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/ps_insert': {
        target: 'https://mxfqlwa1ek.execute-api.ap-south-1.amazonaws.com/project_synapse',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ps_insert/, '/PS_INSERT'),
        secure: true,
        logLevel: 'debug', // For debugging
      },
      '/api/PS_Validation': {
        target: 'https://0wmmfash48.execute-api.ap-south-1.amazonaws.com/project_synapse',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/PS_Validation/, '/PS_Validation'),
        secure: true,
        logLevel: 'debug',
      },
      '/api/PS_UPDATE': {
        target: 'https://hzz9hr3re8.execute-api.ap-south-1.amazonaws.com/project_synapse',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/PS_UPDATE/, '/PS_UPDATE'),
        secure: true,
        logLevel: 'debug',
      },
      '/api/PS_VIEW': {
        target: 'https://ybsmlyja21.execute-api.ap-south-1.amazonaws.com/project_synapse',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/PS_VIEW/, '/PS_VIEW'),
        secure: true,
        logLevel: 'debug',
      },
    },
  },
});