import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['./src/**/*.{test,vitest}.?(c|m)[jt]s?(x)'],
    //exclude: ['**/_build/**']
    exclude: ['**/_build/**']
  }
})
