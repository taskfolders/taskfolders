import { expect, describe, it } from 'vitest'
import { weekISO, parseFuzzyDate } from './helpers.draft.js'

describe('x', () => {
  it('ISO week', async () => {
    let sut = weekISO
    let s1 = sut.format(new Date('2020-01-08'))
    expect(s1).toBe('2020-W02')

    let s2 = sut.parse('2020-W10')
    expect(s2.toISOString()).toBe('2020-03-04T00:00:00.000Z')

    expect(sut.test('2020-W10')).toBe(true)
    expect(sut.test('2020-10')).toBe(false)
  })

  it('parse fuzzy date', async () => {
    let s1 = parseFuzzyDate('2020-W10')
    expect(s1.toISOString()).toBe('2020-03-04T00:00:00.000Z')

    let s2 = parseFuzzyDate('2020-03-04')
    expect(s2.toISOString()).toBe('2020-03-04T00:00:00.000Z')
  })

  it('invalid date', async () => {
    let s1 = parseFuzzyDate('bogus')
    expect(s1).toBe(undefined)
  })
  //
})
