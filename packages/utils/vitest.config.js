import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['./src/**/*.{spec,test,vitest}.?(c|m)[jt]s?(x)'],
    //exclude: ['**/_build/**']
    exclude: ['**/_build/**'],
  },
})
