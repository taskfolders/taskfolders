import { expect, describe, it } from 'vitest'
import { timeDiff } from './timeDiff.js'

it('x', async () => {
  let res = timeDiff({
    date: new Date('2026'),
    color: false,
    now: new Date('2025-03'),
  })
  //expect(res).toBe('W1 +43w')
  expect(res).toBe('+43w')
})

it('x', async () => {
  let res = timeDiff({
    date: new Date('2025-01-01'),
    color: false,
    now: new Date('2025-01-03'),
  })
  expect(res).toBe('-2d')
})

it.only('x', async () => {
  let res = timeDiff({
    date: new Date('2026-01-01'),
    color: false,
    // now: new Date('2025-01-03'),
  })
  console.log({ res })
})
