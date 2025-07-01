import { expect, describe, it } from 'vitest'
import { toDate } from './toDate.js'
import { isValid } from 'date-fns'

it('x', async () => {
  let week_date_iso = '2025-02-17T00:00:00.000Z'
  let feb_iso = '2025-02-01T00:00:00.000Z'

  expect(toDate('2025-W08').toISOString()).toBe(week_date_iso)
  expect(toDate('2025-W8').toISOString()).toBe(week_date_iso)
  expect(toDate('2025-w8').toISOString()).toBe(week_date_iso)
  expect(toDate('2025-02-17').toISOString()).toBe(week_date_iso)
  expect(toDate('2025-02').toISOString()).toBe('2025-02-01T00:00:00.000Z')
  expect(toDate('2025-feb').toISOString()).toBe(feb_iso)
  expect(toDate('2025-february').toISOString()).toBe(feb_iso)
})

it('x', async () => {
  let res = toDate('2024-01-26')
  expect(res.toISOString()).toBe('2024-01-26T00:00:00.000Z')

  expect(toDate('2024-01').toISOString()).toBe('2024-01-01T00:00:00.000Z')
  expect(toDate('2024').toISOString()).toBe('2024-01-01T00:00:00.000Z')
})

it('x', async () => {
  let res = toDate('Feb 26, 2024')
  expect(isValid(res)).toBe(true)

  res = toDate('2024-02-26')
  expect(isValid(res)).toBe(true)
})
