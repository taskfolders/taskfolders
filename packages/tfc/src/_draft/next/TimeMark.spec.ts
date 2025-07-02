import { expect, it } from 'vitest'
import { TimeMark } from './TimeMark.js'

it('x after-v2', () => {
  let sut = TimeMark.fromValue('2025')
  expect(sut.value).toBe('2025')
  expect(sut.type).toBe('date')
  expect(sut.date.toISOString()).toBe('2025-01-01T00:00:00.000Z')

  sut = TimeMark.fromValue('2025-W02')
  expect(sut.date.toISOString()).toBe('2025-01-06T00:00:00.000Z')
  expect(sut.type).toBe('date')
  console.log(sut)
  //sut = TimeMark.fromValue('2w', { now: new Date('2025-01-01') })
  sut = TimeMark.fromValue('2w')
  expect(sut.type).toBe('relative')
  let now = new Date('2025-01-01')
  console.log(sut)

  sut = TimeMark.fromValue('panda-event')
  expect(sut.type).toBe('milestone')
  //    sut.panda
  console.log(sut)
})
