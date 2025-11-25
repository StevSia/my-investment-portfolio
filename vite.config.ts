import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    base: './', // This ensures the app works on GitHub Pages sub-directories
    define: {
      // This ensures the Google GenAI SDK works with the process.env.API_KEY pattern
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});