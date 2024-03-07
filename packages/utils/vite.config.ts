/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    include: ['**/*.{test,spec,vitest}.?(c|m)[jt]s?(x)'],
    setupFiles: ['./src/logger/node/register-global.start.ts'],
  },
})
