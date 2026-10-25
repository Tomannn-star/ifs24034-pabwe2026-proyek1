import { defineConfig } from 'vitest/config';
import path from 'path';

const currentDir = import.meta.dirname || process.cwd();

export default defineConfig({
  resolve: {
    alias: {
      $lib: path.resolve(currentDir, './src/lib'),
      '$lib/*': path.resolve(currentDir, './src/lib/*')
    }
  },
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        'dist/**',
        'build/**',
        '.svelte-kit/**',
        '**/*.test.js',
        '**/*.spec.js',
        'postbuild.js',
        'vite.config.js',
        'vitest.config.js'
      ]
    }
  }
});
