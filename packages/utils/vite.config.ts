/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { webpackStats } from 'rollup-plugin-webpack-stats'

export default defineConfig({
  // https://vitest.dev/config/#include
  test: {
    include: ['**/*.{test,spec,vitest}.?(c|m)[jt]s?(x)'],
  },

  // https://vitejs.dev/config/


})
