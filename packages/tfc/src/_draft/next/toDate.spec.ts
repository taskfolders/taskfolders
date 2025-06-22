import { expect, describe, it } from 'vitest'
import { toDate } from './toDate.js'

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
