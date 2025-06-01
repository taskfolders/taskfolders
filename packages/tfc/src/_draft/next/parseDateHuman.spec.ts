import { expect, describe, it } from 'vitest'
import * as TZ from 'date-fns-tz'
import { parse, isValid } from 'date-fns'
import { parseDateHuman } from './parseDateHuman.js'

it('x', async () => {
  let res = parseDateHuman('2024-01-26')
  expect(res.toISOString()).toBe('2024-01-26T00:00:00.000Z')
})

it('x', async () => {
  let res = parseDateHuman('Feb 26, 2024')
  expect(isValid(res)).toBe(true)
  console.log({ res })

  res = parseDateHuman('2024-02-26')
  expect(isValid(res)).toBe(true)
})
