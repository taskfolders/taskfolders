import { expect, describe, it } from 'vitest'
import { delay } from './delay.js'

it.skip('x #manual', async () => {
  $dev('1')
  await delay(1_000)
  $dev('2')
})
