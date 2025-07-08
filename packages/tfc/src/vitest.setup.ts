import { beforeAll } from 'vitest'
import { $dev } from './dc.js'

beforeAll(() => {
  globalThis.$dev = $dev
})
